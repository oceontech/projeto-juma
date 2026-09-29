'use client'

import { convertLexicalToHTML } from '@payloadcms/richtext-lexical/html'
import type { UIFieldClientComponent } from 'payload'
import { useMemo } from 'react'

import { useCategory, useMediaUrl } from './ArticlePreview'
import { PostPreview } from './PostPreview'
import { usePostForm } from './usePostForm'

/**
 * Prévia do post do site EUA. A aba Matéria mostra a página de verdade do
 * site americano (/blog/preview), que recebe o rascunho por postMessage.
 */
export const PostUsPreview: UIFieldClientComponent = (props) => {
  const { usSite } = props as unknown as { usSite: string }
  const { values: v } = usePostForm()
  const cover = useMediaUrl(v.cover)
  const category = useCategory(v.tema, 'pt-BR')
  const html = useMemo(() => {
    try {
      return v.body ? convertLexicalToHTML({ data: v.body, disableContainer: true }) : ''
    } catch {
      return ''
    }
  }, [v.body])
  const words = html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length
  const minutes = Number(v.readMinutes) || (words ? Math.max(1, Math.round(words / 200)) : null)
  const origin = new URL(usSite).origin
  const date = v.date || new Date().toISOString()
  const dateLabel = new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })

  return (
    <PostPreview
      frame={{
        src: `${origin}/blog/preview`,
        origin,
        message: {
          type: 'juma:post-preview',
          post: {
            title: v.title || 'The title shows here',
            excerpt: v.excerpt || '',
            date,
            author: v.author || '',
            category: category?.nome || '',
            // A capa vem do painel: o site EUA precisa do endereço completo.
            cover: cover && typeof window !== 'undefined' ? new URL(cover, window.location.origin).toString() : null,
            bodyHtml: html,
            readMinutes: minutes,
          },
        },
      }}
      google={{
        url: `${origin.replace(/^https?:\/\//, '')}/blog/${v.slug || '…'}`,
        title: v.title ? `${v.title} — Juma-Agro Fertilizer LLC` : '',
        description: v.excerpt ?? '',
      }}
      card={
        <article className="jpv-card jpv-card--us">
          <div className="jpv-card__cover">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {cover && <img src={cover} alt="" />}
            {category?.nome && <span className="jpv-card__pill">{category.nome}</span>}
          </div>
          <div className="jpv-card__body">
            <small>
              {dateLabel}
              {minutes ? ` · ${minutes} min read` : ''}
            </small>
            <h3 className={v.title ? '' : 'is-empty'}>{v.title || 'The title shows here'}</h3>
            {v.excerpt && <p>{v.excerpt}</p>}
          </div>
        </article>
      }
    />
  )
}
