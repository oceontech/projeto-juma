/* ── Mata a inércia nativa do scroll (iOS/Android) ────────────────────────
   Não existe API para cancelar a rolagem por inércia que o navegador toca
   depois que o dedo sai. A técnica padrão é tornar o documento não-rolável
   por um frame: o navegador aborta a animação, e devolver o `overflow` logo
   em seguida deixa o scroll parado no lugar (`window.scrollTo` continua
   valendo com `overflow: hidden` — só o gesto do usuário é que não).

   Por que isto é um módulo compartilhado, e não uma função local por seção:
   a versão local (uma cópia na `AminosanStory`, outra no
   `HomeProductShowcase`) guardava o `overflow` anterior em variáveis do
   PRÓPRIO fechamento. Duas chamadas dentro do mesmo frame — que é o caso
   normal, porque na entrada da seção quem chama são dois caminhos ao mesmo
   tempo (a âncora do pin e o piso de scroll, ambos em cima da mesma rajada
   de eventos de inércia) — faziam a segunda guardar o `'hidden'` escrito
   pela primeira. Os dois `requestAnimationFrame` rodam na mesma leva, na
   ordem em que foram agendados: o primeiro devolvia o valor certo e o
   segundo reescrevia `'hidden'` por cima. A partir daí a página não rolava
   mais por gesto — só por scroll programático, e como o passo pra trás no
   catálogo é programático e a saída pra frente é nativa, o sintoma lido era
   "a seção prende: só deixa subir, não deixa descer".

   O estado agora é único e global: a primeira chamada da rajada guarda os
   valores originais, as seguintes só empurram o restore pra frente, e o
   restore devolve exatamente o que estava lá antes de tudo. */

let saved: { html: string; body: string } | null = null
let restoreRaf = 0
let restoreTimer: ReturnType<typeof setTimeout> | null = null

function restore() {
  if (restoreRaf) cancelAnimationFrame(restoreRaf)
  if (restoreTimer) clearTimeout(restoreTimer)
  restoreRaf = 0
  restoreTimer = null
  const prev = saved
  saved = null
  if (!prev) return
  document.documentElement.style.overflow = prev.html
  document.body.style.overflow = prev.body
}

export function killMomentumScroll() {
  if (typeof document === 'undefined') return
  const de = document.documentElement
  const body = document.body

  // Só a PRIMEIRA chamada da rajada guarda o estado original.
  if (!saved) saved = { html: de.style.overflow, body: body.style.overflow }

  de.style.overflow = 'hidden'
  body.style.overflow = 'hidden'

  if (restoreRaf) cancelAnimationFrame(restoreRaf)
  if (restoreTimer) clearTimeout(restoreTimer)
  restoreRaf = requestAnimationFrame(restore)
  // Rede de segurança: em aba oculta o rAF não roda, e a página ficaria
  // presa até o usuário voltar pra ela.
  restoreTimer = setTimeout(restore, 300)
}

/** Devolve o scroll na hora, sem esperar o frame — para quem precisa
 *  garantir que a página está rolável de novo (desmontagem, saída
 *  deliberada da seção). */
export function releaseMomentumLock() {
  restore()
}
