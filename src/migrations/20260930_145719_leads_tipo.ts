import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

import { guessTipo } from '../features/leads/tipo'

/**
 * Tipo de contato do lead (cliente, revenda, vaga, fornecedor, outro) e o
 * palpite para os leads que já existem, pela mensagem e pelo formulário.
 */

type Row = { id: number; formulario: string | null; mensagem: string | null; empresa: string | null; produto: string | null }

export async function up({ db, payload }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_leads_tipo" AS ENUM('cliente', 'revenda', 'emprego', 'fornecedor', 'outro');
  ALTER TABLE "leads" ADD COLUMN "tipo" "enum_leads_tipo";`)

  const { rows } = await db.execute(sql`SELECT id, formulario, mensagem, empresa, contexto_produto AS produto FROM leads`)
  let count = 0
  for (const r of rows as Row[]) {
    const tipo = guessTipo({ formulario: r.formulario, mensagem: r.mensagem, empresa: r.empresa, contexto: { produto: r.produto } })
    if (!tipo) continue
    await db.execute(sql`UPDATE leads SET tipo = ${tipo} WHERE id = ${r.id}`)
    count++
  }
  payload.logger.info(`Leads: ${count} de ${rows.length} classificados pelo tipo de contato.`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "leads" DROP COLUMN "tipo";
  DROP TYPE "public"."enum_leads_tipo";`)
}
