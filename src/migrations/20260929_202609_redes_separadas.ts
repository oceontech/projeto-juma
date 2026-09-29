import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "redes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"instagram" varchar DEFAULT 'https://www.instagram.com/jumaagro/',
  	"tiktok" varchar DEFAULT 'https://www.tiktok.com/@jumaagro',
  	"youtube" varchar DEFAULT 'https://www.youtube.com/@Juma-Agro30/videos',
  	"linkedin" varchar DEFAULT 'https://br.linkedin.com/company/juma-agro',
  	"facebook" varchar DEFAULT 'https://www.facebook.com/JumaAgro30/',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "redes_us" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"instagram" varchar,
  	"facebook" varchar,
  	"linkedin" varchar,
  	"youtube" varchar,
  	"x" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "settings" DROP COLUMN "redes_instagram";
  ALTER TABLE "settings" DROP COLUMN "redes_tiktok";
  ALTER TABLE "settings" DROP COLUMN "redes_youtube";
  ALTER TABLE "settings" DROP COLUMN "redes_linkedin";
  ALTER TABLE "settings" DROP COLUMN "redes_facebook";
  ALTER TABLE "settings_us" DROP COLUMN "social_instagram";
  ALTER TABLE "settings_us" DROP COLUMN "social_facebook";
  ALTER TABLE "settings_us" DROP COLUMN "social_linkedin";
  ALTER TABLE "settings_us" DROP COLUMN "social_youtube";
  ALTER TABLE "settings_us" DROP COLUMN "social_x";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "redes" CASCADE;
  DROP TABLE "redes_us" CASCADE;
  ALTER TABLE "settings" ADD COLUMN "redes_instagram" varchar DEFAULT 'https://www.instagram.com/jumaagro/';
  ALTER TABLE "settings" ADD COLUMN "redes_tiktok" varchar DEFAULT 'https://www.tiktok.com/@jumaagro';
  ALTER TABLE "settings" ADD COLUMN "redes_youtube" varchar DEFAULT 'https://www.youtube.com/@Juma-Agro30/videos';
  ALTER TABLE "settings" ADD COLUMN "redes_linkedin" varchar DEFAULT 'https://br.linkedin.com/company/juma-agro';
  ALTER TABLE "settings" ADD COLUMN "redes_facebook" varchar DEFAULT 'https://www.facebook.com/JumaAgro30/';
  ALTER TABLE "settings_us" ADD COLUMN "social_instagram" varchar;
  ALTER TABLE "settings_us" ADD COLUMN "social_facebook" varchar;
  ALTER TABLE "settings_us" ADD COLUMN "social_linkedin" varchar;
  ALTER TABLE "settings_us" ADD COLUMN "social_youtube" varchar;
  ALTER TABLE "settings_us" ADD COLUMN "social_x" varchar;`)
}
