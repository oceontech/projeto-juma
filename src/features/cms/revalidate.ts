import { revalidatePath } from 'next/cache'

import { routing } from '../../i18n/routing'

/**
 * Regera as páginas do site depois de uma publicação no painel, nos 3 idiomas.
 * Os caminhos vêm sem idioma ("/materias/x"); o prefixo é aplicado aqui.
 *
 * Fora do Next (seed, migrations, testes) não há o que revalidar e o
 * `revalidatePath` lança erro; nesse caso só ignora.
 */
export function revalidateSite(paths: (string | null | undefined)[]) {
  for (const path of paths) {
    if (!path) continue
    for (const locale of routing.locales) {
      try {
        revalidatePath(`/${locale}${path === '/' ? '' : path}`)
      } catch {
        return
      }
    }
  }
}


/** Regera o site inteiro (rodapé e contato aparecem em todas as páginas). */
export function revalidateAllPages() {
  try {
    revalidatePath('/', 'layout')
  } catch {
    // Fora do Next: nada a revalidar.
  }
}
