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

  if (!article) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center pt-[120px] text-foreground/50">
        Carregando a prévia…
      </div>
    )
  }

  // A chave remonta a página a cada mudança: as animações de texto do título
  // quebram o título em letras e não acompanhariam a edição ao vivo.
  return <ArticlePage key={version} article={article} related={[]} />

}
