/**
 * Marca da Juma no painel: o logo original (o mesmo da navbar dos sites) só no
 * topo da sidebar e no login. <img> simples: o painel não passa pelo
 * otimizador de imagens do site; o arquivo já é uma versão leve (10 KB).
 */
const LOGO = '/brand/logo-juma-agro-painel.webp'

/** Logo da tela de login. */
export function Logo() {
  return (
    <div className="juma-login-brand">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={LOGO} alt="Juma Agro" width={144} height={73} />
      <span>Painel de gestão dos sites</span>
    </div>
  )
}

/** Início do caminho no cabeçalho: ícone neutro (a marca fica só na sidebar). */
export function Icon() {
  return (
    <svg className="juma-home-icon" viewBox="0 0 24 24" aria-label="Visão geral" role="img">
      <path d="M3 11l9-8 9 8" />
      <path d="M5 10v10h14V10" />
    </svg>
  )
}

/** Logo no topo da sidebar. */
export function SidebarBrand() {
  return (
    <a className="juma-brand" href="/admin" aria-label="Juma Agro — visão geral do painel">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={LOGO} alt="Juma Agro" width={96} height={49} />
    </a>
  )
}
