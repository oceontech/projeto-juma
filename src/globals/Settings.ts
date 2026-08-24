import type { GlobalConfig } from 'payload'

export const Settings: GlobalConfig = {
  slug: 'settings',
  label: 'Configurações',
  admin: { group: 'Site' },
  access: { read: () => true },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'whatsapp',
          type: 'text',
          admin: { description: 'WhatsApp de conversão, ex: +55 19 99964-8186', width: '50%' },
        },
        { name: 'telefone', type: 'text', admin: { width: '50%' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'email', type: 'email', admin: { width: '50%' } },
        { name: 'horarioAtendimento', type: 'text', admin: { width: '50%' } },
      ],
    },
    {
      name: 'redes',
      type: 'group',
      label: 'Redes sociais',
      fields: [
        { name: 'instagram', type: 'text' },
        { name: 'tiktok', type: 'text' },
        { name: 'youtube', type: 'text' },
        { name: 'linkedin', type: 'text' },
        { name: 'facebook', type: 'text' },
      ],
    },
  ],
}
