import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_articles_categoria" AS ENUM('manejo', 'nutricao', 'pecuaria', 'pesquisa', 'sustentabilidade');
  CREATE TYPE "public"."enum_articles_cor" AS ENUM('from-green-700 to-emerald-950', 'from-green-600 to-green-800', 'from-teal-600 to-emerald-800', 'from-amber-600 to-orange-800', 'from-blue-600 to-indigo-800', 'from-purple-600 to-purple-900');
  CREATE TYPE "public"."enum_articles_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__articles_v_version_categoria" AS ENUM('manejo', 'nutricao', 'pecuaria', 'pesquisa', 'sustentabilidade');
  CREATE TYPE "public"."enum__articles_v_version_cor" AS ENUM('from-green-700 to-emerald-950', 'from-green-600 to-green-800', 'from-teal-600 to-emerald-800', 'from-amber-600 to-orange-800', 'from-blue-600 to-indigo-800', 'from-purple-600 to-purple-900');
  CREATE TYPE "public"."enum__articles_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__articles_v_published_locale" AS ENUM('pt-BR', 'en', 'es');
  CREATE TABLE "articles_secoes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"titulo" varchar,
  	"paragrafos" varchar
  );
  
  CREATE TABLE "_articles_v_version_secoes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"titulo" varchar,
  	"paragrafos" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_articles_v_version_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"tag" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_articles_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_slug" varchar,
  	"version_categoria" "enum__articles_v_version_categoria",
  	"version_data" timestamp(3) with time zone,
  	"version_destaque" boolean,
  	"version_destaque_home" boolean,
  	"version_tempo_leitura" numeric,
  	"version_tempo_leitura_manual" boolean,
  	"version_capa_id" integer,
  	"version_cor" "enum__articles_v_version_cor" DEFAULT 'from-green-700 to-emerald-950',
  	"version_autor" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__articles_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__articles_v_published_locale",
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "_articles_v_locales" (
  	"version_titulo" varchar,
  	"version_subtitulo" varchar,
  	"version_assinatura" varchar,
  	"version_introducao" varchar,
  	"version_citacao" varchar,
  	"version_conteudo" jsonb,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "articles" ALTER COLUMN "slug" DROP NOT NULL;
  ALTER TABLE "articles_locales" ALTER COLUMN "titulo" DROP NOT NULL;
  ALTER TABLE "articles" ADD COLUMN "categoria" "enum_articles_categoria";
  ALTER TABLE "articles" ADD COLUMN "destaque" boolean;
  ALTER TABLE "articles" ADD COLUMN "destaque_home" boolean;
  ALTER TABLE "articles" ADD COLUMN "tempo_leitura" numeric;
  ALTER TABLE "articles" ADD COLUMN "tempo_leitura_manual" boolean;
  ALTER TABLE "articles" ADD COLUMN "cor" "enum_articles_cor" DEFAULT 'from-green-700 to-emerald-950';
  ALTER TABLE "articles" ADD COLUMN "_status" "enum_articles_status" DEFAULT 'draft';
  ALTER TABLE "articles_locales" ADD COLUMN "subtitulo" varchar;
  ALTER TABLE "articles_locales" ADD COLUMN "assinatura" varchar;
  ALTER TABLE "articles_locales" ADD COLUMN "introducao" varchar;
  ALTER TABLE "articles_locales" ADD COLUMN "citacao" varchar;
  ALTER TABLE "articles_secoes" ADD CONSTRAINT "articles_secoes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_version_secoes" ADD CONSTRAINT "_articles_v_version_secoes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_version_tags" ADD CONSTRAINT "_articles_v_version_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_parent_id_articles_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."articles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_version_capa_id_media_id_fk" FOREIGN KEY ("version_capa_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v_locales" ADD CONSTRAINT "_articles_v_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "articles_secoes_order_idx" ON "articles_secoes" USING btree ("_order");
  CREATE INDEX "articles_secoes_parent_id_idx" ON "articles_secoes" USING btree ("_parent_id");
  CREATE INDEX "articles_secoes_locale_idx" ON "articles_secoes" USING btree ("_locale");
  CREATE INDEX "_articles_v_version_secoes_order_idx" ON "_articles_v_version_secoes" USING btree ("_order");
  CREATE INDEX "_articles_v_version_secoes_parent_id_idx" ON "_articles_v_version_secoes" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_version_secoes_locale_idx" ON "_articles_v_version_secoes" USING btree ("_locale");
  CREATE INDEX "_articles_v_version_tags_order_idx" ON "_articles_v_version_tags" USING btree ("_order");
  CREATE INDEX "_articles_v_version_tags_parent_id_idx" ON "_articles_v_version_tags" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_parent_idx" ON "_articles_v" USING btree ("parent_id");
  CREATE INDEX "_articles_v_version_version_slug_idx" ON "_articles_v" USING btree ("version_slug");
  CREATE INDEX "_articles_v_version_version_capa_idx" ON "_articles_v" USING btree ("version_capa_id");
  CREATE INDEX "_articles_v_version_version_updated_at_idx" ON "_articles_v" USING btree ("version_updated_at");
  CREATE INDEX "_articles_v_version_version_created_at_idx" ON "_articles_v" USING btree ("version_created_at");
  CREATE INDEX "_articles_v_version_version__status_idx" ON "_articles_v" USING btree ("version__status");
  CREATE INDEX "_articles_v_created_at_idx" ON "_articles_v" USING btree ("created_at");
  CREATE INDEX "_articles_v_updated_at_idx" ON "_articles_v" USING btree ("updated_at");
  CREATE INDEX "_articles_v_snapshot_idx" ON "_articles_v" USING btree ("snapshot");
  CREATE INDEX "_articles_v_published_locale_idx" ON "_articles_v" USING btree ("published_locale");
  CREATE INDEX "_articles_v_latest_idx" ON "_articles_v" USING btree ("latest");
  CREATE INDEX "_articles_v_autosave_idx" ON "_articles_v" USING btree ("autosave");
  CREATE UNIQUE INDEX "_articles_v_locales_locale_parent_id_unique" ON "_articles_v_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "articles__status_idx" ON "articles" USING btree ("_status");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "articles_secoes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_articles_v_version_secoes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_articles_v_version_tags" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_articles_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_articles_v_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "articles_secoes" CASCADE;
  DROP TABLE "_articles_v_version_secoes" CASCADE;
  DROP TABLE "_articles_v_version_tags" CASCADE;
  DROP TABLE "_articles_v" CASCADE;
  DROP TABLE "_articles_v_locales" CASCADE;
  DROP INDEX "articles__status_idx";
  ALTER TABLE "articles" ALTER COLUMN "slug" SET NOT NULL;
  ALTER TABLE "articles_locales" ALTER COLUMN "titulo" SET NOT NULL;
  ALTER TABLE "articles" DROP COLUMN "categoria";
  ALTER TABLE "articles" DROP COLUMN "destaque";
  ALTER TABLE "articles" DROP COLUMN "destaque_home";
  ALTER TABLE "articles" DROP COLUMN "tempo_leitura";
  ALTER TABLE "articles" DROP COLUMN "tempo_leitura_manual";
  ALTER TABLE "articles" DROP COLUMN "cor";
  ALTER TABLE "articles" DROP COLUMN "_status";
  ALTER TABLE "articles_locales" DROP COLUMN "subtitulo";
  ALTER TABLE "articles_locales" DROP COLUMN "assinatura";
  ALTER TABLE "articles_locales" DROP COLUMN "introducao";
  ALTER TABLE "articles_locales" DROP COLUMN "citacao";
  DROP TYPE "public"."enum_articles_categoria";
  DROP TYPE "public"."enum_articles_cor";
  DROP TYPE "public"."enum_articles_status";
  DROP TYPE "public"."enum__articles_v_version_categoria";
  DROP TYPE "public"."enum__articles_v_version_cor";
  DROP TYPE "public"."enum__articles_v_version_status";
  DROP TYPE "public"."enum__articles_v_published_locale";`)
}
