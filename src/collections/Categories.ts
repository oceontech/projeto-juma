import type { CollectionConfig } from 'payload'

import { hasRole } from '../access/roles'
import { revalidateSite } from '../features/cms/revalidate'
import { revalidateUsSite } from '../features/cms/revalidateUs'

/**
 * Categorias do blog, de cada site. Criadas e editadas pelo próprio campo
 * "Categoria" do post (botão + e lápis), sem tela na sidebar.
 */

const slugify = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export const Categories: CollectionConfig = {
  slug: 'categorias',
  labels: { singular: 'Categoria', plural: 'Categorias' },
  admin: {
    useAsTitle: 'nome',
    defaultColumns: ['nome', 'site', 'ordem'],
    group: 'Conteúdo',
    hidden: false,
    hideAPIURL: true,
    description: 'Assuntos do blog. Aparecem como etiqueta no post e viram filtro na página do blog.',
  },
  defaultSort: 'ordem',
  access: {
    read: () => true,
    create: ({ req }) => hasRole(req, 'admin', 'editor'),
    update: ({ req }) => hasRole(req, 'admin', 'editor'),
    delete: ({ req }) => hasRole(req, 'admin', 'editor'),
  },
  hooks: {
    beforeValidate: [
      ({ data, req }) => {
        // Endereço do filtro gerado pelo nome em português (ou inglês, no EUA).
        if (data && !data.slug && typeof data.nome === 'string') data.slug = slugify(data.nome)
        if (data && !data.site) data.site = (req.headers?.get?.('cookie') ?? '').includes('painel_site=us') ? 'us' : 'br'
        return data
      },
    ],
    afterChange: [
      async ({ doc }) => {
        if (doc.site === 'us') await revalidateUsSite(['/blog'])
        else revalidateSite(['/', '/materias'])
        return doc
      },
    ],
  },
  fields: [
    {
      name: 'nome',
      label: 'Nome',
      type: 'text',
      required: true,
      localized: true,
      admin: { description: 'Curto, uma ou duas palavras. Ex.: Nutrição, Manejo, Pecuária.' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'site',
          label: 'Site',
          type: 'select',
          required: true,
          defaultValue: 'br',
          options: [
            { label: 'Brasil', value: 'br' },
            { label: 'EUA', value: 'us' },
          ],
          admin: { width: '50%' },
        },
        {
          name: 'ordem',
          label: 'Ordem no filtro',
          type: 'number',
          defaultValue: 100,
          admin: { width: '50%', description: 'Menor aparece primeiro.' },
        },
      ],
    },
    { name: 'slug', type: 'text', index: true, admin: { hidden: true } },
  ],
}
