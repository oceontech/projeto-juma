/**
 * Marca da Juma no painel. <img> simples: o painel não passa pelo otimizador
 * de imagens do site.
 */

/** Logo grande da tela de login. */
export function Logo() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/logo-juma-agro.png" alt="Juma Agro" style={{ height: 56, width: 'auto' }} />
      <span style={{ fontSize: 13, color: '#71717a' }}>Painel de gestão dos sites</span>
    </div>
  )
}

/** Ícone do cabeçalho (link para a Visão geral), sobre o painel claro. */
export function Icon() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/brand/logo-juma-agro.png" alt="Juma Agro" style={{ height: 22, width: 'auto' }} />
  )
}

/** Marca branca no topo da sidebar escura. */
export function SidebarBrand() {
  return (
    <div className="juma-brand">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/logo-juma-agro-branca.png" alt="Juma Agro" />
      <span>Painel</span>
    </div>
  )
}
