import { cookies } from 'next/headers'

import type { Choice } from '../ui/SitePicker'
import { HeaderBarClient } from './HeaderBarClient'

/**
 * Faixa do alto de cada tela (admin.components.actions). À esquerda, o
 * seletor de site nas telas que juntam os dois sites, ou "Voltar" nas telas
 * internas; à direita, o idioma do conteúdo, só onde há tradução.
 * A escolha do site vem do cookie aqui no servidor, para não piscar.
 */
export async function HeaderBar() {
  const value = (await cookies()).get('painel_site')?.value
  const initial: Choice = value === 'br' || value === 'us' ? value : 'todos'
  return <HeaderBarClient initial={initial} />
}
