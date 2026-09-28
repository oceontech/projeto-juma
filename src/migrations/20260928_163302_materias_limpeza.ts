import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "articles_tags" CASCADE;
  DROP TABLE "_articles_v_version_tags" CASCADE;
  ALTER TABLE "articles" DROP COLUMN "autor";
  ALTER TABLE "articles_locales" DROP COLUMN "conteudo";
  ALTER TABLE "articles_locales" DROP COLUMN "seo_title";
  ALTER TABLE "articles_locales" DROP COLUMN "seo_description";
  ALTER TABLE "_articles_v" DROP COLUMN "version_autor";
  ALTER TABLE "_articles_v_locales" DROP COLUMN "version_conteudo";
  ALTER TABLE "_articles_v_locales" DROP COLUMN "version_seo_title";
  ALTER TABLE "_articles_v_locales" DROP COLUMN "version_seo_description";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "articles_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"tag" varchar
  );
  
  CREATE TABLE "_articles_v_version_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"tag" varchar,
  	"_uuid" varchar
  );
  
  ALTER TABLE "articles" ADD COLUMN "autor" varchar;
  ALTER TABLE "articles_locales" ADD COLUMN "conteudo" jsonb;
  ALTER TABLE "articles_locales" ADD COLUMN "seo_title" varchar;
  ALTER TABLE "articles_locales" ADD COLUMN "seo_description" varchar;
  ALTER TABLE "_articles_v" ADD COLUMN "version_autor" varchar;
  ALTER TABLE "_articles_v_locales" ADD COLUMN "version_conteudo" jsonb;
  ALTER TABLE "_articles_v_locales" ADD COLUMN "version_seo_title" varchar;
  ALTER TABLE "_articles_v_locales" ADD COLUMN "version_seo_description" varchar;
  ALTER TABLE "articles_tags" ADD CONSTRAINT "articles_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_version_tags" ADD CONSTRAINT "_articles_v_version_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "articles_tags_order_idx" ON "articles_tags" USING btree ("_order");
  CREATE INDEX "articles_tags_parent_id_idx" ON "articles_tags" USING btree ("_parent_id");
  CREATE INDEX "_articles_v_version_tags_order_idx" ON "_articles_v_version_tags" USING btree ("_order");
  CREATE INDEX "_articles_v_version_tags_parent_id_idx" ON "_articles_v_version_tags" USING btree ("_parent_id");`)
}
