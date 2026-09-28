import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "_products_v_autosave_idx";
  DROP INDEX "_cultures_v_autosave_idx";
  DROP INDEX "_articles_v_autosave_idx";
  ALTER TABLE "_products_v" DROP COLUMN "autosave";
  ALTER TABLE "_cultures_v" DROP COLUMN "autosave";
  ALTER TABLE "_articles_v" DROP COLUMN "autosave";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "_articles_v" ADD COLUMN "autosave" boolean;
  ALTER TABLE "_products_v" ADD COLUMN "autosave" boolean;
  ALTER TABLE "_cultures_v" ADD COLUMN "autosave" boolean;
  CREATE INDEX "_articles_v_autosave_idx" ON "_articles_v" USING btree ("autosave");
  CREATE INDEX "_products_v_autosave_idx" ON "_products_v" USING btree ("autosave");
  CREATE INDEX "_cultures_v_autosave_idx" ON "_cultures_v" USING btree ("autosave");`)
}
