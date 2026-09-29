import type { GlobalConfig } from 'payload'

import { isAdmin, isLoggedIn } from '../access/roles'
import { socials } from '../config/site'
import { revalidateAllPages } from '../features/cms/revalidate'
import { revalidateUsSite } from '../features/cms/revalidateUs'

const social = (key: string) => socials.find((s) => s.key === key)?.href

/** Redes sociais do site Brasil (rodapé). Rede sem link some do site. */
export const Social: GlobalConfig = {
  slug: 'redes',
  label: 'Redes sociais',
  admin: {
    group: 'Site Brasil',
    description: 'Link completo de cada perfil. A rede sem link some do rodapé do site Brasil.',
    hideAPIURL: true,
  },
  access: { read: () => true, update: isAdmin, readVersions: isLoggedIn },
  hooks: { afterChange: [() => revalidateAllPages()] },
  fields: [
    { name: 'instagram', label: 'Instagram', type: 'text', defaultValue: social('instagram') },
    { name: 'tiktok', label: 'TikTok', type: 'text', defaultValue: social('tiktok') },
    { name: 'youtube', label: 'YouTube', type: 'text', defaultValue: social('youtube') },
    { name: 'linkedin', label: 'LinkedIn', type: 'text', defaultValue: social('linkedin') },
    { name: 'facebook', label: 'Facebook', type: 'text', defaultValue: social('facebook') },
  ],
}

/** Redes sociais do site americano (rodapé). Rede sem link não aparece. */
export const SocialUs: GlobalConfig = {
  slug: 'redes-us',
  label: 'Redes sociais',
  admin: {
    group: 'Site EUA',
    description: 'Link completo do perfil americano de cada rede. Rede sem link não aparece no site dos EUA.',
    hideAPIURL: true,
  },
  access: { read: () => true, update: isAdmin, readVersions: isLoggedIn },
  hooks: { afterChange: [() => revalidateUsSite(['/', '/blog', '/kmep', '/kmep-b', '/aminosan'])] },
  fields: [
    { name: 'instagram', label: 'Instagram', type: 'text' },
    { name: 'facebook', label: 'Facebook', type: 'text' },
    { name: 'linkedin', label: 'LinkedIn', type: 'text' },
    { name: 'youtube', label: 'YouTube', type: 'text' },
    { name: 'x', label: 'X (Twitter)', type: 'text' },
  ],
}
