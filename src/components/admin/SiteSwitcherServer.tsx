import { cookies } from 'next/headers'

import { SiteSwitcher, type Choice } from './SiteSwitcher'

/** Lê a escolha salva no servidor para a sidebar já nascer com os itens certos. */
export async function SiteSwitcherServer() {
  const value = (await cookies()).get('painel_site')?.value
  const initial: Choice = value === 'br' || value === 'us' ? value : 'todos'
  return <SiteSwitcher initial={initial} />
}
