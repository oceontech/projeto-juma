import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "cultures_desafios" CASCADE;
  DROP TABLE "cultures_manejo_por_fase" CASCADE;
  DROP TABLE "cultures_rels" CASCADE;
  DROP TABLE "_cultures_v_version_desafios" CASCADE;
  DROP TABLE "_cultures_v_version_manejo_por_fase" CASCADE;
  DROP TABLE "_cultures_v_rels" CASCADE;
  ALTER TABLE "cultures" DROP COLUMN "aparencia_cor_catalogo";
  ALTER TABLE "cultures" DROP COLUMN "aparencia_texto_escuro";
  ALTER TABLE "cultures" DROP COLUMN "nome_cientifico";
  ALTER TABLE "cultures_locales" DROP COLUMN "introducao";
  ALTER TABLE "cultures_locales" DROP COLUMN "como_atua";
  ALTER TABLE "_cultures_v" DROP COLUMN "version_aparencia_cor_catalogo";
  ALTER TABLE "_cultures_v" DROP COLUMN "version_aparencia_texto_escuro";
  ALTER TABLE "_cultures_v" DROP COLUMN "version_nome_cientifico";
  ALTER TABLE "_cultures_v_locales" DROP COLUMN "version_introducao";
  ALTER TABLE "_cultures_v_locales" DROP COLUMN "version_como_atua";
  DROP TYPE "public"."enum_cultures_aparencia_cor_catalogo";
  DROP TYPE "public"."enum__cultures_v_version_aparencia_cor_catalogo";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_cultures_aparencia_cor_catalogo" AS ENUM('from-green-600 to-green-800', 'from-yellow-500 to-amber-700', 'from-amber-700 to-orange-900', 'from-lime-500 to-green-700', 'from-blue-100 to-slate-300', 'from-orange-800 to-red-900', 'from-orange-400 to-orange-600', 'from-amber-200 to-yellow-600', 'from-red-500 to-red-700', 'from-green-400 to-green-600');
  CREATE TYPE "public"."enum__cultures_v_version_aparencia_cor_catalogo" AS ENUM('from-green-600 to-green-800', 'from-yellow-500 to-amber-700', 'from-amber-700 to-orange-900', 'from-lime-500 to-green-700', 'from-blue-100 to-slate-300', 'from-orange-800 to-red-900', 'from-orange-400 to-orange-600', 'from-amber-200 to-yellow-600', 'from-red-500 to-red-700', 'from-green-400 to-green-600');
  CREATE TABLE "cultures_desafios" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"titulo" varchar,
  	"descricao" varchar
  );
  
  CREATE TABLE "cultures_manejo_por_fase" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"fase" varchar,
  	"produtos" varchar
  );
  
  CREATE TABLE "cultures_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"products_id" integer
  );
  
  CREATE TABLE "_cultures_v_version_desafios" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"titulo" varchar,
  	"descricao" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_cultures_v_version_manejo_por_fase" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"fase" varchar,
  	"produtos" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_cultures_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"products_id" integer
  );
  
  ALTER TABLE "cultures" ADD COLUMN "aparencia_cor_catalogo" "enum_cultures_aparencia_cor_catalogo";
  ALTER TABLE "cultures" ADD COLUMN "aparencia_texto_escuro" boolean;
  ALTER TABLE "cultures" ADD COLUMN "nome_cientifico" varchar;
  ALTER TABLE "cultures_locales" ADD COLUMN "introducao" jsonb;
  ALTER TABLE "cultures_locales" ADD COLUMN "como_atua" jsonb;
  ALTER TABLE "_cultures_v" ADD COLUMN "version_aparencia_cor_catalogo" "enum__cultures_v_version_aparencia_cor_catalogo";
  ALTER TABLE "_cultures_v" ADD COLUMN "version_aparencia_texto_escuro" boolean;
  ALTER TABLE "_cultures_v" ADD COLUMN "version_nome_cientifico" varchar;
  ALTER TABLE "_cultures_v_locales" ADD COLUMN "version_introducao" jsonb;
  ALTER TABLE "_cultures_v_locales" ADD COLUMN "version_como_atua" jsonb;
  ALTER TABLE "cultures_desafios" ADD CONSTRAINT "cultures_desafios_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cultures"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cultures_manejo_por_fase" ADD CONSTRAINT "cultures_manejo_por_fase_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cultures"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cultures_rels" ADD CONSTRAINT "cultures_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."cultures"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cultures_rels" ADD CONSTRAINT "cultures_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_cultures_v_version_desafios" ADD CONSTRAINT "_cultures_v_version_desafios_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_cultures_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_cultures_v_version_manejo_por_fase" ADD CONSTRAINT "_cultures_v_version_manejo_por_fase_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_cultures_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_cultures_v_rels" ADD CONSTRAINT "_cultures_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_cultures_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_cultures_v_rels" ADD CONSTRAINT "_cultures_v_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "cultures_desafios_order_idx" ON "cultures_desafios" USING btree ("_order");
  CREATE INDEX "cultures_desafios_parent_id_idx" ON "cultures_desafios" USING btree ("_parent_id");
  CREATE INDEX "cultures_desafios_locale_idx" ON "cultures_desafios" USING btree ("_locale");
  CREATE INDEX "cultures_manejo_por_fase_order_idx" ON "cultures_manejo_por_fase" USING btree ("_order");
  CREATE INDEX "cultures_manejo_por_fase_parent_id_idx" ON "cultures_manejo_por_fase" USING btree ("_parent_id");
  CREATE INDEX "cultures_manejo_por_fase_locale_idx" ON "cultures_manejo_por_fase" USING btree ("_locale");
  CREATE INDEX "cultures_rels_order_idx" ON "cultures_rels" USING btree ("order");
  CREATE INDEX "cultures_rels_parent_idx" ON "cultures_rels" USING btree ("parent_id");
  CREATE INDEX "cultures_rels_path_idx" ON "cultures_rels" USING btree ("path");
  CREATE INDEX "cultures_rels_products_id_idx" ON "cultures_rels" USING btree ("products_id");
  CREATE INDEX "_cultures_v_version_desafios_order_idx" ON "_cultures_v_version_desafios" USING btree ("_order");
  CREATE INDEX "_cultures_v_version_desafios_parent_id_idx" ON "_cultures_v_version_desafios" USING btree ("_parent_id");
  CREATE INDEX "_cultures_v_version_desafios_locale_idx" ON "_cultures_v_version_desafios" USING btree ("_locale");
  CREATE INDEX "_cultures_v_version_manejo_por_fase_order_idx" ON "_cultures_v_version_manejo_por_fase" USING btree ("_order");
  CREATE INDEX "_cultures_v_version_manejo_por_fase_parent_id_idx" ON "_cultures_v_version_manejo_por_fase" USING btree ("_parent_id");
  CREATE INDEX "_cultures_v_version_manejo_por_fase_locale_idx" ON "_cultures_v_version_manejo_por_fase" USING btree ("_locale");
  CREATE INDEX "_cultures_v_rels_order_idx" ON "_cultures_v_rels" USING btree ("order");
  CREATE INDEX "_cultures_v_rels_parent_idx" ON "_cultures_v_rels" USING btree ("parent_id");
  CREATE INDEX "_cultures_v_rels_path_idx" ON "_cultures_v_rels" USING btree ("path");
  CREATE INDEX "_cultures_v_rels_products_id_idx" ON "_cultures_v_rels" USING btree ("products_id");`)
}
