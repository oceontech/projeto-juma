# Análise do Site Antigo — juma-agro.com.br

> Raspagem completa em 11/06/2026 via Firecrawl: **98 páginas** (markdown + links + screenshot full-page por página) + 11 PDFs convertidos. Acervo em [`.firecrawl/juma-agro.com.br/`](../../.firecrawl/juma-agro.com.br/).

## Perfil técnico

- WordPress com tema custom "jumaagro" (2019), hospedado na Hostgator
- Bilíngue PT/EN (árvore `/en/` espelhada, com erros de tradução: "produtivities", "coffe")
- Bootstrap, banners JPG com texto chapado na imagem, carrosséis duplicados desktop/mobile

## Estrutura de conteúdo

| Seção | Detalhe |
|---|---|
| Home | Carrossel de banners, institucional, programas, carrossel de produtos, eventos, formulário, mapa |
| Empresa | História institucional |
| Culturas (10) | algodão, batata, café, cana, citros, feijão, milho, pastagem, soja, tomate — **a listagem exibe só 9 com foto (thumbnail quebrado)** |
| Produtos (13) | ver de/para em [04-inventario-e-redirects.md](04-inventario-e-redirects.md) |
| Programas | Olho no Alvo, Boi Gordo, Projeto DESATA (UENP/NITEC, 2021) |
| Eventos/notícias | **Parado desde 2020** (últimos posts 2019–2020) |
| Áreas de contato | Formulários por departamento: administrativo, RH, comercial, faturamento, contas a receber, currículo |
| PDFs (11) | Prospectos, publicações técnicas (micronutrientes, nodulação, nitrogênio) e artigos de imprensa |

## Problemas identificados

1. **Conteúdo desatualizado** — blog parado em 2020 enquanto as redes sociais seguem ativas (2026)
2. **Visual datado** — layout 2019, texto queimado em imagem (ruim p/ SEO, acessibilidade e responsividade)
3. **Instabilidade do servidor** — Hostgator derrubou conexões ("Connection Reset") em 15 das 98 páginas durante a raspagem; reforça a migração
4. **Mistura http/https** nas URLs internas; menu duplicado no HTML; thumbnail quebrado na listagem de culturas
5. **EN com erros** de ortografia e slugs inconsistentes (`coffe`, `produtivities`, sufixos `-2`)
6. **Sem captura de lead estruturada** — formulário genérico por departamento, sem contexto de produto/cultura

## Pontos fortes a preservar

- Catálogo produto×cultura bem estruturado (mesma lógica do briefing novo)
- Acervo técnico em PDF — autoridade; avaliar migrar como "Materiais técnicos"/blog
- Presença bilíngue real (operação nos EUA) — o novo site amplia para ES
- Reputação: 4.9★ no Google Maps

## Uso do acervo raspado

- **Inventário de URLs** → base do mapa de redirects 301 ([04-inventario-e-redirects.md](04-inventario-e-redirects.md))
- **Screenshots** → referência visual comparativa (antes/depois) para apresentação ao cliente
- **PDFs em markdown** → matéria-prima para seções técnicas do novo site
