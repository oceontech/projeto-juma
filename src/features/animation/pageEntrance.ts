'use client'

/**
 * Portão de abertura de página: solta a timeline de entrada na hora certa e no
 * sentido certo.
 *
 * ── Duas coisas davam errado numa abertura solta no mount ───────────────
 *
 * 1. TEMPO. Uma timeline que parte no mount roda inteira ATRÁS do véu de
 *    carregamento (`features/veil`), que cobre a tela no primeiro acesso e em
 *    toda troca de página. Quando ele saísse, a cascata já teria terminado e o
 *    usuário veria o título parado. Por isso a abertura espera `whenBooted()`:
 *    ela começa junto com a cortina de saída do véu.
 *
 * 2. SENTIDO. `createCharReveal` decide a ORDEM da cascata pelo rastreador
 *    global de scroll: descendo, do primeiro caractere ao último; subindo, do
 *    último ao primeiro (a seção reaparece pela borda de cima). Esse rastreador
 *    é de módulo e sobrevive à navegação — se o usuário rolou pra cima antes de
 *    clicar no link, a página seguinte ABRIA de trás para frente, sem nenhum
 *    scroll para justificar. Abertura de página é sempre "para frente": é a
 *    primeira coisa que se lê.
 *
 * ── Como usar ──────────────────────────────────────────────────────────
 *     const tl = gsap.timeline({ paused: true })
 *     ...
 *     const soltar = onPageEntrance(() => tl.play())
 *     return () => soltar()
 */

import { setScrollDirection } from './device'
import { isBooted, whenBooted } from '@/features/veil/boot'

/**
 * Executa `start` quando a página estiver pronta para se apresentar: quando o
 * véu começar a sair, ou já no próximo quadro se ele não está de pé (troca de
 * idioma, por exemplo).
 *
 * @returns função de limpeza (cancela a abertura pendente).
 */
export function onPageEntrance(start: () => void): () => void {
  if (typeof window === 'undefined') return () => {}

  let done = false
  let frame: number | undefined

  const fire = () => {
    if (done) return
    done = true
    /* Zera o sentido herdado da página anterior: a abertura corre para frente,
       e o primeiro scroll de verdade reescreve isto em seguida. */
    setScrollDirection(1)
    start()
  }

  if (isBooted()) {
    /* Sem véu de pé: nada a esperar. Um quadro de folga para o layout assentar
       antes de o SplitText medir as linhas. */
    frame = window.requestAnimationFrame(fire)
  } else {
    void whenBooted().then(fire)
  }

  return () => {
    done = true
    if (frame !== undefined) window.cancelAnimationFrame(frame)
  }
}
