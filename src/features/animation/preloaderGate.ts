'use client'

/**
 * Portão de abertura: segura a timeline de entrada até a tela do preloader sair.
 *
 * ── O problema ─────────────────────────────────────────────────────────
 * O overlay branco do preloader fica de pé por até 2,5s (fontes, imagens,
 * `load`). Uma timeline que parte no mount roda inteira ATRÁS dele — quando o
 * overlay finalmente sai, a cascata já terminou (ou está nos últimos quadros) e
 * o usuário vê o título parado, ou entrando "pela metade".
 *
 * O hero da home já resolvia isso por conta própria, ouvindo `preloader:done`.
 * As páginas internas não ouviam nada, e era exatamente ali que a entrada do
 * primeiro título sumia. Este módulo é aquela mesma lógica, num lugar só.
 *
 * ── Como usar ──────────────────────────────────────────────────────────
 *     const tl = gsap.timeline({ paused: true })
 *     ...
 *     return onPreloaderDone(() => tl.play())
 *
 * O retorno é a função de limpeza — devolva-a do `useGSAP`/`useEffect`.
 */

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
 * Executa `start` quando o preloader sair — ou já no próximo quadro, se ele não
 * estiver de pé (navegação em que o overlay já foi dispensado, rota sem
 * preloader, reduced-motion).
 *
 * @returns função de limpeza (remove listener e cancela o timeout de segurança).
 */
export function onPreloaderDone(start: () => void): () => void {
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
    start()
  }

  /* Overlay já saiu: nada a esperar. Um quadro de folga para o layout assentar
     antes de o SplitText medir as linhas. */
  if (!isPreloaderActive()) {
    frame = window.requestAnimationFrame(fire)
    return () => {
      done = true
      if (frame !== undefined) window.cancelAnimationFrame(frame)
    }
  }

  window.addEventListener(PRELOADER_DONE_EVENT, fire, { once: true })
  /* Rede de segurança: se o sinal se perder (rota sem preloader montado, evento
     disparado entre o render e este efeito), a abertura não pode ficar parada
     para sempre. O limite acompanha o teto do próprio preloader. */
  timeout = window.setTimeout(fire, 2600)

  return () => {
    done = true
    window.clearTimeout(timeout)
    window.removeEventListener(PRELOADER_DONE_EVENT, fire)
  }
}
