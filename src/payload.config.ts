import { postgresAdapter } from '@payloadcms/db-postgres'
import { pt } from '@payloadcms/translations/languages/pt'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
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
  },
  // Interface do painel em português para a equipe da Juma.
  i18n: {
    supportedLanguages: { pt },
    fallbackLanguage: 'pt',
  },
  collections: [Products, Cultures, Articles, Pages, Leads, Media, Users],
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
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  plugins: [],
  // Usuários criados antes dos papéis existirem ficam sem acesso. Se não houver
  // nenhum admin, o usuário mais antigo vira admin dos dois sites.
  onInit: async (payload) => {
    const { totalDocs } = await payload.count({
      collection: 'users',
      where: { papel: { equals: 'admin' } },
      overrideAccess: true,
    })
    if (totalDocs > 0) return
    const { docs } = await payload.find({ collection: 'users', sort: 'createdAt', limit: 1, overrideAccess: true })
    if (!docs[0]) return
    await payload.update({
      collection: 'users',
      id: docs[0].id,
      data: { papel: 'admin', sites: ['br', 'us'] },
      overrideAccess: true,
    })
    payload.logger.info(`Papel admin atribuído a ${docs[0].email}`)
  },
})
