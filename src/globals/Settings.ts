import type { GlobalConfig } from 'payload'

import { isAdmin, isLoggedIn } from '../access/roles'
import { addresses, contact } from '../config/site'
import { revalidateAllPages } from '../features/cms/revalidate'

/**
 * Contato do site Brasil. Rodapé, página de contato e botões de WhatsApp leem
 * daqui; campo vazio volta ao valor de `src/config/site.ts`. As redes ficam
 * em Redes sociais (globals/Social.ts).
 */
export const Settings: GlobalConfig = {
  slug: 'settings',
  label: 'Contato',
  admin: {
    group: 'Site Brasil',
    description: 'WhatsApp, telefone, e-mails, horário e endereços do site Brasil. Ao salvar, o site atualiza em alguns segundos.',
    hideAPIURL: true,
  },
  access: { read: () => true, update: isAdmin, readVersions: isLoggedIn },
  hooks: { afterChange: [() => revalidateAllPages()] },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'whatsapp',
          label: 'WhatsApp',
          type: 'text',
          defaultValue: contact.whatsappNumber,
          admin: {
            width: '50%',
            description: 'Com DDI e DDD, como deve aparecer: +55 19 99964-8186. Todos os botões de WhatsApp usam este número.',
          },
        },
        {
          name: 'telefone',
          label: 'Telefone fixo',
          type: 'text',
          defaultValue: contact.phone,
          admin: { width: '50%', description: 'Como deve aparecer: (19) 3891-6415.' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'email',
          label: 'E-mail principal (marketing)',
          type: 'email',
          defaultValue: contact.email,
          admin: { width: '33%' },
        },
        {
          name: 'emailCompras',
          label: 'E-mail de compras',
          type: 'email',
          defaultValue: 'analucia@juma-agro.com.br',
          admin: { width: '33%' },
        },
        {
          name: 'emailRH',
          label: 'E-mail de RH',
          type: 'email',
          defaultValue: 'rh@juma-agro.com.br',
          admin: { width: '33%' },
        },
      ],
    },
    {
      name: 'horario',
      label: 'Horário de atendimento',
      type: 'textarea',
      localized: true,
      admin: {
        rows: 2,
        description:
          'Uma linha por período, ex.: "Seg a qui, 7h30 às 17h15" e "Sex, 7h30 às 16h". Vazio: usa o texto padrão do site.',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'enderecoBR',
          label: 'Endereço no Brasil',
          type: 'group',
          admin: { width: '50%' },
          fields: [
            { name: 'empresa', label: 'Razão social', type: 'text', defaultValue: addresses.br.company },
            {
              name: 'linhas',
              label: 'Endereço',
              type: 'textarea',
              defaultValue: addresses.br.lines.join('\n'),
              admin: { rows: 2, description: 'Uma linha por quebra.' },
            },
          ],
        },
        {
          name: 'enderecoUS',
          label: 'Endereço nos EUA',
          type: 'group',
          admin: { width: '50%' },
          fields: [
            { name: 'empresa', label: 'Razão social', type: 'text', defaultValue: addresses.us.company },
            {
              name: 'linhas',
              label: 'Endereço',
              type: 'textarea',
              defaultValue: addresses.us.lines.join('\n'),
              admin: { rows: 2, description: 'Uma linha por quebra.' },
            },
          ],
        },
      ],
    },
    {
      name: 'mapa',
      label: 'Endereço para o mapa',
      type: 'text',
      defaultValue: 'Juma Agro, R. Victor Acierini, 2370, Mogi Guaçu - SP',
      admin: { description: 'O que o Google Maps procura no mapa da página de contato.' },
    },
  ],
}
