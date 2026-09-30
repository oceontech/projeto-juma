'use client'

import { FormSubmit, useConfig, useDocumentInfo, useForm, useFormFields, useFormModified, useLocale } from '@payloadcms/ui'
import { useCallback } from 'react'

import { isScheduled } from './PublishWhen'

/**
 * Botão de publicar do post, sem o menu extra do Payload:
 * - post novo: "Publicar agora" (a data vira o momento do clique) ou
 *   "Agendar publicação" quando o agendamento está ligado;
 * - post já no ar: "Publicar alterações" (ou "Salvar agendamento").
 */
export function PublishButton(props: { dateField?: string }) {
  const dateField = props.dateField ?? 'data'
  const { id, collectionSlug, hasPublishedDoc, hasPublishPermission, setHasPublishedDoc, setUnpublishedVersionCount, setMostRecentVersionIsAutosaved, unpublishedVersionCount, uploadStatus } =
    useDocumentInfo()
  const { submit } = useForm()
  const modified = useFormModified()
  const { code: locale } = useLocale()
  const { config } = useConfig()
  const date = useFormFields(([fields]) => fields[dateField]?.value as string | undefined)
  const scheduled = isScheduled(date)

  const canPublish = hasPublishPermission && (modified || unpublishedVersionCount > 0 || !hasPublishedDoc) && uploadStatus !== 'uploading'

  const publish = useCallback(async () => {
    if (uploadStatus === 'uploading') return
    const params = new URLSearchParams({ depth: '0', ...(locale ? { locale } : {}) })
    const action = `${config.routes.api}/${collectionSlug}${id ? `/${id}` : ''}?${params}`
    // Primeira publicação sem agendamento: a data da matéria é agora.
    const overrides: Record<string, unknown> = { _status: 'published' }
    if (!hasPublishedDoc && !scheduled) overrides[dateField] = new Date().toISOString()
    const result = await submit({ action, overrides })
    if (result) {
      setUnpublishedVersionCount(0)
      setMostRecentVersionIsAutosaved(false)
      setHasPublishedDoc(true)
    }
  }, [uploadStatus, locale, config, collectionSlug, id, hasPublishedDoc, scheduled, dateField, submit, setUnpublishedVersionCount, setMostRecentVersionIsAutosaved, setHasPublishedDoc])

  if (!hasPublishPermission) return null

  const label = hasPublishedDoc ? (scheduled ? 'Salvar agendamento' : 'Publicar alterações') : scheduled ? 'Agendar publicação' : 'Publicar agora'

  return (
    <FormSubmit buttonId="action-save" className="jpub" disabled={!canPublish} onClick={publish} size="medium" type="button">
      <span className="jpub__in">
        {scheduled ? (
          <svg viewBox="0 0 24 24" aria-hidden>
            <rect x="3" y="5" width="18" height="16" rx="3" />
            <path d="M3 10h18M8 3v4M16 3v4" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" aria-hidden>
            <path d="M4 12 20 4l-6 16-3-7z" />
            <path d="m11 13 3-3" />
          </svg>
        )}
        {label}
      </span>
    </FormSubmit>
  )
}
