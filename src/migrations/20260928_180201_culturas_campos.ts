import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_cultures_aparencia_cor_catalogo" AS ENUM('from-green-600 to-green-800', 'from-yellow-500 to-amber-700', 'from-amber-700 to-orange-900', 'from-lime-500 to-green-700', 'from-blue-100 to-slate-300', 'from-orange-800 to-red-900', 'from-orange-400 to-orange-600', 'from-amber-200 to-yellow-600', 'from-red-500 to-red-700', 'from-green-400 to-green-600');
  CREATE TYPE "public"."enum_cultures_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__cultures_v_version_aparencia_cor_catalogo" AS ENUM('from-green-600 to-green-800', 'from-yellow-500 to-amber-700', 'from-amber-700 to-orange-900', 'from-lime-500 to-green-700', 'from-blue-100 to-slate-300', 'from-orange-800 to-red-900', 'from-orange-400 to-orange-600', 'from-amber-200 to-yellow-600', 'from-red-500 to-red-700', 'from-green-400 to-green-600');
  CREATE TYPE "public"."enum__cultures_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__cultures_v_published_locale" AS ENUM('pt-BR', 'en', 'es');
  CREATE TABLE "cultures_lista_desafios" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "cultures_lista_desafios_locales" (
  	"etapa" varchar,
  	"titulo" varchar,
  	"descricao" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "cultures_fases_manejo_itens" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "cultures_fases_manejo_itens_locales" (
  	"produto" varchar,
  	"dose" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "cultures_fases_manejo" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "cultures_fases_manejo_locales" (
  	"rotulo" varchar,
  	"fase" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "cultures_recomendados" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"produto_id" integer
  );
  
  CREATE TABLE "cultures_recomendados_locales" (
  	"tag" varchar,
  	"descricao" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "_cultures_v_version_lista_desafios" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_cultures_v_version_lista_desafios_locales" (
  	"etapa" varchar,
  	"titulo" varchar,
  	"descricao" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_cultures_v_version_fases_manejo_itens" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_cultures_v_version_fases_manejo_itens_locales" (
  	"produto" varchar,
  	"dose" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_cultures_v_version_fases_manejo" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_cultures_v_version_fases_manejo_locales" (
  	"rotulo" varchar,
  	"fase" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_cultures_v_version_recomendados" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"produto_id" integer,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_cultures_v_version_recomendados_locales" (
  	"tag" varchar,
  	"descricao" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
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
  
  CREATE TABLE "_cultures_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_slug" varchar,
  	"version_ordem" numeric DEFAULT 100,
  	"version_foto_id" integer,
  	"version_aparencia_gradiente_hero" varchar,
  	"version_aparencia_fundo_home" varchar,
  	"version_aparencia_cor_catalogo" "enum__cultures_v_version_aparencia_cor_catalogo",
  	"version_aparencia_texto_escuro" boolean,
  	"version_nome_cientifico" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__cultures_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__cultures_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_cultures_v_locales" (
  	"version_nome" varchar,
  	"version_etiqueta" varchar,
  	"version_descricao" varchar,
  	"version_lista_atuacao" varchar,
  	"version_nota_manejo" varchar,
  	"version_fonte" varchar,
  	"version_preposicoes_em" varchar,
  	"version_preposicoes_de" varchar,
  	"version_preposicoes_para" varchar,
  	"version_preposicoes_sua" varchar,
  	"version_introducao" jsonb,
  	"version_como_atua" jsonb,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "_cultures_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"products_id" integer
  );
  
  ALTER TABLE "cultures" ALTER COLUMN "slug" DROP NOT NULL;
  ALTER TABLE "cultures_locales" ALTER COLUMN "nome" DROP NOT NULL;
  ALTER TABLE "cultures" ADD COLUMN "ordem" numeric DEFAULT 100;
  ALTER TABLE "cultures" ADD COLUMN "aparencia_gradiente_hero" varchar;
  ALTER TABLE "cultures" ADD COLUMN "aparencia_fundo_home" varchar;
  ALTER TABLE "cultures" ADD COLUMN "aparencia_cor_catalogo" "enum_cultures_aparencia_cor_catalogo";
  ALTER TABLE "cultures" ADD COLUMN "aparencia_texto_escuro" boolean;
  ALTER TABLE "cultures" ADD COLUMN "_status" "enum_cultures_status" DEFAULT 'draft';
  ALTER TABLE "cultures_locales" ADD COLUMN "etiqueta" varchar;
  ALTER TABLE "cultures_locales" ADD COLUMN "descricao" varchar;
  ALTER TABLE "cultures_locales" ADD COLUMN "lista_atuacao" varchar;
  ALTER TABLE "cultures_locales" ADD COLUMN "nota_manejo" varchar;
  ALTER TABLE "cultures_locales" ADD COLUMN "fonte" varchar;
  ALTER TABLE "cultures_locales" ADD COLUMN "preposicoes_em" varchar;
  ALTER TABLE "cultures_locales" ADD COLUMN "preposicoes_de" varchar;
  ALTER TABLE "cultures_locales" ADD COLUMN "preposicoes_para" varchar;
  ALTER TABLE "cultures_locales" ADD COLUMN "preposicoes_sua" varchar;
  ALTER TABLE "cultures_lista_desafios" ADD CONSTRAINT "cultures_lista_desafios_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cultures"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cultures_lista_desafios_locales" ADD CONSTRAINT "cultures_lista_desafios_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cultures_lista_desafios"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cultures_fases_manejo_itens" ADD CONSTRAINT "cultures_fases_manejo_itens_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cultures_fases_manejo"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cultures_fases_manejo_itens_locales" ADD CONSTRAINT "cultures_fases_manejo_itens_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cultures_fases_manejo_itens"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cultures_fases_manejo" ADD CONSTRAINT "cultures_fases_manejo_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cultures"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cultures_fases_manejo_locales" ADD CONSTRAINT "cultures_fases_manejo_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cultures_fases_manejo"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cultures_recomendados" ADD CONSTRAINT "cultures_recomendados_produto_id_products_id_fk" FOREIGN KEY ("produto_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "cultures_recomendados" ADD CONSTRAINT "cultures_recomendados_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cultures"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "cultures_recomendados_locales" ADD CONSTRAINT "cultures_recomendados_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."cultures_recomendados"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_cultures_v_version_lista_desafios" ADD CONSTRAINT "_cultures_v_version_lista_desafios_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_cultures_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_cultures_v_version_lista_desafios_locales" ADD CONSTRAINT "_cultures_v_version_lista_desafios_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_cultures_v_version_lista_desafios"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_cultures_v_version_fases_manejo_itens" ADD CONSTRAINT "_cultures_v_version_fases_manejo_itens_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_cultures_v_version_fases_manejo"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_cultures_v_version_fases_manejo_itens_locales" ADD CONSTRAINT "_cultures_v_version_fases_manejo_itens_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_cultures_v_version_fases_manejo_itens"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_cultures_v_version_fases_manejo" ADD CONSTRAINT "_cultures_v_version_fases_manejo_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_cultures_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_cultures_v_version_fases_manejo_locales" ADD CONSTRAINT "_cultures_v_version_fases_manejo_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_cultures_v_version_fases_manejo"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_cultures_v_version_recomendados" ADD CONSTRAINT "_cultures_v_version_recomendados_produto_id_products_id_fk" FOREIGN KEY ("produto_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_cultures_v_version_recomendados" ADD CONSTRAINT "_cultures_v_version_recomendados_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_cultures_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_cultures_v_version_recomendados_locales" ADD CONSTRAINT "_cultures_v_version_recomendados_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_cultures_v_version_recomendados"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_cultures_v_version_desafios" ADD CONSTRAINT "_cultures_v_version_desafios_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_cultures_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_cultures_v_version_manejo_por_fase" ADD CONSTRAINT "_cultures_v_version_manejo_por_fase_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_cultures_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_cultures_v" ADD CONSTRAINT "_cultures_v_parent_id_cultures_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."cultures"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_cultures_v" ADD CONSTRAINT "_cultures_v_version_foto_id_media_id_fk" FOREIGN KEY ("version_foto_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_cultures_v_locales" ADD CONSTRAINT "_cultures_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_cultures_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_cultures_v_rels" ADD CONSTRAINT "_cultures_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_cultures_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_cultures_v_rels" ADD CONSTRAINT "_cultures_v_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "cultures_lista_desafios_order_idx" ON "cultures_lista_desafios" USING btree ("_order");
  CREATE INDEX "cultures_lista_desafios_parent_id_idx" ON "cultures_lista_desafios" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "cultures_lista_desafios_locales_locale_parent_id_unique" ON "cultures_lista_desafios_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "cultures_fases_manejo_itens_order_idx" ON "cultures_fases_manejo_itens" USING btree ("_order");
  CREATE INDEX "cultures_fases_manejo_itens_parent_id_idx" ON "cultures_fases_manejo_itens" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "cultures_fases_manejo_itens_locales_locale_parent_id_unique" ON "cultures_fases_manejo_itens_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "cultures_fases_manejo_order_idx" ON "cultures_fases_manejo" USING btree ("_order");
  CREATE INDEX "cultures_fases_manejo_parent_id_idx" ON "cultures_fases_manejo" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "cultures_fases_manejo_locales_locale_parent_id_unique" ON "cultures_fases_manejo_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "cultures_recomendados_order_idx" ON "cultures_recomendados" USING btree ("_order");
  CREATE INDEX "cultures_recomendados_parent_id_idx" ON "cultures_recomendados" USING btree ("_parent_id");
  CREATE INDEX "cultures_recomendados_produto_idx" ON "cultures_recomendados" USING btree ("produto_id");
  CREATE UNIQUE INDEX "cultures_recomendados_locales_locale_parent_id_unique" ON "cultures_recomendados_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_cultures_v_version_lista_desafios_order_idx" ON "_cultures_v_version_lista_desafios" USING btree ("_order");
  CREATE INDEX "_cultures_v_version_lista_desafios_parent_id_idx" ON "_cultures_v_version_lista_desafios" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_cultures_v_version_lista_desafios_locales_locale_parent_id_" ON "_cultures_v_version_lista_desafios_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_cultures_v_version_fases_manejo_itens_order_idx" ON "_cultures_v_version_fases_manejo_itens" USING btree ("_order");
  CREATE INDEX "_cultures_v_version_fases_manejo_itens_parent_id_idx" ON "_cultures_v_version_fases_manejo_itens" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_cultures_v_version_fases_manejo_itens_locales_locale_parent" ON "_cultures_v_version_fases_manejo_itens_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_cultures_v_version_fases_manejo_order_idx" ON "_cultures_v_version_fases_manejo" USING btree ("_order");
  CREATE INDEX "_cultures_v_version_fases_manejo_parent_id_idx" ON "_cultures_v_version_fases_manejo" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "_cultures_v_version_fases_manejo_locales_locale_parent_id_un" ON "_cultures_v_version_fases_manejo_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_cultures_v_version_recomendados_order_idx" ON "_cultures_v_version_recomendados" USING btree ("_order");
  CREATE INDEX "_cultures_v_version_recomendados_parent_id_idx" ON "_cultures_v_version_recomendados" USING btree ("_parent_id");
  CREATE INDEX "_cultures_v_version_recomendados_produto_idx" ON "_cultures_v_version_recomendados" USING btree ("produto_id");
  CREATE UNIQUE INDEX "_cultures_v_version_recomendados_locales_locale_parent_id_un" ON "_cultures_v_version_recomendados_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_cultures_v_version_desafios_order_idx" ON "_cultures_v_version_desafios" USING btree ("_order");
  CREATE INDEX "_cultures_v_version_desafios_parent_id_idx" ON "_cultures_v_version_desafios" USING btree ("_parent_id");
  CREATE INDEX "_cultures_v_version_desafios_locale_idx" ON "_cultures_v_version_desafios" USING btree ("_locale");
  CREATE INDEX "_cultures_v_version_manejo_por_fase_order_idx" ON "_cultures_v_version_manejo_por_fase" USING btree ("_order");
  CREATE INDEX "_cultures_v_version_manejo_por_fase_parent_id_idx" ON "_cultures_v_version_manejo_por_fase" USING btree ("_parent_id");
  CREATE INDEX "_cultures_v_version_manejo_por_fase_locale_idx" ON "_cultures_v_version_manejo_por_fase" USING btree ("_locale");
  CREATE INDEX "_cultures_v_parent_idx" ON "_cultures_v" USING btree ("parent_id");
  CREATE INDEX "_cultures_v_version_version_slug_idx" ON "_cultures_v" USING btree ("version_slug");
  CREATE INDEX "_cultures_v_version_version_foto_idx" ON "_cultures_v" USING btree ("version_foto_id");
  CREATE INDEX "_cultures_v_version_version_updated_at_idx" ON "_cultures_v" USING btree ("version_updated_at");
  CREATE INDEX "_cultures_v_version_version_created_at_idx" ON "_cultures_v" USING btree ("version_created_at");
  CREATE INDEX "_cultures_v_version_version__status_idx" ON "_cultures_v" USING btree ("version__status");
  CREATE INDEX "_cultures_v_created_at_idx" ON "_cultures_v" USING btree ("created_at");
  CREATE INDEX "_cultures_v_updated_at_idx" ON "_cultures_v" USING btree ("updated_at");
  CREATE INDEX "_cultures_v_snapshot_idx" ON "_cultures_v" USING btree ("snapshot");
  CREATE INDEX "_cultures_v_published_locale_idx" ON "_cultures_v" USING btree ("published_locale");
  CREATE INDEX "_cultures_v_latest_idx" ON "_cultures_v" USING btree ("latest");
  CREATE INDEX "_cultures_v_autosave_idx" ON "_cultures_v" USING btree ("autosave");
  CREATE UNIQUE INDEX "_cultures_v_locales_locale_parent_id_unique" ON "_cultures_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "_cultures_v_rels_order_idx" ON "_cultures_v_rels" USING btree ("order");
  CREATE INDEX "_cultures_v_rels_parent_idx" ON "_cultures_v_rels" USING btree ("parent_id");
  CREATE INDEX "_cultures_v_rels_path_idx" ON "_cultures_v_rels" USING btree ("path");
  CREATE INDEX "_cultures_v_rels_products_id_idx" ON "_cultures_v_rels" USING btree ("products_id");
  CREATE INDEX "cultures__status_idx" ON "cultures" USING btree ("_status");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "cultures_lista_desafios" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "cultures_lista_desafios_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "cultures_fases_manejo_itens" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "cultures_fases_manejo_itens_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "cultures_fases_manejo" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "cultures_fases_manejo_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "cultures_recomendados" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "cultures_recomendados_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_cultures_v_version_lista_desafios" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_cultures_v_version_lista_desafios_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_cultures_v_version_fases_manejo_itens" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_cultures_v_version_fases_manejo_itens_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_cultures_v_version_fases_manejo" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_cultures_v_version_fases_manejo_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_cultures_v_version_recomendados" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_cultures_v_version_recomendados_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_cultures_v_version_desafios" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_cultures_v_version_manejo_por_fase" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_cultures_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_cultures_v_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_cultures_v_rels" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "cultures_lista_desafios" CASCADE;
  DROP TABLE "cultures_lista_desafios_locales" CASCADE;
  DROP TABLE "cultures_fases_manejo_itens" CASCADE;
  DROP TABLE "cultures_fases_manejo_itens_locales" CASCADE;
  DROP TABLE "cultures_fases_manejo" CASCADE;
  DROP TABLE "cultures_fases_manejo_locales" CASCADE;
  DROP TABLE "cultures_recomendados" CASCADE;
  DROP TABLE "cultures_recomendados_locales" CASCADE;
  DROP TABLE "_cultures_v_version_lista_desafios" CASCADE;
  DROP TABLE "_cultures_v_version_lista_desafios_locales" CASCADE;
  DROP TABLE "_cultures_v_version_fases_manejo_itens" CASCADE;
  DROP TABLE "_cultures_v_version_fases_manejo_itens_locales" CASCADE;
  DROP TABLE "_cultures_v_version_fases_manejo" CASCADE;
  DROP TABLE "_cultures_v_version_fases_manejo_locales" CASCADE;
  DROP TABLE "_cultures_v_version_recomendados" CASCADE;
  DROP TABLE "_cultures_v_version_recomendados_locales" CASCADE;
  DROP TABLE "_cultures_v_version_desafios" CASCADE;
  DROP TABLE "_cultures_v_version_manejo_por_fase" CASCADE;
  DROP TABLE "_cultures_v" CASCADE;
  DROP TABLE "_cultures_v_locales" CASCADE;
  DROP TABLE "_cultures_v_rels" CASCADE;
  DROP INDEX "cultures__status_idx";
  ALTER TABLE "cultures" ALTER COLUMN "slug" SET NOT NULL;
  ALTER TABLE "cultures_locales" ALTER COLUMN "nome" SET NOT NULL;
  ALTER TABLE "cultures" DROP COLUMN "ordem";
  ALTER TABLE "cultures" DROP COLUMN "aparencia_gradiente_hero";
  ALTER TABLE "cultures" DROP COLUMN "aparencia_fundo_home";
  ALTER TABLE "cultures" DROP COLUMN "aparencia_cor_catalogo";
  ALTER TABLE "cultures" DROP COLUMN "aparencia_texto_escuro";
  ALTER TABLE "cultures" DROP COLUMN "_status";
  ALTER TABLE "cultures_locales" DROP COLUMN "etiqueta";
  ALTER TABLE "cultures_locales" DROP COLUMN "descricao";
  ALTER TABLE "cultures_locales" DROP COLUMN "lista_atuacao";
  ALTER TABLE "cultures_locales" DROP COLUMN "nota_manejo";
  ALTER TABLE "cultures_locales" DROP COLUMN "fonte";
  ALTER TABLE "cultures_locales" DROP COLUMN "preposicoes_em";
  ALTER TABLE "cultures_locales" DROP COLUMN "preposicoes_de";
  ALTER TABLE "cultures_locales" DROP COLUMN "preposicoes_para";
  ALTER TABLE "cultures_locales" DROP COLUMN "preposicoes_sua";
  DROP TYPE "public"."enum_cultures_aparencia_cor_catalogo";
  DROP TYPE "public"."enum_cultures_status";
  DROP TYPE "public"."enum__cultures_v_version_aparencia_cor_catalogo";
  DROP TYPE "public"."enum__cultures_v_version_status";
  DROP TYPE "public"."enum__cultures_v_published_locale";`)
}
