import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "avatars" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumb_url" varchar,
  	"sizes_thumb_width" numeric,
  	"sizes_thumb_height" numeric,
  	"sizes_thumb_mime_type" varchar,
  	"sizes_thumb_filesize" numeric,
  	"sizes_thumb_filename" varchar
  );
  
  ALTER TABLE "users" ADD COLUMN "foto_id" integer;
  ALTER TABLE "users" ADD COLUMN "cargo" varchar;
  ALTER TABLE "users" ADD COLUMN "foto_url" varchar;
  ALTER TABLE "users" ADD COLUMN "ultimo_acesso" timestamp(3) with time zone;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "avatars_id" integer;
  CREATE INDEX "avatars_updated_at_idx" ON "avatars" USING btree ("updated_at");
  CREATE INDEX "avatars_created_at_idx" ON "avatars" USING btree ("created_at");
  CREATE UNIQUE INDEX "avatars_filename_idx" ON "avatars" USING btree ("filename");
  CREATE INDEX "avatars_sizes_thumb_sizes_thumb_filename_idx" ON "avatars" USING btree ("sizes_thumb_filename");
  ALTER TABLE "users" ADD CONSTRAINT "users_foto_id_avatars_id_fk" FOREIGN KEY ("foto_id") REFERENCES "public"."avatars"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_avatars_fk" FOREIGN KEY ("avatars_id") REFERENCES "public"."avatars"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_foto_idx" ON "users" USING btree ("foto_id");
  CREATE INDEX "payload_locked_documents_rels_avatars_id_idx" ON "payload_locked_documents_rels" USING btree ("avatars_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "avatars" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "avatars" CASCADE;
  ALTER TABLE "users" DROP CONSTRAINT "users_foto_id_avatars_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_avatars_fk";
  
  DROP INDEX "users_foto_idx";
  DROP INDEX "payload_locked_documents_rels_avatars_id_idx";
  ALTER TABLE "users" DROP COLUMN "foto_id";
  ALTER TABLE "users" DROP COLUMN "cargo";
  ALTER TABLE "users" DROP COLUMN "foto_url";
  ALTER TABLE "users" DROP COLUMN "ultimo_acesso";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "avatars_id";`)
}
