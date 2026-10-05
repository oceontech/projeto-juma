'use client'

import { useEffect, type ReactNode } from 'react'

/**
 * Botão de olho em todo campo de senha do painel (login, criar senha pelo
 * convite, troca de senha, "Alterar senha" da conta). Os campos são do próprio
 * Payload, então o botão entra por DOM quando o campo aparece na tela.
 */

const EYE =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>'
const EYE_OFF =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3l18 18"/><path d="M10.6 5.1A10.9 10.9 0 0 1 12 5c6.5 0 10 7 10 7a17.6 17.6 0 0 1-3.2 4.2M6.6 6.6C3.8 8.4 2 12 2 12s3.5 7 10 7a9.8 9.8 0 0 0 5.4-1.6"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>'

function paint(button: HTMLButtonElement, input: HTMLInputElement) {
  const visible = input.type === 'text'
  button.innerHTML = visible ? EYE_OFF : EYE
  button.setAttribute('aria-label', visible ? 'Esconder senha' : 'Mostrar senha')
  button.setAttribute('aria-pressed', String(visible))
  button.title = visible ? 'Esconder senha' : 'Mostrar senha'
}

function enhance(input: HTMLInputElement) {
  if (input.dataset.reveal) return
  const wrap = input.parentElement
  if (!wrap) return
  input.dataset.reveal = '1'
  wrap.classList.add('juma-reveal')

  const button = document.createElement('button')
  button.type = 'button'
  button.className = 'juma-reveal__btn'
  button.addEventListener('mousedown', (e) => e.preventDefault()) // não tira o foco do campo
  button.addEventListener('click', () => {
    input.type = input.type === 'password' ? 'text' : 'password'
    paint(button, input)
  })
  paint(button, input)
  wrap.appendChild(button)

  // O Payload pode voltar o campo para "password" ao renderizar de novo.
  new MutationObserver(() => paint(button, input)).observe(input, { attributes: true, attributeFilter: ['type'] })
}

export function PasswordReveal({ children }: { children?: ReactNode }) {
  useEffect(() => {
    const scan = () => document.querySelectorAll<HTMLInputElement>('input[type="password"]').forEach(enhance)
    scan()
    const observer = new MutationObserver(scan)
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  return <>{children}</>
}
