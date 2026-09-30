import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

import { legacyToBlocks } from '../features/articles/blocks'

/**
 * Texto da matéria BR em blocos (campo `conteudo`), o mesmo formato do blog
 * EUA. Converte o formato antigo (introdução + seções + citação) de todas as
 * matérias, nos 3 idiomas, na tabela principal e nas versões (rascunhos), para
 * o editor abrir cada matéria já com o texto. Os campos antigos ficam guardados.
 */

type Db = MigrateUpArgs['db']
type Row = Record<string, unknown>

async function convert(db: Db, locales: string, sections: string, prefix: '' | 'version_') {
  const main = await db.execute(
    sql.raw(`SELECT _parent_id, _locale, ${prefix}introducao AS introducao, ${prefix}citacao AS citacao FROM "${locales}" WHERE ${prefix}conteudo IS NULL`),
  )
  const secs = await db.execute(sql.raw(`SELECT _parent_id, _locale, titulo, paragrafos FROM "${sections}" ORDER BY _parent_id, _locale, _order`))
  const byDoc = new Map<string, { titulo: string | null; paragrafos: string | null }[]>()
  for (const s of secs.rows as Row[]) {
    const key = `${s._parent_id}|${s._locale}`
    byDoc.set(key, [...(byDoc.get(key) ?? []), { titulo: (s.titulo as string) ?? null, paragrafos: (s.paragrafos as string) ?? null }])
  }
  let count = 0
  for (const r of main.rows as Row[]) {
    const blocks = legacyToBlocks({
      introducao: r.introducao as string | null,
      citacao: r.citacao as string | null,
      secoes: byDoc.get(`${r._parent_id}|${r._locale}`) ?? [],
    })
    if (!blocks.length) continue
    await db.execute(
      sql`UPDATE ${sql.identifier(locales)} SET ${sql.identifier(`${prefix}conteudo`)} = ${JSON.stringify(blocks)}::jsonb WHERE _parent_id = ${r._parent_id} AND _locale = ${r._locale}`,
    )
    count++
  }
  return count
}

export async function up({ db, payload }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "articles_locales" ADD COLUMN "conteudo" jsonb;
  ALTER TABLE "_articles_v_locales" ADD COLUMN "version_conteudo" jsonb;`)

  const docs = await convert(db, 'articles_locales', 'articles_secoes', '')
  const versions = await convert(db, '_articles_v_locales', '_articles_v_version_secoes', 'version_')
  payload.logger.info(`Matérias em blocos: ${docs} textos convertidos (e ${versions} nas versões).`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "articles_locales" DROP COLUMN "conteudo";
  ALTER TABLE "_articles_v_locales" DROP COLUMN "version_conteudo";`)
}
