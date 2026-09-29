import type { Field, GlobalConfig } from 'payload'

import { hasRole, isLoggedIn } from '../access/roles'
import { revalidateSite } from '../features/cms/revalidate'
import { SHOWCASE_ICONS } from '../features/home/showcase'

/**
 * Catálogo em destaque da home do site Brasil (a seção que troca a cor de
 * fundo a cada produto). O Aminosan abre a seção sempre, porque a animação
 * anterior termina no frasco dele: aqui só se editam os textos dele.
 */

const hex = (value: unknown) =>
  !value || /^#[0-9a-fA-F]{6}$/.test(String(value)) ? true : 'Use o formato #RRGGBB, ex.: #0a2a3f.'

const beneficios = (description: string, collapsed = false): Field => ({
  name: 'beneficios',
  label: 'Benefícios',
  type: 'array',
  minRows: 3,
  maxRows: 3,
  labels: { singular: 'Benefício', plural: 'Benefícios' },
  admin: {
    description,
    initCollapsed: collapsed,
    components: { RowLabel: { path: '/components/admin/fields/RowLabel#RowLabel', clientProps: { fields: ['titulo'], fallback: 'Benefício' } } },
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'icone',
          label: 'Ícone',
          type: 'select',
          required: true,
          options: SHOWCASE_ICONS.map((i) => ({ label: i.label, value: i.value })),
          admin: { width: '30%' },
        },
        { name: 'titulo', label: 'Título', type: 'text', required: true, localized: true, admin: { width: '35%' } },
        { name: 'apoio', label: 'Texto de apoio', type: 'text', localized: true, admin: { width: '35%' } },
      ],
    },
  ],
})

export const HomeHighlights: GlobalConfig = {
  slug: 'destaques',
  label: 'Destaques da home',
  admin: {
    group: 'Conteúdo',
    description:
      'Produtos da seção colorida da home, na ordem em que aparecem. O Aminosan abre sempre a seção; os demais você adiciona, tira e reordena arrastando.',
    hideAPIURL: true,
  },
  access: { read: () => true, update: ({ req }) => hasRole(req, 'admin', 'editor'), readVersions: isLoggedIn },
  hooks: { afterChange: [() => revalidateSite(['/'])] },
  fields: [
    {
      name: 'aminosan',
      label: 'Aminosan (fixo em 1º lugar)',
      type: 'group',
      admin: {
        description: 'Não sai nem muda de posição: a animação da seção anterior termina no frasco dele. Aqui ficam só os textos.',
      },
      fields: [
        { name: 'descricao', label: 'Frase de apresentação', type: 'textarea', localized: true, admin: { rows: 2 } },
        beneficios('Os 3 pontos à direita do frasco. Vazio usa o texto atual do site.'),
      ],
    },
    {
      name: 'produtos',
      label: 'Demais produtos',
      type: 'array',
      minRows: 2,
      maxRows: 7,
      labels: { singular: 'Produto', plural: 'Produtos' },
      admin: {
        description: 'Mínimo 2 para o carrossel funcionar. Arraste para mudar a ordem; clique no produto para abrir.',
        initCollapsed: true,
        components: { RowLabel: { path: '/components/admin/fields/HighlightRowLabel#HighlightRowLabel' } },
      },
      fields: [
        {
          name: 'produto',
          label: 'Produto',
          type: 'relationship',
          relationTo: 'products',
          required: true,
          filterOptions: { slug: { not_equals: 'aminosan' } },
          admin: { description: 'Nome, frasco, embalagens e link vêm do cadastro do produto.' },
        },
        {
          name: 'titulo',
          label: 'Nome em linhas (opcional)',
          type: 'textarea',
          admin: {
            rows: 2,
            description: 'Para quebrar nomes longos: uma linha por parte, ex.: "Acorda" e "Ultra". Vazio usa o nome do produto.',
          },
        },
        { name: 'descricao', label: 'Frase de apresentação', type: 'textarea', required: true, localized: true, admin: { rows: 2 } },
        beneficios('Os 3 pontos à direita do frasco.', true),
        {
          type: 'row',
          fields: [
            {
              name: 'corFundo',
              label: 'Cor de fundo',
              type: 'text',
              required: true,
              defaultValue: '#062418',
              validate: hex,
              admin: { width: '50%', description: 'Escura: o texto é branco. Ex.: #062418.' },
            },
            {
              name: 'corDestaque',
              label: 'Cor de destaque',
              type: 'text',
              required: true,
              defaultValue: '#f2c94c',
              validate: hex,
              admin: { width: '50%', description: 'Anéis, ícones e embalagens. Ex.: #f2c94c.' },
            },
          ],
        },
      ],
    },
  ],
}
