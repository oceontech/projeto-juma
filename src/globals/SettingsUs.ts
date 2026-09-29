import type { GlobalConfig } from 'payload'

import { isAdmin, isLoggedIn } from '../access/roles'
import { revalidateUsSite } from '../features/cms/revalidateUs'

/**
 * Contato e redes do site americano. Rodapé e bloco "U.S. operation" leem
 * daqui; campo vazio some do site (a LLC ainda não tem telefone nem redes).
 */
export const SettingsUs: GlobalConfig = {
  slug: 'settings-us',
  label: 'Configurações',
  admin: {
    group: 'Site',
    description: 'Contato, endereço e redes que aparecem no site dos EUA. Campo vazio não aparece no site.',
    hideAPIURL: true,
  },
  access: { read: () => true, update: isAdmin, readVersions: isLoggedIn },
  hooks: { afterChange: [() => revalidateUsSite(['/', '/blog', '/kmep', '/kmep-b', '/aminosan'])] },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Contato',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'email', label: 'E-mail', type: 'email', admin: { width: '50%', description: 'Ex.: sales@juma-agro.com' } },
                { name: 'phone', label: 'Telefone', type: 'text', admin: { width: '50%', description: 'Como deve aparecer: +1 (863) 555-0100.' } },
              ],
            },
            { name: 'hours', label: 'Horário de atendimento (em inglês)', type: 'text', admin: { description: 'Ex.: Mon–Fri, 8 a.m.–5 p.m. ET' } },
            {
              type: 'row',
              fields: [
                { name: 'company', label: 'Razão social', type: 'text', defaultValue: 'Juma-Agro Fertilizer LLC', admin: { width: '50%' } },
                {
                  name: 'address',
                  label: 'Endereço',
                  type: 'textarea',
                  defaultValue: '3928 Anchuca Drive, Suite 11\nLakeland, FL 33811',
                  admin: { width: '50%', rows: 2, description: 'Uma linha por quebra.' },
                },
              ],
            },
          ],
        },
        {
          label: 'Redes sociais',
          fields: [
            {
              name: 'social',
              label: 'Redes sociais',
              type: 'group',
              admin: { description: 'Link completo do perfil americano. Rede sem link não aparece no site.' },
              fields: [
                { name: 'instagram', type: 'text' },
                { name: 'facebook', type: 'text' },
                { name: 'linkedin', label: 'LinkedIn', type: 'text' },
                { name: 'youtube', label: 'YouTube', type: 'text' },
                { name: 'x', label: 'X (Twitter)', type: 'text' },
              ],
            },
          ],
        },
      ],
    },
  ],
}
