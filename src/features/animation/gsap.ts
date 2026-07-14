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

// `registerPlugin` é idempotente; rodar no topo do módulo basta. Só no cliente.
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, SplitText, Observer, useGSAP)
  ScrollTrigger.config({ ignoreMobileResize: true })
}

export { gsap, ScrollTrigger, SplitText, Observer, useGSAP }
