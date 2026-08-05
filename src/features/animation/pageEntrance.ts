'use client'

/**
 * Portão de abertura de página: solta a timeline de entrada na hora certa e no
 * sentido certo.
 *
 * ── Duas coisas davam errado numa abertura solta no mount ───────────────
 *
 * 1. TEMPO. Onde existe tela de espera (hoje só a home, por causa do vídeo e do
 *    pôster em tela cheia), uma timeline que parte no mount roda inteira ATRÁS
 *    do overlay. Quando ele sai, a cascata já terminou e o usuário vê o título
 *    parado — ou pegando o finalzinho.
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

/** Sinal disparado pelo `Preloader` quando o overlay termina de sair. */
export const PRELOADER_DONE_EVENT = 'preloader:done'

/**
 * `true` enquanto o overlay do preloader estiver cobrindo a tela.
 *
 * Vive no `window` porque quem escreve (o `Preloader`) e quem lê (cada página)
 * são componentes irmãos sem nenhum estado em comum, e o valor precisa
 * sobreviver a montagens/desmontagens de rota.
 */
declare global {
  interface Window {
    __jumaPreloaderActive?: boolean
  }
}

/** Marca o overlay como visível/oculto. Uso interno do `Preloader`. */
export function setPreloaderActive(active: boolean) {
  if (typeof window === 'undefined') return
  window.__jumaPreloaderActive = active
}

/** `true` se o overlay está cobrindo a tela agora. */
export function isPreloaderActive() {
  if (typeof window === 'undefined') return false
  return window.__jumaPreloaderActive === true
}

/**
 * Executa `start` quando a página estiver pronta para se apresentar: já no
 * próximo quadro se não há tela de espera (o caso de todas as páginas internas),
 * ou quando o overlay do preloader sair (home).
 *
 * @returns função de limpeza (remove listener e cancela o timeout de segurança).
 */
export function onPageEntrance(start: () => void): () => void {
  if (typeof window === 'undefined') return () => {}

  let done = false
  let timeout: number | undefined
  let frame: number | undefined

  const fire = () => {
    if (done) return
    done = true
    window.clearTimeout(timeout)
    if (frame !== undefined) window.cancelAnimationFrame(frame)
    window.removeEventListener(PRELOADER_DONE_EVENT, fire)
    /* Zera o sentido herdado da página anterior: a abertura corre para frente,
       e o primeiro scroll de verdade reescreve isto em seguida. */
    setScrollDirection(1)
    start()
  }

  /* Sem overlay: nada a esperar. Um quadro de folga para o layout assentar
     antes de o SplitText medir as linhas. */
  if (!isPreloaderActive()) {
    frame = window.requestAnimationFrame(fire)
    return () => {
      done = true
      if (frame !== undefined) window.cancelAnimationFrame(frame)
    }
  }

  window.addEventListener(PRELOADER_DONE_EVENT, fire, { once: true })
  /* Rede de segurança: se o sinal se perder (overlay desmontado entre o render
     e este efeito), a abertura não pode ficar parada para sempre. O limite
     acompanha o teto do próprio preloader. */
  timeout = window.setTimeout(fire, 2600)

  return () => {
    done = true
    window.clearTimeout(timeout)
    window.removeEventListener(PRELOADER_DONE_EVENT, fire)
  }
}
