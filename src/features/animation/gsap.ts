'use client'

/**
 * Registro central do GSAP (uma única vez por bundle do cliente).
 *
 * Importe `gsap` e `ScrollTrigger` daqui, nunca direto de 'gsap', para garantir
 * que os plugins já estão registrados. SplitText virou gratuito na 3.13+ (o
 * projeto está na 3.15) — usamos para reveal por linha/palavra sem quebrar
 * string na mão. `useGSAP` é o hook oficial de cleanup com escopo.
 */
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { Observer } from 'gsap/Observer'
import { useGSAP } from '@gsap/react'

import { isBooted } from '@/features/veil/boot'

// `registerPlugin` é idempotente; rodar no topo do módulo basta. Só no cliente.
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, SplitText, Observer, useGSAP)
  ScrollTrigger.config({ ignoreMobileResize: true })
}

/**
 * `ScrollTrigger.refresh()` global que espera o véu de carregamento sair.
 *
 * O refresh é síncrono e caro (100 ms ou mais). Com o véu de pé ele roubaria
 * quadros da marca ou da cortina, e o véu já faz um refresh próprio, com a tela
 * opaca, logo antes de sair. Qualquer componente que refaz medidas no
 * `load`/`fonts.ready`/resize usa esta versão.
 */
export function refreshWhenBooted() {
  if (isBooted()) ScrollTrigger.refresh()
}

export { gsap, ScrollTrigger, SplitText, Observer, useGSAP }
