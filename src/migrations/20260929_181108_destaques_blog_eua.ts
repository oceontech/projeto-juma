import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_posts_us_category" AS ENUM('field-notes', 'crop-nutrition', 'trials', 'company');
  CREATE TYPE "public"."enum_posts_us_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__posts_us_v_version_category" AS ENUM('field-notes', 'crop-nutrition', 'trials', 'company');
  CREATE TYPE "public"."enum__posts_us_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__posts_us_v_published_locale" AS ENUM('pt-BR', 'en', 'es');
  CREATE TYPE "public"."enum_destaques_aminosan_beneficios_icone" AS ENUM('recovery', 'leaf', 'bloom', 'sprout', 'roots', 'shield', 'bug', 'molecule', 'award', 'energy', 'metabolism');
  CREATE TYPE "public"."enum_destaques_produtos_beneficios_icone" AS ENUM('recovery', 'leaf', 'bloom', 'sprout', 'roots', 'shield', 'bug', 'molecule', 'award', 'energy', 'metabolism');
  CREATE TABLE "posts_us" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"excerpt" varchar,
  	"cover_id" integer,
  	"body" jsonb,
  	"slug" varchar,
  	"date" timestamp(3) with time zone,
  	"author" varchar,
  	"category" "enum_posts_us_category",
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_posts_us_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_posts_us_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_excerpt" varchar,
  	"version_cover_id" integer,
  	"version_body" jsonb,
  	"version_slug" varchar,
  	"version_date" timestamp(3) with time zone,
  	"version_author" varchar,
  	"version_category" "enum__posts_us_v_version_category",
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__posts_us_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"snapshot" boolean,
  	"published_locale" "enum__posts_us_v_published_locale",
  	"latest" boolean
  );
  
  CREATE TABLE "destaques_aminosan_beneficios" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icone" "enum_destaques_aminosan_beneficios_icone" NOT NULL
  );
  
  CREATE TABLE "destaques_aminosan_beneficios_locales" (
  	"titulo" varchar NOT NULL,
  	"apoio" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "destaques_produtos_beneficios" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icone" "enum_destaques_produtos_beneficios_icone" NOT NULL
  );
  
  CREATE TABLE "destaques_produtos_beneficios_locales" (
  	"titulo" varchar NOT NULL,
  	"apoio" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "destaques_produtos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"produto_id" integer NOT NULL,
  	"titulo" varchar,
  	"cor_fundo" varchar DEFAULT '#062418' NOT NULL,
  	"cor_destaque" varchar DEFAULT '#f2c94c' NOT NULL
  );
  
  CREATE TABLE "destaques_produtos_locales" (
  	"descricao" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" varchar NOT NULL
  );
  
  CREATE TABLE "destaques" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "destaques_locales" (
  	"aminosan_descricao" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "settings_us" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"email" varchar,
  	"phone" varchar,
  	"hours" varchar,
  	"company" varchar DEFAULT 'Juma-Agro Fertilizer LLC',
  	"address" varchar DEFAULT '3928 Anchuca Drive, Suite 11
  Lakeland, FL 33811',
  	"social_instagram" varchar,
  	"social_facebook" varchar,
  	"social_linkedin" varchar,
  	"social_youtube" varchar,
  	"social_x" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "posts_us_id" integer;
  ALTER TABLE "posts_us" ADD CONSTRAINT "posts_us_cover_id_media_id_fk" FOREIGN KEY ("cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_us_v" ADD CONSTRAINT "_posts_us_v_parent_id_posts_us_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts_us"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_us_v" ADD CONSTRAINT "_posts_us_v_version_cover_id_media_id_fk" FOREIGN KEY ("version_cover_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "destaques_aminosan_beneficios" ADD CONSTRAINT "destaques_aminosan_beneficios_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."destaques"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "destaques_aminosan_beneficios_locales" ADD CONSTRAINT "destaques_aminosan_beneficios_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."destaques_aminosan_beneficios"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "destaques_produtos_beneficios" ADD CONSTRAINT "destaques_produtos_beneficios_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."destaques_produtos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "destaques_produtos_beneficios_locales" ADD CONSTRAINT "destaques_produtos_beneficios_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."destaques_produtos_beneficios"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "destaques_produtos" ADD CONSTRAINT "destaques_produtos_produto_id_products_id_fk" FOREIGN KEY ("produto_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "destaques_produtos" ADD CONSTRAINT "destaques_produtos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."destaques"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "destaques_produtos_locales" ADD CONSTRAINT "destaques_produtos_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."destaques_produtos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "destaques_locales" ADD CONSTRAINT "destaques_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."destaques"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "posts_us_cover_idx" ON "posts_us" USING btree ("cover_id");
  CREATE UNIQUE INDEX "posts_us_slug_idx" ON "posts_us" USING btree ("slug");
  CREATE INDEX "posts_us_updated_at_idx" ON "posts_us" USING btree ("updated_at");
  CREATE INDEX "posts_us_created_at_idx" ON "posts_us" USING btree ("created_at");
  CREATE INDEX "posts_us__status_idx" ON "posts_us" USING btree ("_status");
  CREATE INDEX "_posts_us_v_parent_idx" ON "_posts_us_v" USING btree ("parent_id");
  CREATE INDEX "_posts_us_v_version_version_cover_idx" ON "_posts_us_v" USING btree ("version_cover_id");
  CREATE INDEX "_posts_us_v_version_version_slug_idx" ON "_posts_us_v" USING btree ("version_slug");
  CREATE INDEX "_posts_us_v_version_version_updated_at_idx" ON "_posts_us_v" USING btree ("version_updated_at");
  CREATE INDEX "_posts_us_v_version_version_created_at_idx" ON "_posts_us_v" USING btree ("version_created_at");
  CREATE INDEX "_posts_us_v_version_version__status_idx" ON "_posts_us_v" USING btree ("version__status");
  CREATE INDEX "_posts_us_v_created_at_idx" ON "_posts_us_v" USING btree ("created_at");
  CREATE INDEX "_posts_us_v_updated_at_idx" ON "_posts_us_v" USING btree ("updated_at");
  CREATE INDEX "_posts_us_v_snapshot_idx" ON "_posts_us_v" USING btree ("snapshot");
  CREATE INDEX "_posts_us_v_published_locale_idx" ON "_posts_us_v" USING btree ("published_locale");
  CREATE INDEX "_posts_us_v_latest_idx" ON "_posts_us_v" USING btree ("latest");
  CREATE INDEX "destaques_aminosan_beneficios_order_idx" ON "destaques_aminosan_beneficios" USING btree ("_order");
  CREATE INDEX "destaques_aminosan_beneficios_parent_id_idx" ON "destaques_aminosan_beneficios" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "destaques_aminosan_beneficios_locales_locale_parent_id_uniqu" ON "destaques_aminosan_beneficios_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "destaques_produtos_beneficios_order_idx" ON "destaques_produtos_beneficios" USING btree ("_order");
  CREATE INDEX "destaques_produtos_beneficios_parent_id_idx" ON "destaques_produtos_beneficios" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "destaques_produtos_beneficios_locales_locale_parent_id_uniqu" ON "destaques_produtos_beneficios_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "destaques_produtos_order_idx" ON "destaques_produtos" USING btree ("_order");
  CREATE INDEX "destaques_produtos_parent_id_idx" ON "destaques_produtos" USING btree ("_parent_id");
  CREATE INDEX "destaques_produtos_produto_idx" ON "destaques_produtos" USING btree ("produto_id");
  CREATE UNIQUE INDEX "destaques_produtos_locales_locale_parent_id_unique" ON "destaques_produtos_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "destaques_locales_locale_parent_id_unique" ON "destaques_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_posts_us_fk" FOREIGN KEY ("posts_us_id") REFERENCES "public"."posts_us"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_posts_us_id_idx" ON "payload_locked_documents_rels" USING btree ("posts_us_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "posts_us" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_us_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "destaques_aminosan_beneficios" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "destaques_aminosan_beneficios_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "destaques_produtos_beneficios" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "destaques_produtos_beneficios_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "destaques_produtos" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "destaques_produtos_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "destaques" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "destaques_locales" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "settings_us" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "posts_us" CASCADE;
  DROP TABLE "_posts_us_v" CASCADE;
  DROP TABLE "destaques_aminosan_beneficios" CASCADE;
  DROP TABLE "destaques_aminosan_beneficios_locales" CASCADE;
  DROP TABLE "destaques_produtos_beneficios" CASCADE;
  DROP TABLE "destaques_produtos_beneficios_locales" CASCADE;
  DROP TABLE "destaques_produtos" CASCADE;
  DROP TABLE "destaques_produtos_locales" CASCADE;
  DROP TABLE "destaques" CASCADE;
  DROP TABLE "destaques_locales" CASCADE;
  DROP TABLE "settings_us" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_posts_us_fk";
  
  DROP INDEX "payload_locked_documents_rels_posts_us_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "posts_us_id";
  DROP TYPE "public"."enum_posts_us_category";
  DROP TYPE "public"."enum_posts_us_status";
  DROP TYPE "public"."enum__posts_us_v_version_category";
  DROP TYPE "public"."enum__posts_us_v_version_status";
  DROP TYPE "public"."enum__posts_us_v_published_locale";
  DROP TYPE "public"."enum_destaques_aminosan_beneficios_icone";
  DROP TYPE "public"."enum_destaques_produtos_beneficios_icone";`)
}
