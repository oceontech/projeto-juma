/** Constantes do véu. Sem 'use client' para o layout (servidor) e o componente lerem as mesmas. */

/** Animação Lottie da marca: 1080×1920, 30 fps, 149 quadros, sem imagens embutidas. */
export const VEIL_SRC = '/anim/veil.json'

/** ENTRY: quadros 0 a 58 (a marca se monta), tocado a 1,7× (~1,14 s). Depois disso a marca fica parada no 58. */
export const ENTRY_END_FRAME = 58
export const ENTRY_SPEED = 1.7

/** Tempo mínimo de véu de pé, contado desde o começo do ENTRY. */
export const MIN_HOLD_MS = 800
/** Teto de espera contra rede ruim, contado desde o clique (ou desde a carga). */
export const CAP_MS = 8000
/** Se o player não subiu até aqui (desde o clique), a rota muda mesmo assim. */
export const ENTRY_TIMEOUT_MS = 1800

/** Acima de tudo no site (a navbar não passa de 4 dígitos). */
export const VEIL_Z_INDEX = 100000

/** Script síncrono do <head>: roda antes da hidratação. Posição de scroll restaurada corrompe os ScrollTriggers. */
export const RESET_SCROLL_SCRIPT =
  "try{history.scrollRestoration='manual';window.scrollTo(0,0)}catch(e){}"
