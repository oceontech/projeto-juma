'use client'

/**
 * Visitas da equipe: quem abre o painel já fica fora do Umami no site Brasil
 * (mesmo domínio, feito no cabeçalho do painel). O site EUA fica em outro
 * domínio: basta abrir uma vez este link em cada navegador.
 */
export function ExcludeMe({ usSite }: { usSite?: string | null }) {
  return (
    <div className="ja-exclude is-off">
      <span title="Quem usa o painel não é contado nas visitas do site Brasil">
        <i aria-hidden />
        Visitas da equipe não contam
      </span>
      {usSite && (
        <a href={`${usSite.replace(/\/$/, '')}/?nao-contar=1`} target="_blank" rel="noopener noreferrer" title="Abra uma vez em cada navegador da equipe">
          marcar também no site EUA ↗
        </a>
      )}
    </div>
  )
}
