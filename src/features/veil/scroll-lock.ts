/**
 * Trava de rolagem do véu, sem mexer no `overflow` do <html>.
 *
 * `overflow: hidden` mudaria a largura útil da página quando há barra de
 * rolagem visível. Aqui a trava é por eventos: cancela roda e toque, teclas de
 * rolagem, e desfaz qualquer rolagem que escape (arrastar o polegar da barra,
 * âncora, foco) voltando ao `y` fixo.
 *
 * Os listeners de roda e toque ficam na fase de captura da `window` e param a
 * propagação, então nem o Lenis (se estiver ativo) chega a vê-los.
 */

const SCROLL_KEYS = new Set([' ', 'Spacebar', 'PageUp', 'PageDown', 'Home', 'End', 'ArrowUp', 'ArrowDown'])

let locked = false
let pinY = 0

function isFormField(target: EventTarget | null) {
  const el = target instanceof Element ? target : null
  return !!el?.closest('input, textarea, select, [contenteditable=""], [contenteditable="true"]')
}

function cancel(e: Event) {
  if (e.cancelable) e.preventDefault()
  e.stopPropagation()
}

function onKeyDown(e: KeyboardEvent) {
  if (!SCROLL_KEYS.has(e.key) || e.ctrlKey || e.metaKey || e.altKey) return
  if (isFormField(e.target)) return
  e.preventDefault()
}

function onScroll() {
  if (window.scrollY !== pinY) window.scrollTo(0, pinY)
}

export function lockScroll() {
  if (locked || typeof window === 'undefined') return
  locked = true
  pinY = window.scrollY
  window.addEventListener('wheel', cancel, { passive: false, capture: true })
  window.addEventListener('touchmove', cancel, { passive: false, capture: true })
  window.addEventListener('keydown', onKeyDown, { capture: true })
  window.addEventListener('scroll', onScroll, { passive: true })
}

export function unlockScroll() {
  if (!locked) return
  locked = false
  window.removeEventListener('wheel', cancel, { capture: true })
  window.removeEventListener('touchmove', cancel, { capture: true })
  window.removeEventListener('keydown', onKeyDown, { capture: true })
  window.removeEventListener('scroll', onScroll)
}

/** Rola para `y` e passa a defender essa posição. Use no lugar de `scrollTo` com a trava ativa. */
export function pin(y: number) {
  pinY = y
  if (typeof window !== 'undefined') window.scrollTo(0, y)
}

export function isScrollLocked() {
  return locked
}
