import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "settings_locales" (
  	"horario" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "settings" ALTER COLUMN "whatsapp" SET DEFAULT '+55 19 99964-8186';
  ALTER TABLE "settings" ALTER COLUMN "telefone" SET DEFAULT '(19) 3891-6415';
  ALTER TABLE "settings" ALTER COLUMN "email" SET DEFAULT 'marketing@juma-agro.com.br';
  ALTER TABLE "settings" ALTER COLUMN "redes_instagram" SET DEFAULT 'https://www.instagram.com/jumaagro/';
  ALTER TABLE "settings" ALTER COLUMN "redes_tiktok" SET DEFAULT 'https://www.tiktok.com/@jumaagro';
  ALTER TABLE "settings" ALTER COLUMN "redes_youtube" SET DEFAULT 'https://www.youtube.com/@Juma-Agro30/videos';
  ALTER TABLE "settings" ALTER COLUMN "redes_linkedin" SET DEFAULT 'https://br.linkedin.com/company/juma-agro';
  ALTER TABLE "settings" ALTER COLUMN "redes_facebook" SET DEFAULT 'https://www.facebook.com/JumaAgro30/';
  ALTER TABLE "settings" ADD COLUMN "email_compras" varchar DEFAULT 'analucia@juma-agro.com.br';
  ALTER TABLE "settings" ADD COLUMN "email_r_h" varchar DEFAULT 'rh@juma-agro.com.br';
  ALTER TABLE "settings" ADD COLUMN "endereco_b_r_empresa" varchar DEFAULT 'Juma Agro Indústria e Comércio Ltda';
  ALTER TABLE "settings" ADD COLUMN "endereco_b_r_linhas" varchar DEFAULT 'R. Victor Acierini, 2.370 — Distrito Industrial
  Mogi Guaçu - SP, CEP 13.849-106';
  ALTER TABLE "settings" ADD COLUMN "endereco_u_s_empresa" varchar DEFAULT 'Juma-Agro Fertilizer LLC';
  ALTER TABLE "settings" ADD COLUMN "endereco_u_s_linhas" varchar DEFAULT '3928 Anchuca Drive, Suite 11
  Lakeland, FL 33811';
  ALTER TABLE "settings" ADD COLUMN "mapa" varchar DEFAULT 'Juma Agro, R. Victor Acierini, 2370, Mogi Guaçu - SP';
  ALTER TABLE "settings_locales" ADD CONSTRAINT "settings_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."settings"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "settings_locales_locale_parent_id_unique" ON "settings_locales" USING btree ("_locale","_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "settings_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "settings_locales" CASCADE;
  ALTER TABLE "settings" ALTER COLUMN "whatsapp" DROP DEFAULT;
  ALTER TABLE "settings" ALTER COLUMN "telefone" DROP DEFAULT;
  ALTER TABLE "settings" ALTER COLUMN "email" DROP DEFAULT;
  ALTER TABLE "settings" ALTER COLUMN "redes_instagram" DROP DEFAULT;
  ALTER TABLE "settings" ALTER COLUMN "redes_tiktok" DROP DEFAULT;
  ALTER TABLE "settings" ALTER COLUMN "redes_youtube" DROP DEFAULT;
  ALTER TABLE "settings" ALTER COLUMN "redes_linkedin" DROP DEFAULT;
  ALTER TABLE "settings" ALTER COLUMN "redes_facebook" DROP DEFAULT;
  ALTER TABLE "settings" DROP COLUMN "email_compras";
  ALTER TABLE "settings" DROP COLUMN "email_r_h";
  ALTER TABLE "settings" DROP COLUMN "endereco_b_r_empresa";
  ALTER TABLE "settings" DROP COLUMN "endereco_b_r_linhas";
  ALTER TABLE "settings" DROP COLUMN "endereco_u_s_empresa";
  ALTER TABLE "settings" DROP COLUMN "endereco_u_s_linhas";
  ALTER TABLE "settings" DROP COLUMN "mapa";`)
}
