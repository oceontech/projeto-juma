'use client'

/**
 * Perfil de capacidade do aparelho — medido uma vez, no primeiro acesso.
 *
 * A home decidia "é celular?" com `window.innerWidth < 1024` repetido em uma
 * dúzia de arquivos. Largura sozinha erra nos dois sentidos: um iPad deitado
 * tem 1366px e um decodificador bem mais fraco que qualquer notebook; um
 * monitor grande com a janela estreita não é celular. Para decidir o custo de
 * uma animação, o que importa é o conjunto — tipo de ponteiro, núcleos de CPU,
 * memória.
 *
 * O valor é congelado de propósito: ele alimenta decisões que precisam ser
 * iguais em todos os pontos da mesma sessão. Girar a tela não troca o hardware.
 */

/** Largura abaixo da qual o layout é tratado como de celular. */
export const MOBILE_BP = 1024

let cached: { touch: boolean; lowPower: boolean } | null = null

function measure() {
  if (typeof window === 'undefined') return { touch: false, lowPower: false }

  const touch = window.matchMedia('(pointer: coarse)').matches
  const narrow = window.innerWidth < MOBILE_BP
  // `deviceMemory` não existe no Safari; `hardwareConcurrency` existe em todos
  // os alvos do projeto. Faltando os dois, o tipo de ponteiro decide.
  const cores = navigator.hardwareConcurrency ?? 0
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 0

  return {
    touch,
    lowPower: touch || narrow || (cores > 0 && cores <= 4) || (memory > 0 && memory <= 4),
  }
}

/** Aparelho onde efeitos de pintura e muitas camadas simultâneas saem caro. */
export function isLowPower(): boolean {
  if (!cached) cached = measure()
  return cached.lowPower
}

/** Aparelho de toque (celular ou tablet). */
export function isTouch(): boolean {
  if (!cached) cached = measure()
  return cached.touch
}

/**
 * `filter: blur()` que devolve `'none'` onde o desfoque não cabe no frame.
 * Chamar na hora de montar a tween, nunca no topo do módulo.
 */
export function blurPx(px: number): string {
  if (typeof window === 'undefined') return 'none'
  return isLowPower() ? 'none' : `blur(${px}px)`
}

/* ── Sentido do scroll ─────────────────────────────────────────────────
   Um único listener para todo o site, em vez de um por animação.

   Serve para que a entrada de um texto venha do lado de onde o usuário está
   chegando: descendo, o conteúdo entra por baixo; SUBINDO, ele reaparece pela
   borda de cima, e manter o mesmo sentido faria o texto entrar contra o
   movimento do dedo — o que se lê como um solavanco.

   `ScrollTrigger.direction` não existe como propriedade estática (só dentro do
   callback de cada trigger, como `self.direction`), daí o rastreio próprio. */
let direcao = 1
let rastreando = false

function rastrearScroll() {
  if (rastreando || typeof window === 'undefined') return
  rastreando = true
  let ultimo = window.scrollY
  window.addEventListener(
    'scroll',
    () => {
      const y = window.scrollY
      // Ignora o ruído de sub-pixel do scroll suave.
      if (Math.abs(y - ultimo) < 2) return
      direcao = y > ultimo ? 1 : -1
      ultimo = y
    },
    { passive: true },
  )
}

/** `1` quando o usuário está descendo, `-1` quando está subindo. */
export function scrollDirection(): 1 | -1 {
  rastrearScroll()
  return direcao as 1 | -1
}
