import { postgresAdapter } from '@payloadcms/db-postgres'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { pt } from '@payloadcms/translations/languages/pt'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig, type Payload } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Products } from './collections/Products'
import { Cultures } from './collections/Cultures'
import { Articles } from './collections/Articles'
import { Leads } from './collections/Leads'
import { Pages } from './collections/Pages'
import { Settings } from './globals/Settings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    // O tema escuro/claro é do próprio painel (src/app/(payload)/custom.scss).
    theme: 'light',
    dateFormat: 'dd/MM/yyyy HH:mm',
    meta: { titleSuffix: ' · Painel Juma' },
    components: {
      graphics: {
        Logo: '/components/admin/Brand#Logo',
        Icon: '/components/admin/Brand#Icon',
      },
      beforeNavLinks: [
        '/components/admin/Brand#SidebarBrand',
        '/components/admin/SiteSwitcher#SiteSwitcher',
        '/components/admin/NavOverview#NavOverview',
      ],
      logout: { Button: '/components/admin/NavAccount#NavAccount' },
      views: {
        dashboard: { Component: '/components/admin/Dashboard#Dashboard' },
      },
    },
  },
  // Interface do painel em português para a equipe da Juma.
  i18n: {
    supportedLanguages: { pt },
    fallbackLanguage: 'pt',
    translations: {
      pt: { general: { locale: 'Idioma', locales: 'Idiomas', allLocales: 'Todos os idiomas' } },
    },
  },
  // A ordem aqui é a ordem dos grupos na sidebar: Operação, Conteúdo, Site, Biblioteca, Administração.
  collections: [Leads, Articles, Products, Cultures, Pages, Media, Users],
  globals: [Settings],
  localization: {
    locales: [
      { label: 'Português', code: 'pt-BR' },
      { label: 'English', code: 'en' },
      { label: 'Español', code: 'es' },
    ],
    defaultLocale: 'pt-BR',
    fallback: true,
  },
  // Sem GraphQL (ADR-003): o site e o painel usam REST + Local API.
  graphQL: { disable: true },
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  // Banco exclusivo do painel (Neon "juma-painel", via Marketplace da Vercel).
  // O nome tem prefixo para nunca cair no DATABASE_URL antigo, que é de outra aplicação.
  // O schema só muda por migrations (src/migrations): `npm run migrate:create` e `npm run migrate`.
  db: postgresAdapter({
    pool: {
      connectionString: process.env.PAYLOAD_DATABASE_URL || '',
    },
    push: false,
    migrationDir: path.resolve(dirname, 'migrations'),
  }),
  sharp,
  plugins: [
    // Uploads da coleção Media no Vercel Blob (store "juma-painel-midia").
    vercelBlobStorage({
      enabled: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      // Toda a mídia do site é pública: a URL aponta direto para a CDN do Blob,
      // sem passar pelo servidor do Payload (a opção vale por coleção).
      collections: { media: { disablePayloadAccessControl: true } },
      token: process.env.BLOB_READ_WRITE_TOKEN,
    }),
  ],
  // Usuários criados antes dos papéis existirem ficam sem acesso. Se não houver
  // nenhum admin, o usuário mais antigo vira admin dos dois sites.
  onInit: async (payload) => {
    try {
      await promoteFirstAdmin(payload)
    } catch (err) {
      // Banco ainda sem as tabelas (antes da primeira migration): nada a fazer.
      payload.logger.warn({ err, msg: 'onInit: verificação de admin ignorada' })
    }
  },
})

async function promoteFirstAdmin(payload: Payload) {
  const { totalDocs } = await payload.count({
    collection: 'users',
    where: { papel: { equals: 'admin' } },
    overrideAccess: true,
  })
  if (totalDocs > 0) return
  const { docs } = await payload.find({
    collection: 'users',
    sort: 'createdAt',
    limit: 1,
    overrideAccess: true,
  })
  if (!docs[0]) return
  await payload.update({
    collection: 'users',
    id: docs[0].id,
    data: { papel: 'admin', sites: ['br', 'us'] },
    overrideAccess: true,
  })
  payload.logger.info(`Papel admin atribuído a ${docs[0].email}`)
}
