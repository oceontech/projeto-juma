import type { CollectionConfig } from 'payload'

import { isLoggedIn } from '../access/roles'

/**
 * Fotos de perfil da equipe. Ficam fora da biblioteca de mídia (que é o
 * material dos sites) e só aparecem pela tela da conta.
 */
export const Avatars: CollectionConfig = {
  slug: 'avatars',
  labels: { singular: 'Foto de perfil', plural: 'Fotos de perfil' },
  admin: { hidden: true },
  access: {
    read: () => true,
    create: isLoggedIn,
    update: isLoggedIn,
    delete: isLoggedIn,
  },
  upload: {
    mimeTypes: ['image/*'],
    imageSizes: [{ name: 'thumb', width: 256, height: 256, position: 'centre' }],
    adminThumbnail: 'thumb',
  },
  fields: [],
}
