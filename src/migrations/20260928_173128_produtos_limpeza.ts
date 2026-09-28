import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "products_tamanhos" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_beneficios" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "products_resultados" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_version_tamanhos" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_version_beneficios" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_version_resultados" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "products_tamanhos" CASCADE;
  DROP TABLE "products_beneficios" CASCADE;
  DROP TABLE "products_resultados" CASCADE;
  DROP TABLE "_products_v_version_tamanhos" CASCADE;
  DROP TABLE "_products_v_version_beneficios" CASCADE;
  DROP TABLE "_products_v_version_resultados" CASCADE;
  ALTER TABLE "products_rels" DROP CONSTRAINT "products_rels_cultures_fk";
  
  ALTER TABLE "_products_v_rels" DROP CONSTRAINT "_products_v_rels_cultures_fk";
  
  DROP INDEX "products_rels_cultures_id_idx";
  DROP INDEX "_products_v_rels_cultures_id_idx";
  ALTER TABLE "products" DROP COLUMN "linha";
  ALTER TABLE "products" DROP COLUMN "cor_fundo";
  ALTER TABLE "products" DROP COLUMN "texto_claro";
  ALTER TABLE "products" DROP COLUMN "ordem_catalogo";
  ALTER TABLE "products" DROP COLUMN "destaque_home";
  ALTER TABLE "products_locales" DROP COLUMN "descricao_curta";
  ALTER TABLE "products_locales" DROP COLUMN "descricao_completa";
  ALTER TABLE "products_locales" DROP COLUMN "modo_uso";
  ALTER TABLE "products_rels" DROP COLUMN "cultures_id";
  ALTER TABLE "_products_v" DROP COLUMN "version_linha";
  ALTER TABLE "_products_v" DROP COLUMN "version_cor_fundo";
  ALTER TABLE "_products_v" DROP COLUMN "version_texto_claro";
  ALTER TABLE "_products_v" DROP COLUMN "version_ordem_catalogo";
  ALTER TABLE "_products_v" DROP COLUMN "version_destaque_home";
  ALTER TABLE "_products_v_locales" DROP COLUMN "version_descricao_curta";
  ALTER TABLE "_products_v_locales" DROP COLUMN "version_descricao_completa";
  ALTER TABLE "_products_v_locales" DROP COLUMN "version_modo_uso";
  ALTER TABLE "_products_v_rels" DROP COLUMN "cultures_id";
  DROP TYPE "public"."enum_products_tamanhos";
  DROP TYPE "public"."enum_products_linha";
  DROP TYPE "public"."enum__products_v_version_tamanhos";
  DROP TYPE "public"."enum__products_v_version_linha";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_products_tamanhos" AS ENUM('1l', '10l', '20l');
  CREATE TYPE "public"."enum_products_linha" AS ENUM('arranque-inicial', 'nutricao-fisiologia', 'protecao-cultivos', 'tecnologia-aplicacao', 'manejos-integrados');
  CREATE TYPE "public"."enum__products_v_version_tamanhos" AS ENUM('1l', '10l', '20l');
  CREATE TYPE "public"."enum__products_v_version_linha" AS ENUM('arranque-inicial', 'nutricao-fisiologia', 'protecao-cultivos', 'tecnologia-aplicacao', 'manejos-integrados');
  CREATE TABLE "products_tamanhos" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_products_tamanhos",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "products_beneficios" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"texto" varchar
  );
  
  CREATE TABLE "products_resultados" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"valor" varchar,
  	"fonte" varchar,
  	"cultura" varchar
  );
  
  CREATE TABLE "_products_v_version_tamanhos" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__products_v_version_tamanhos",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_products_v_version_beneficios" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"texto" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_resultados" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"valor" varchar,
  	"fonte" varchar,
  	"cultura" varchar,
  	"_uuid" varchar
  );
  
  ALTER TABLE "products" ADD COLUMN "linha" "enum_products_linha";
  ALTER TABLE "products" ADD COLUMN "cor_fundo" varchar;
  ALTER TABLE "products" ADD COLUMN "texto_claro" boolean DEFAULT true;
  ALTER TABLE "products" ADD COLUMN "ordem_catalogo" numeric;
  ALTER TABLE "products" ADD COLUMN "destaque_home" boolean;
  ALTER TABLE "products_locales" ADD COLUMN "descricao_curta" varchar;
  ALTER TABLE "products_locales" ADD COLUMN "descricao_completa" jsonb;
  ALTER TABLE "products_locales" ADD COLUMN "modo_uso" jsonb;
  ALTER TABLE "products_rels" ADD COLUMN "cultures_id" integer;
  ALTER TABLE "_products_v" ADD COLUMN "version_linha" "enum__products_v_version_linha";
  ALTER TABLE "_products_v" ADD COLUMN "version_cor_fundo" varchar;
  ALTER TABLE "_products_v" ADD COLUMN "version_texto_claro" boolean DEFAULT true;
  ALTER TABLE "_products_v" ADD COLUMN "version_ordem_catalogo" numeric;
  ALTER TABLE "_products_v" ADD COLUMN "version_destaque_home" boolean;
  ALTER TABLE "_products_v_locales" ADD COLUMN "version_descricao_curta" varchar;
  ALTER TABLE "_products_v_locales" ADD COLUMN "version_descricao_completa" jsonb;
  ALTER TABLE "_products_v_locales" ADD COLUMN "version_modo_uso" jsonb;
  ALTER TABLE "_products_v_rels" ADD COLUMN "cultures_id" integer;
  ALTER TABLE "products_tamanhos" ADD CONSTRAINT "products_tamanhos_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_beneficios" ADD CONSTRAINT "products_beneficios_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "products_resultados" ADD CONSTRAINT "products_resultados_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_tamanhos" ADD CONSTRAINT "_products_v_version_tamanhos_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_beneficios" ADD CONSTRAINT "_products_v_version_beneficios_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_resultados" ADD CONSTRAINT "_products_v_version_resultados_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "products_tamanhos_order_idx" ON "products_tamanhos" USING btree ("order");
  CREATE INDEX "products_tamanhos_parent_idx" ON "products_tamanhos" USING btree ("parent_id");
  CREATE INDEX "products_beneficios_order_idx" ON "products_beneficios" USING btree ("_order");
  CREATE INDEX "products_beneficios_parent_id_idx" ON "products_beneficios" USING btree ("_parent_id");
  CREATE INDEX "products_beneficios_locale_idx" ON "products_beneficios" USING btree ("_locale");
  CREATE INDEX "products_resultados_order_idx" ON "products_resultados" USING btree ("_order");
  CREATE INDEX "products_resultados_parent_id_idx" ON "products_resultados" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_tamanhos_order_idx" ON "_products_v_version_tamanhos" USING btree ("order");
  CREATE INDEX "_products_v_version_tamanhos_parent_idx" ON "_products_v_version_tamanhos" USING btree ("parent_id");
  CREATE INDEX "_products_v_version_beneficios_order_idx" ON "_products_v_version_beneficios" USING btree ("_order");
  CREATE INDEX "_products_v_version_beneficios_parent_id_idx" ON "_products_v_version_beneficios" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_beneficios_locale_idx" ON "_products_v_version_beneficios" USING btree ("_locale");
  CREATE INDEX "_products_v_version_resultados_order_idx" ON "_products_v_version_resultados" USING btree ("_order");
  CREATE INDEX "_products_v_version_resultados_parent_id_idx" ON "_products_v_version_resultados" USING btree ("_parent_id");
  ALTER TABLE "products_rels" ADD CONSTRAINT "products_rels_cultures_fk" FOREIGN KEY ("cultures_id") REFERENCES "public"."cultures"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_rels" ADD CONSTRAINT "_products_v_rels_cultures_fk" FOREIGN KEY ("cultures_id") REFERENCES "public"."cultures"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "products_rels_cultures_id_idx" ON "products_rels" USING btree ("cultures_id");
  CREATE INDEX "_products_v_rels_cultures_id_idx" ON "_products_v_rels" USING btree ("cultures_id");`)
}
