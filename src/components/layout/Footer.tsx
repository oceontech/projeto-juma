import Image from 'next/image'
import { useTranslations } from 'next-intl'

import { Link } from '@/i18n/navigation'
import {
  navLinks,
  jobsUrl,
  contact,
  socials,
  addresses,
  legalName,
} from '@/config/site'
import { Container } from './Container'
import { socialIcons } from '@/components/icons/social'

export function Footer() {
  const t = useTranslations('nav')
  const tf = useTranslations('footer')
  const year = new Date().getFullYear()

  return (
    <footer className="bg-primary text-white/80">
      <Container as="div" className="py-3xl">
        <div className="grid gap-2xl md:grid-cols-2 lg:grid-cols-4">
          {/* Marca */}
          <div className="flex flex-col gap-lg">
            <Image
              src="/brand/logo-juma-agro.png"
              alt="Juma Agro"
              width={160}
              height={81}
              className="h-16 w-auto object-contain"
            />
            <p className="text-heading max-w-[18rem] text-lg leading-snug text-white">
              {tf('tagline')}
            </p>
            <div>
              <h2 className="text-eyebrow mb-md text-xs uppercase tracking-widest text-white/50">
                {tf('socialTitle')}
              </h2>
              <ul className="flex gap-sm">
                {socials.map((social) => {
                  const Icon = socialIcons[social.key]
                  return (
                    <li key={social.key}>
                      <a
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={social.label}
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                      >
                        {Icon ? <Icon width="20" height="20" /> : null}
                      </a>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>

          {/* Navegação */}
          <nav aria-label={tf('navTitle')}>
            <h2 className="text-eyebrow mb-md text-xs uppercase tracking-widest text-white/50">
              {tf('navTitle')}
            </h2>
            <ul className="flex flex-col gap-sm">
              {navLinks.map((link) => (
                <li key={link.key}>
                  <Link
                    href={link.href}
                    className="text-body-regular text-sm text-white/80 transition-colors hover:text-white"
                  >
                    {t(link.key)}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href={jobsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-body-regular text-sm text-white/80 transition-colors hover:text-white"
                >
                  {t('jobs')}
                </a>
              </li>
            </ul>
          </nav>

          {/* Contato */}
          <div>
            <h2 className="text-eyebrow mb-md text-xs uppercase tracking-widest text-white/50">
              {tf('contactTitle')}
            </h2>
            <ul className="flex flex-col gap-md text-sm">
              <li className="flex flex-col">
                <span className="text-white/50">{tf('whatsappLabel')}</span>
                <a
                  href={contact.whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-body-regular text-white/90 transition-colors hover:text-white"
                >
                  {contact.whatsappNumber}
                </a>
              </li>
              <li className="flex flex-col">
                <span className="text-white/50">{tf('emailLabel')}</span>
                <a
                  href={`mailto:${contact.email}`}
                  className="text-body-regular break-all text-white/90 transition-colors hover:text-white"
                >
                  {contact.email}
                </a>
              </li>
              <li className="flex flex-col">
                <span className="text-white/50">{tf('phoneLabel')}</span>
                <a
                  href={contact.phoneHref}
                  className="text-body-regular text-white/90 transition-colors hover:text-white"
                >
                  {contact.phone}
                </a>
              </li>
              <li className="flex flex-col">
                <span className="text-white/50">{tf('hoursLabel')}</span>
                <span className="text-body-regular text-white/90">{tf('hoursValue')}</span>
              </li>
            </ul>
          </div>

          {/* Endereços */}
          <div className="flex flex-col gap-lg text-sm">
            <div className="not-italic">
              <h2 className="text-eyebrow mb-sm text-xs uppercase tracking-widest text-white/50">
                {tf('addressBrTitle')}
              </h2>
              <address className="text-body-regular not-italic text-white/90">
                <span className="block">{addresses.br.company}</span>
                {addresses.br.lines.map((line) => (
                  <span key={line} className="block text-white/70">
                    {line}
                  </span>
                ))}
              </address>
            </div>
            <div>
              <h2 className="text-eyebrow mb-sm text-xs uppercase tracking-widest text-white/50">
                {tf('addressUsTitle')}
              </h2>
              <address className="text-body-regular not-italic text-white/90">
                <span className="block">{addresses.us.company}</span>
                {addresses.us.lines.map((line) => (
                  <span key={line} className="block text-white/70">
                    {line}
                  </span>
                ))}
              </address>
            </div>
          </div>
        </div>

        {/* Linha legal */}
        <div className="mt-3xl flex flex-col gap-sm border-t border-white/15 pt-lg text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-body-regular max-w-none">
            © {year} {legalName}. {tf('rights')}
          </p>
          <Link
            href="/politica-de-privacidade"
            className="text-body-regular text-white/70 transition-colors hover:text-white"
          >
            {tf('privacy')}
          </Link>
        </div>
      </Container>
    </footer>
  )
}
