'use client'

import type { UIFieldClientComponent } from 'payload'

type Props = { prev?: string; next?: string; last?: boolean }

/** Aba (etapa) pelo nome: as etapas do post são as abas do formulário. */
function goTo(label: string) {
  const tabs = [...document.querySelectorAll<HTMLButtonElement>('.tabs-field__tab-button')]
  const tab = tabs.find((t) => t.textContent?.trim().toLowerCase().startsWith(label.toLowerCase()))
  tab?.click()
  tab?.closest('.tabs-field')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

/** "← Etapa anterior · Próxima etapa →" no fim de cada etapa do post. */
export const StepFooter: UIFieldClientComponent = (props) => {
  const { prev, next, last } = props as unknown as Props
  return (
    <div className="jstep">
      {prev ? (
        <button type="button" className="jd-btn jd-btn--ghost" onClick={() => goTo(prev)}>
          ← {prev}
        </button>
      ) : (
        <span />
      )}
      {next && (
        <button type="button" className="jd-btn" onClick={() => goTo(next)}>
          Próximo: {next} →
        </button>
      )}
      {last && (
        <p className="jstep__done">
          Tudo pronto? Use <b>Publicar</b> no topo. Para salvar sem publicar, <b>Salvar rascunho</b>.
        </p>
      )}
    </div>
  )
}
