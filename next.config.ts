import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {
  images: {
    deviceSizes: [320, 420, 480, 640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    // Next 16 só serve as qualidades listadas (padrão [75]) — sem o 90 aqui o
    // otimizador responde 400 para os frascos do catálogo da home.
    qualities: [60, 75, 90],
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
      {
        pathname: '/brand/**',
      },
      {
        pathname: '/desata/**',
      },
      {
        pathname: '/hero/**',
      },
      {
        pathname: '/heritage/**',
      },
      {
        pathname: '/produtos/**',
      },
      {
        pathname: '/cta-final/**',
      },
      {
        pathname: '/experience/**',
      },
      {
        pathname: '/assets/about/**',
      },
      {
        pathname: '/assets/cultures/**',
      },
      {
        pathname: '/assets/linha-produtos/**',
      },
      {
        pathname: '/materias/**',
      },
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
  experimental: {
    optimizeCss: true,
  },
}

export default withPayload(withNextIntl(nextConfig), { devBundleServerPackages: false })
