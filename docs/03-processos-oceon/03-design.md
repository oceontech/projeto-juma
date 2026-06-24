# Processo 03 — Design

**Objetivo:** transformar PRD + identidade do cliente em design system e layouts aprovados, prontos para implementação.

## Gatilho
PRD aprovado + logo vetorial e paleta confirmadas em mãos (bloqueio explícito: sem logo vetorial não começa).

## Passos

1. **Tokens & Foundations no Figma** — variables de cor (validadas contra o logo real), tipografia, espaçamento, sombras
2. **Component Library** — todos os componentes com variantes e estados (hover, focus, disabled, erro)
3. **Layouts** — desktop + mobile de todas as páginas do sitemap; mobile-first
4. **Design Guide** — do & don't, regras de uso
5. **Features de risco visual** (animações complexas, WebGL): apresentar ao cliente **somente após o protótipo-gate técnico aprovar** o efeito (plano A) ou seu plano B
6. **Apresentação ao aprovador único** — por blocos (foundations → componentes → páginas), nunca tudo de uma vez
7. **Registrar feedback e iterar** — máximo de rodadas definido em contrato

## Estrutura de arquivos Figma (padrão Oceon)

| Arquivo | Conteúdo |
|---|---|
| 🎨 [Cliente] — Tokens & Foundations | Variables de cor, tipo, espaçamento, sombras |
| 🧩 [Cliente] — Component Library | Componentes com variantes |
| 📱 [Cliente] — Site Layouts | Layouts desktop + mobile |
| 📖 [Cliente] — Design Guide | Guia de uso |

## Entregáveis
- 4 arquivos Figma + tokens exportáveis para código
- Especificação de animações com técnica, performance e fallbacks (`prefers-reduced-motion` sempre)

## Gate de saída
- [ ] Layouts de todas as páginas aprovados pelo aprovador único
- [ ] Tokens espelhados em código (Tailwind config) sem divergência
- [ ] Acessibilidade revisada no design (contraste WCAG AA, estados de foco)

## Lições do projeto Juma
- Texto **nunca queimado em imagem/vídeo** — sites multilíngues exigem texto em HTML (SEO, tradução, acessibilidade); o site antigo da Juma errava nisso
- Seletor de idioma em texto, não bandeiras
- O design system vira página autoral `/design` no próprio site (ADR-008) — projetar pensando nessa vitrine
