import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_categorias_site" AS ENUM('br', 'us');
  CREATE TABLE "categorias" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"site" "enum_categorias_site" DEFAULT 'br' NOT NULL,
  	"ordem" numeric DEFAULT 100,
  	"slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "categorias_locales" (
  	"nome" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "articles" ADD COLUMN "tema_id" integer;
  ALTER TABLE "_articles_v" ADD COLUMN "version_tema_id" integer;
  ALTER TABLE "posts_us" ADD COLUMN "tema_id" integer;
  ALTER TABLE "posts_us" ADD COLUMN "read_minutes" numeric;
  ALTER TABLE "_posts_us_v" ADD COLUMN "version_tema_id" integer;
  ALTER TABLE "_posts_us_v" ADD COLUMN "version_read_minutes" numeric;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "categorias_id" integer;
  ALTER TABLE "categorias_locales" ADD CONSTRAINT "categorias_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."categorias"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "categorias_slug_idx" ON "categorias" USING btree ("slug");
  CREATE INDEX "categorias_updated_at_idx" ON "categorias" USING btree ("updated_at");
  CREATE INDEX "categorias_created_at_idx" ON "categorias" USING btree ("created_at");
  CREATE UNIQUE INDEX "categorias_locales_locale_parent_id_unique" ON "categorias_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "articles" ADD CONSTRAINT "articles_tema_id_categorias_id_fk" FOREIGN KEY ("tema_id") REFERENCES "public"."categorias"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_version_tema_id_categorias_id_fk" FOREIGN KEY ("version_tema_id") REFERENCES "public"."categorias"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_us" ADD CONSTRAINT "posts_us_tema_id_categorias_id_fk" FOREIGN KEY ("tema_id") REFERENCES "public"."categorias"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_us_v" ADD CONSTRAINT "_posts_us_v_version_tema_id_categorias_id_fk" FOREIGN KEY ("version_tema_id") REFERENCES "public"."categorias"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categorias_fk" FOREIGN KEY ("categorias_id") REFERENCES "public"."categorias"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "articles_tema_idx" ON "articles" USING btree ("tema_id");
  CREATE INDEX "_articles_v_version_version_tema_idx" ON "_articles_v" USING btree ("version_tema_id");
  CREATE INDEX "posts_us_tema_idx" ON "posts_us" USING btree ("tema_id");
  CREATE INDEX "_posts_us_v_version_version_tema_idx" ON "_posts_us_v" USING btree ("version_tema_id");
  CREATE INDEX "payload_locked_documents_rels_categorias_id_idx" ON "payload_locked_documents_rels" USING btree ("categorias_id");`)

  // Categorias que eram fixas no código viram registros, nos 3 idiomas.
  const BR = [
    { value: 'manejo', pt: 'Manejo', en: 'Management', es: 'Manejo' },
    { value: 'nutricao', pt: 'Nutrição', en: 'Nutrition', es: 'Nutrición' },
    { value: 'pecuaria', pt: 'Pecuária', en: 'Livestock', es: 'Ganadería' },
    { value: 'pesquisa', pt: 'Pesquisa', en: 'Research', es: 'Investigación' },
    { value: 'sustentabilidade', pt: 'Sustentabilidade', en: 'Sustainability', es: 'Sostenibilidad' },
  ]
  const US = [
    { value: 'field-notes', name: 'Field notes' },
    { value: 'crop-nutrition', name: 'Crop nutrition' },
    { value: 'trials', name: 'Trials' },
    { value: 'company', name: 'Company' },
  ]

  for (const [i, c] of BR.entries()) {
    const doc = await payload.create({
      collection: 'categorias',
      locale: 'pt-BR',
      data: { nome: c.pt, site: 'br', ordem: (i + 1) * 10, slug: c.value },
      req,
      overrideAccess: true,
    })
    for (const locale of ['en', 'es'] as const) {
      await payload.update({ collection: 'categorias', id: doc.id, locale, data: { nome: c[locale] }, req, overrideAccess: true })
    }
    await db.execute(sql`UPDATE "articles" SET "tema_id" = ${doc.id} WHERE "categoria" = ${c.value}`)
    await db.execute(sql`UPDATE "_articles_v" SET "version_tema_id" = ${doc.id} WHERE "version_categoria" = ${c.value}`)
  }

  for (const [i, c] of US.entries()) {
    const doc = await payload.create({
      collection: 'categorias',
      locale: 'pt-BR',
      data: { nome: c.name, site: 'us', ordem: (i + 1) * 10, slug: c.value },
      req,
      overrideAccess: true,
    })
    // O nome em inglês vale para qualquer idioma do painel.
    for (const locale of ['en', 'es'] as const) {
      await payload.update({ collection: 'categorias', id: doc.id, locale, data: { nome: c.name }, req, overrideAccess: true })
    }
    await db.execute(sql`UPDATE "posts_us" SET "tema_id" = ${doc.id} WHERE "category" = ${c.value}`)
    await db.execute(sql`UPDATE "_posts_us_v" SET "version_tema_id" = ${doc.id} WHERE "version_category" = ${c.value}`)
  }
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "categorias" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "categorias_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "categorias" CASCADE;
  DROP TABLE "categorias_locales" CASCADE;
  ALTER TABLE "articles" DROP CONSTRAINT "articles_tema_id_categorias_id_fk";
  
  ALTER TABLE "_articles_v" DROP CONSTRAINT "_articles_v_version_tema_id_categorias_id_fk";
  
  ALTER TABLE "posts_us" DROP CONSTRAINT "posts_us_tema_id_categorias_id_fk";
  
  ALTER TABLE "_posts_us_v" DROP CONSTRAINT "_posts_us_v_version_tema_id_categorias_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_categorias_fk";
  
  DROP INDEX "articles_tema_idx";
  DROP INDEX "_articles_v_version_version_tema_idx";
  DROP INDEX "posts_us_tema_idx";
  DROP INDEX "_posts_us_v_version_version_tema_idx";
  DROP INDEX "payload_locked_documents_rels_categorias_id_idx";
  ALTER TABLE "articles" DROP COLUMN "tema_id";
  ALTER TABLE "_articles_v" DROP COLUMN "version_tema_id";
  ALTER TABLE "posts_us" DROP COLUMN "tema_id";
  ALTER TABLE "posts_us" DROP COLUMN "read_minutes";
  ALTER TABLE "_posts_us_v" DROP COLUMN "version_tema_id";
  ALTER TABLE "_posts_us_v" DROP COLUMN "version_read_minutes";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "categorias_id";
  DROP TYPE "public"."enum_categorias_site";`)
}
