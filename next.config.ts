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
    //
    // 80 e 85 entram na lista porque o componente PEDE esses valores
    // (AminosanStory, HomeProductShowcase, HomeExperience em 85; HomeCultures
    // em 80). Quando o valor pedido não está na lista, o Next não falha: ele
    // arredonda para a qualidade listada mais próxima — e arredondava PARA
    // CIMA, servindo tudo isso a 90. Os stills do Aminosan, os frascos do
    // catálogo e o still do Experience (292 KB no original) estavam saindo mais
    // pesados do que o código pediu, em todo aparelho.
    qualities: [60, 75, 80, 85, 90],
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
        pathname: '/solution/**',
      },
      {
        pathname: '/linha-produtos/**',
      },
      {
        pathname: '/about/**',
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
        pathname: '/assets/products/**',
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
  // O programa "Desata" virou "Olho no Alvo" — redirect permanente pra quem
  // ainda tem o link antigo salvo/indexado (busca, favoritos, materiais impressos).
  async redirects() {
    return [
      { source: '/:locale/desata', destination: '/:locale/olho-no-alvo', permanent: true },
    ]
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
