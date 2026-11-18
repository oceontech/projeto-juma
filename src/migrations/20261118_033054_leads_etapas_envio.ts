import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

/**
 * Etapas do lead pensadas para quem só passa o contato ao comercial:
 * Aguardando envio (novo) → Enviado ao comercial → Resolvido, ou Descartado.
 * "Em conversa" e "Negociando" viram "Enviado"; "Virou cliente" vira "Resolvido".
 * Também apaga o lead de teste do deploy (TESTE OCEON), que entrava nos números.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "leads" ALTER COLUMN "status" DROP DEFAULT;
  ALTER TABLE "leads" ALTER COLUMN "status" SET DATA TYPE text;
  UPDATE "leads" SET "status" = 'enviado' WHERE "status" IN ('em-contato', 'qualificado');
  UPDATE "leads" SET "status" = 'resolvido' WHERE "status" = 'convertido';
  DROP TYPE "public"."enum_leads_status";
  CREATE TYPE "public"."enum_leads_status" AS ENUM('novo', 'enviado', 'resolvido', 'descartado');
  ALTER TABLE "leads" ALTER COLUMN "status" SET DATA TYPE "public"."enum_leads_status" USING "status"::"public"."enum_leads_status";
  ALTER TABLE "leads" ALTER COLUMN "status" SET DEFAULT 'novo'::"public"."enum_leads_status";
  DELETE FROM "leads" WHERE "email" = 'teste-deploy@oceon.com.br' AND "nome" = 'TESTE OCEON (apagar)';`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // O lead de teste apagado não volta.
  await db.execute(sql`
  ALTER TABLE "leads" ALTER COLUMN "status" DROP DEFAULT;
  ALTER TABLE "leads" ALTER COLUMN "status" SET DATA TYPE text;
  UPDATE "leads" SET "status" = 'em-contato' WHERE "status" = 'enviado';
  UPDATE "leads" SET "status" = 'convertido' WHERE "status" = 'resolvido';
  DROP TYPE "public"."enum_leads_status";
  CREATE TYPE "public"."enum_leads_status" AS ENUM('novo', 'em-contato', 'qualificado', 'convertido', 'descartado');
  ALTER TABLE "leads" ALTER COLUMN "status" SET DATA TYPE "public"."enum_leads_status" USING "status"::"public"."enum_leads_status";
  ALTER TABLE "leads" ALTER COLUMN "status" SET DEFAULT 'novo'::"public"."enum_leads_status";`)
}
