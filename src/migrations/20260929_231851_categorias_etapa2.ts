import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "articles" DROP COLUMN "categoria";
  ALTER TABLE "articles" DROP COLUMN "cor";
  ALTER TABLE "articles" DROP COLUMN "destaque_home";
  ALTER TABLE "articles" DROP COLUMN "tempo_leitura_manual";
  ALTER TABLE "_articles_v" DROP COLUMN "version_categoria";
  ALTER TABLE "_articles_v" DROP COLUMN "version_cor";
  ALTER TABLE "_articles_v" DROP COLUMN "version_destaque_home";
  ALTER TABLE "_articles_v" DROP COLUMN "version_tempo_leitura_manual";
  ALTER TABLE "posts_us" DROP COLUMN "category";
  ALTER TABLE "_posts_us_v" DROP COLUMN "version_category";
  DROP TYPE "public"."enum_articles_categoria";
  DROP TYPE "public"."enum_articles_cor";
  DROP TYPE "public"."enum__articles_v_version_categoria";
  DROP TYPE "public"."enum__articles_v_version_cor";
  DROP TYPE "public"."enum_posts_us_category";
  DROP TYPE "public"."enum__posts_us_v_version_category";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_articles_categoria" AS ENUM('manejo', 'nutricao', 'pecuaria', 'pesquisa', 'sustentabilidade');
  CREATE TYPE "public"."enum_articles_cor" AS ENUM('from-green-700 to-emerald-950', 'from-green-600 to-green-800', 'from-teal-600 to-emerald-800', 'from-amber-600 to-orange-800', 'from-blue-600 to-indigo-800', 'from-purple-600 to-purple-900');
  CREATE TYPE "public"."enum__articles_v_version_categoria" AS ENUM('manejo', 'nutricao', 'pecuaria', 'pesquisa', 'sustentabilidade');
  CREATE TYPE "public"."enum__articles_v_version_cor" AS ENUM('from-green-700 to-emerald-950', 'from-green-600 to-green-800', 'from-teal-600 to-emerald-800', 'from-amber-600 to-orange-800', 'from-blue-600 to-indigo-800', 'from-purple-600 to-purple-900');
  CREATE TYPE "public"."enum_posts_us_category" AS ENUM('field-notes', 'crop-nutrition', 'trials', 'company');
  CREATE TYPE "public"."enum__posts_us_v_version_category" AS ENUM('field-notes', 'crop-nutrition', 'trials', 'company');
  ALTER TABLE "articles" ADD COLUMN "categoria" "enum_articles_categoria";
  ALTER TABLE "articles" ADD COLUMN "cor" "enum_articles_cor" DEFAULT 'from-green-700 to-emerald-950';
  ALTER TABLE "articles" ADD COLUMN "destaque_home" boolean;
  ALTER TABLE "articles" ADD COLUMN "tempo_leitura_manual" boolean;
  ALTER TABLE "_articles_v" ADD COLUMN "version_categoria" "enum__articles_v_version_categoria";
  ALTER TABLE "_articles_v" ADD COLUMN "version_cor" "enum__articles_v_version_cor" DEFAULT 'from-green-700 to-emerald-950';
  ALTER TABLE "_articles_v" ADD COLUMN "version_destaque_home" boolean;
  ALTER TABLE "_articles_v" ADD COLUMN "version_tempo_leitura_manual" boolean;
  ALTER TABLE "posts_us" ADD COLUMN "category" "enum_posts_us_category";
  ALTER TABLE "_posts_us_v" ADD COLUMN "version_category" "enum__posts_us_v_version_category";`)
}
