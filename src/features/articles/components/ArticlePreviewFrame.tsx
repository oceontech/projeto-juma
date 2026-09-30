'use client'

import { useEffect, useState } from 'react'

import type { ArticleView } from '../queries'
import { ArticlePage } from './ArticlePage'

/**
 * Prévia da matéria para o painel (/materias/previa, dentro de um iframe).
 * O formulário do painel manda a matéria em rascunho por postMessage; aqui
 * ela aparece com o mesmo componente da página real. Só aceita mensagens da
 * própria origem (o painel mora no mesmo domínio).
 */
export function ArticlePreviewFrame() {
  const [article, setArticle] = useState<ArticleView | null>(null)
  const [version, setVersion] = useState(0)

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return
      if (e.data?.type !== 'juma:article-preview' || !e.data.article) return
      setArticle(e.data.article as ArticleView)
      setVersion((v) => v + 1)
    }
    window.addEventListener('message', onMessage)
    window.parent?.postMessage({ type: 'juma:preview-ready' }, window.location.origin)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  // Prévia travada: dá para rolar e ver a página, mas não sair dela nem abrir nada.
  useEffect(() => {
    const block = (e: Event) => {
      const t = e.target as HTMLElement | null
      if (t?.closest('a, button, form, input, select, textarea, label, [role="button"]')) {
        e.preventDefault()
        e.stopPropagation()
      }
    }
    const style = document.createElement('style')
    // Os links e botões nem recebem o clique (a transição de página do site escuta a janela antes de tudo).
    style.textContent =
      'a, button, input, select, textarea, label, [role="button"] { pointer-events: none !important; cursor: default !important; }'
    document.head.appendChild(style)
    document.addEventListener('click', block, true)
    document.addEventListener('submit', block, true)
    return () => {
      document.removeEventListener('click', block, true)
      document.removeEventListener('submit', block, true)
      style.remove()
    }
  }, [])

  if (!article) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center pt-[120px] text-foreground/50">
        Carregando a prévia…
      </div>
    )
  }

  // A chave remonta a página a cada mudança: as animações de texto do título
  // quebram o título em letras e não acompanhariam a edição ao vivo.
  return <ArticlePage key={version} article={article} related={[]} preview />

}
