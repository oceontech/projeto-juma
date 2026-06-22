# PRD — Juma Agro · Site Institucional
> **Versão:** 3.0 · **Data:** Junho 2026 · Substitui a v2.3
> **Cliente:** Juma Agro · **Agência:** Oceon
> **Responsável aprovação:** Rodrigo Henrique Moraes · rodrigo.moraes@juma-agro.com.br
> Mudanças em relação à v2.3 registradas em [decisoes.md](decisoes.md)

---

## 1. Visão Geral

### 1.1 Objetivo

Desenvolver o site institucional da Juma Agro — empresa com mais de 40 anos no mercado de insumos agrícolas — com foco em presença digital profissional, performance, SEO e conversão de leads. O projeto inclui **painel administrativo (Payload CMS)** para o time da Juma gerenciar conteúdo com autonomia, estruturado para suportar futuros projetos da Oceon para a Juma.

### 1.2 Propósito da marca

> *"Juntos alimentamos o mundo"* — permeia tom de voz, escolhas visuais e arquitetura de informação.

### 1.3 Objetivos mensuráveis

| Objetivo | Métrica |
|---|---|
| Presença digital | Top 5 no Google para termos de marca em 90 dias |
| Geração de leads | Pop-up WhatsApp como canal principal, mensurado via Umami |
| Autonomia do time | Juma atualiza conteúdo sem suporte externo |
| Performance | Lighthouse ≥ 90 (Performance, SEO, Acessibilidade) |
| Core Web Vitals | LCP < 2.5s · **INP < 200ms** · CLS < 0.1 |

---

## 2. Stakeholders

| Nome | Papel | Contato |
|---|---|---|
| Rodrigo Henrique Moraes | Aprovador único | rodrigo.moraes@juma-agro.com.br · (19) 99667-7445 |
| Debora Macias | Recebe leads / Marketing | marketing@juma-agro.com.br |
| Time Oceon | Desenvolvimento e entrega | — |
| Sr. Julio Matino | Fundador — referência institucional | — |

---

## 3. Stack Tecnológica

| Camada | Tecnologia | Justificativa |
|---|---|---|
| Site público + backend | **Next.js 16** + TypeScript (App Router) | Versão atual; SSR/SSG/ISR, Cache Components |
| CMS (integrado) | Payload CMS 3.x | Roda dentro do Next.js, sem servidor separado |
| Banco de dados | PostgreSQL no Neon (via Vercel Marketplace) | Serverless, variáveis automáticas, auto-suspend que acorda sozinho (ADR-006) |
| Storage de mídia | Cloudinary | WebP/AVIF automático, resize, CDN global |
| Analytics | Umami (self-hosted) | Open source, LGPD-friendly, sem cookies |
| Email transacional | Fora do escopo nesta versão (ADR-017) | Leads ficam no painel; aviso por e-mail fica para atualização futura |
| Design system | shadcn/ui + Tailwind + Radix UI | Componentes acessíveis, código no repo |
| Logs | Pino | JSON estruturado, leve |
| Error tracking | Sentry | Erros em produção, alertas |
| Background jobs | Payload Tasks (built-in) | Sem dependência externa |
| Animação | GSAP + ScrollTrigger | Orquestração do hero e triggers por seção |
| WebGL | Three.js | Efeito de água do hero (com plano B — ver 8.6) |
| Assets de vídeo | Kling AI | Gera clipes de transição e loops (produção, não runtime) |
| Geolocalização | `@vercel/functions` (geolocation) ou headers `x-vercel-ip-country` | `request.geo` foi removido no Next 15+ |
| Repositório | GitHub (repo único) | Um único app, sem monorepo |
| CI/CD | Vercel | Deploy no push, previews por branch |

> Autenticação do painel: nativa do Payload. O Neon é usado exclusivamente como Postgres.

---

## 4. Infraestrutura e Hospedagem

| Serviço | Plataforma | Custo estimado |
|---|---|---|
| Site + Payload CMS | Vercel Pro | ~$20/mês |
| PostgreSQL | Neon via Vercel Marketplace (ADR-006) | Free para começar |
| Mídia | Cloudinary | Free tier (25GB) |
| Analytics (Umami) | Vercel ou Railway | Marginal |
| Email | Não usado nesta versão | — |
| Domínio | Registro.br (mantém) | Atualizar DNS |

> Hostgator descontinuada após migração (servidor atual é instável — derrubou conexões durante a raspagem de inventário). Payload roda no mesmo deploy da Vercel.

---

## 5. Arquitetura do Sistema

### 5.1 Princípios

- **Um único repositório e um único app** — sem monorepo
- **Payload CMS integrado** ao Next.js no mesmo processo
- **REST + Server Actions** — sem GraphQL
- **Estrutura por features** — cada feature contém componentes, actions, tipos e queries
- **Observabilidade desde o início** — Sentry, logs e monitoramento antes do go-live

### 5.2 Estrutura de pastas

```
juma-agro/
├── src/
│   ├── app/                    → rotas Next.js (App Router)
│   ├── features/
│   │   ├── products/           ├── cultures/
│   │   ├── calculator/         ├── blog/
│   │   └── leads/
│   ├── components/ui/          → design system local (shadcn/ui)
│   ├── lib/                    → helpers, clients, utils
│   └── payload/
│       ├── collections/  hooks/  payload.config.ts
├── docs/
│   ├── decisions/  architecture/  guides/
└── package.json
```

### 5.3 Fluxo de dados

```
Usuário → Next.js (SSG/ISR/Server Actions) → Payload CMS (mesmo processo) → PostgreSQL
Mídia → Cloudinary · Analytics → Umami · Erros → Sentry
Leads → Payload (visíveis na aba Leads do painel; sem e-mail nesta versão)
```

### 5.4 Renderização por rota

| Página | Estratégia |
|---|---|
| Home, listagens, culturas, produtos | SSG + ISR (revalida ao publicar no CMS) |
| Produto/Cultura individual | SSG + `generateStaticParams` |
| Calculadora | Client-side + dados SSG |
| Juma Experience, Sobre, Contato | SSG (contato com Server Action) |
| Blog/Matérias | SSG + ISR |
| Vagas | Sem rota — link externo (Sólides), URL editável no CMS |

---

## 6. Design System

### 6.1 Tokens de cor

| Token | HEX | Uso |
|---|---|---|
| `color-primary` | **#004C26** | Verde principal — confirmado pelo RGB 0,76,38 do briefing; validar contra o logo vetorial |
| `color-secondary` | #302783 | Azul-roxo — destaques |
| `color-support-1` | #659357 | Verde médio — bordas, badges, ícones |
| `color-neutral` | #FFFFFF | Tipografia sobre fundo escuro |
| `color-text-primary` | #1A1A1A | Corpo de texto |
| `color-text-muted` | #555555 | Secundários, legendas |
| `color-bg-light` | #F2F6F2 | Seções alternadas |

### 6.2 Tipografia

| Token | Valor |
|---|---|
| `font-heading` | Montserrat Black (700–900) |
| `font-body` | Montserrat Regular/Light (300–400) |
| `font-source` | Google Fonts via next/font |
| `size-display` | 48–64px · `size-h1` 36–40px · `size-h2` 28–32px · `size-body` 16–18px |

### 6.3 Showcase autoral do design system

**Storybook está fora do escopo** (ADR-008). Em seu lugar, uma página autoral, bonita e simplificada:

- Rota interna `/design` (noindex, fora do sitemap), construída com os **componentes reais do repo** — nunca cópias
- Seções: cores (paleta clicável com hex), tipografia (escala real), componentes (botões, cards, badges, formulários em todos os estados), espaçamento e grid
- Vira vitrine da Oceon na apresentação ao cliente e referência viva para o time — sem custo de manter uma ferramenta paralela

### 6.4 Arquivos Figma

| Arquivo | Conteúdo |
|---|---|
| 🎨 Juma — Tokens & Foundations | Variables de cor, tipo, espaçamento, sombras |
| 🧩 Juma — Component Library | Componentes com variantes |
| 📱 Juma — Site Layouts | Layouts desktop + mobile |
| 📖 Juma — Design Guide | Guia de uso, do & don't |

---

## 7. Sitemap

```
/                           → Homepage
/produtos                   → Listagem (14 páginas: 13 produtos do briefing, sendo linhas agrupadas)
  acorda-cana · acorda-ultra · aduban · aminosan · fitofert · kmep-ultra
  linha-redutan · linha-revigo · revigophos-amino · revigo-milho
  revigo-pasto · supermix · revigo-cobre-ultra
/culturas                   → Listagem (10)
  soja · milho · cafe · cana-de-acucar · algodao · feijao · citros · batata · tomate · pastagem
/calculadora                → Calculadora de Produtividade
/juma-experience            → Programa de Imersão
/sobre                      → História e Valores
/materias                   → Blog · /materias/[slug]
/contato                    → Informações + WhatsApp
/design                     → Showcase do design system (interno, noindex)
↗ Vagas                     → Link externo: https://juma-agro.vagas.solides.com.br/ (editável no CMS)
```

> Redirects 301 das URLs antigas: mapa completo em [../00-contexto/04-inventario-e-redirects.md](../00-contexto/04-inventario-e-redirects.md) — inclui de/para de slugs enganosos (`/produto/kmep` → `/produtos/revigophos-amino`, `/produto/acorda` → `/produtos/acorda-ultra`) e a árvore `/en/` antiga.

---

## 8. Especificação de Páginas

### 8.1 Homepage

| Seção | Conteúdo | Componentes |
|---|---|---|
| Hero | Narrativa visual animada — ver 8.6 | HeroSection, VideoLoop, VideoTransition |
| Linhas de Produto | Cards das linhas com ícone e link | Grid, ProductLineCard |
| Culturas | Grid visual com foto e link | CultureGrid, CultureCard |
| Números | Dados de campo — incrementos por cultura | StatCard, ResultBadge |
| Produtos Destaque | Aminosan® (40+ anos) + 2 destaques | ProductCard (featured) |
| Juma Experience | Teaser com CTA | SectionBanner |
| Vídeo | Embed YouTube com facade | VideoEmbed |
| Depoimentos | Cards com texto e foto | TestimonialCard |
| CTA Final | Faixa verde + botão WhatsApp | CTABanner |
| Footer | Links, contato, horários, redes | Footer |

### 8.2 Produto individual

Header (nome, linha, embalagem, badges de cultura) → Descrição rich text → Posicionamento (problemas + culturas) → Benefícios → Modo de uso por estágio → **Resultados com dados de campo** (ex.: +5,8 sc/ha em soja) → Galeria → CTA WhatsApp → Relacionados.

### 8.3 Cultura individual

Hero com foto → Como a Juma atua → Desafios (cards por fase) → **Manejo por fase** (tabela fase → produtos) → Grid de produtos recomendados → CTA WhatsApp + Calculadora pré-filtrada para a cultura.

### 8.4 Calculadora

**Inputs:** cultura (select) → produto (filtrado pela cultura) → área (ha) → preço da saca (R$) → produtividade atual (sc/ha)
**Outputs:** `sacas_extras = ganho_medio × area_ha` · `receita_extra = sacas_extras × preco_saca`
Dados de ganho gerenciados no CMS. **Dependência: tabela do briefing ainda vazia (pendência crítica).**

### 8.5 Contato

Página informativa — sem formulário próprio. Captura de lead acontece exclusivamente via pop-up do botão WhatsApp (ver 10.2). Exibe: WhatsApp (19) 99964-8186, marketing@juma-agro.com.br, (19) 3891-6415, horários.

### 8.6 Animação Hero — Homepage

Narrativa visual contínua que acompanha uma planta de milho do campo aberto até a raiz, em 4 seções com texto HTML sobreposto:

| Seção | Visual | Movimento ambiente |
|---|---|---|
| 1 — Campo | Trator pulverizando ao entardecer | Loop do mato ao vento |
| 2 — Folha | Macro da folha com gota | Loop sutil da ponta tremendo |
| 3 — Solo | Raiz emergindo com splash | Loop da gota e respingo |
| 4 — Água | Transição com ondulação interativa | Ondulação WebGL + reação ao mouse |

**Mecânica:** trigger-based via Intersection Observer — quando a seção entra na viewport, a transição roda em duração fixa (2–4s). Scroll sempre livre, página nunca trava.

**Técnicas:** transições = clipes Kling (WebM/VP9 + fallback MP4) rodando uma vez · loops ambiente = vídeos 3–6s · micro-interações = CSS transform/opacity · texto = HTML via next-intl (nunca queimado no vídeo).

**⚠️ Risco técnico — seção 4 (água):** a abordagem original (captura da seção via `html2canvas` → textura → fragment shader) é frágil: html2canvas não reproduz fielmente fontes/CSS moderno e exigiria recaptura por idioma.
**Gate de validação:** prototipar isoladamente na Fase 0, antes do design prometer o efeito.
**Plano B definido:** ondulação aplicada apenas a uma camada de fundo (imagem/vídeo) via shader, com texto HTML real intacto por cima — mais simples, mais robusto, mesmo impacto visual percebido.

**Performance:** lazy-load por proximidade de viewport · poster estático protege o LCP · só `transform`/`opacity` · dimensões fixas em CSS (zero CLS) · Three.js carregado só quando a seção 4 se aproxima · mobile com bitrate menor e shader avaliado por device · `prefers-reduced-motion` remove loops e shader.

**Pipeline de assets:** frames-chave aprovados → transições no Kling → loops ambiente → export WebM+MP4 com poster → Cloudinary → integração.

---

## 9. Painel Administrativo (CMS)

### 9.1 Estrutura

Payload CMS 3.x integrado. Sidebar por projetos: **Website (ativo)** + 3 slots "Em breve" (bloqueados) + **Usuários** (global, fixo, role admin).

### 9.2 Abas do Website

| Aba | Conteúdo |
|---|---|
| Visão geral | Totais: produtos, culturas, leads do mês, matérias, mídia, usuários |
| Analytics | Dados do Umami via API: visitantes, páginas, origens, países, dispositivos, eventos |
| Saúde do site | Status, último deploy, erros 24h/7d (Sentry API, sem stack trace), última edição de conteúdo |
| Produtos / Culturas | CRUD completo |
| Calculadora | Tabela produto × cultura × ganho médio |
| Matérias | Blog com rich text |
| Leads | Visualização dos leads |
| Mídia | Biblioteca (Cloudinary) |
| Vagas | Campo de URL do redirect externo (sem deploy) |

### 9.3 Collections

| Collection | Campos principais |
|---|---|
| `products` | nome, slug, linha, culturas[], descricao_curta, descricao_completa, beneficios[], modo_uso, resultados[], midia[] — **localizados (pt-BR/en/es)** |
| `cultures` | nome, slug, descricao, desafios[], manejo_por_fase[], produtos_relacionados[], foto — localizados |
| `calculator_data` | produto_id, cultura_id, dosagem, ganho_medio, unidade, fonte_dado |
| `articles` | titulo, slug, conteudo, autor, data, tags[], capa, seo_meta — localizados |
| `leads` | nome, email, telefone, data, origem (página), contexto (produto/cultura) |
| `pages` | slug, titulo, conteudo, seo_meta — localizados |
| `settings` | vagas_url e demais configurações globais |
| `media` | arquivo, alt, dimensoes, cloudinary_id |
| `users` | nome, email, senha, role |

### 9.4 Autenticação

Email + senha nativos do Payload. Fases 1–3: todos os usuários com acesso completo (admin). Perfis granulares ficam para quando o painel crescer.

---

## 10. Funcionalidades Específicas

### 10.1 SEO

Metadata API por rota · `sitemap.xml` automático (3 idiomas) · `robots.ts` · OG Images via `next/og` com template Juma · JSON-LD (Organization, Product, Article) · canônicas · `hreflang` automático.

### 10.2 WhatsApp CTA — único ponto de captura de lead

**Fluxo:** clique em qualquer botão WhatsApp → pop-up com **Nome, Email e Telefone** → salva em `leads` (visível na aba Leads do painel) → redireciona ao WhatsApp com mensagem contextual. Aviso por e-mail à Debora fica para atualização futura (ADR-017); por ora a conversa segue pelo WhatsApp e o registro fica no painel.

> **Decisão (ADR-007):** o pop-up mantém apenas 3 campos para não criar barreira de conversão — cultura/produto de interesse são capturados **automaticamente pelo contexto da página** (campo `contexto` do lead). O briefing pedia mais campos; a Oceon explicará ao cliente o racional (fricção × volume de leads) na apresentação.

**Mensagens contextuais:**
```
Padrão:   "Olá! Vim pelo site e quero saber mais sobre os produtos Juma."
Produto:  "Olá! Vim pelo site e quero saber mais sobre o ${produto.nome}."
Cultura:  "Olá! Vim pelo site e quero saber mais sobre soluções para ${cultura.nome}."
```

**Número:** +55 19 99964-8186 · **Cookie:** já preencheu → vai direto; parcial → retoma; nunca → pop-up abre.
**Dedup:** lead com mesmo email/telefone é atualizado, nunca duplicado.
Botão flutuante persistente + botões inline em produto, cultura e home.

### 10.3 Performance

`next/image` + WebP/AVIF via Cloudinary · SSG/ISR · `next/font` (Montserrat) · bundle splitting do App Router.

### 10.4 Observabilidade

Sentry (frontend + backend, alertas) · Pino (JSON em operações críticas) · Umami (sem cookies).

### 10.5 Internacionalização

Três idiomas: **pt-BR** (padrão, sem prefixo), **en**, **es** — via `next-intl`, `localePrefix: 'as-needed'`.

**Detecção por país:** middleware lê o país via headers de geolocalização da Vercel (`x-vercel-ip-country` / `geolocation()` de `@vercel/functions` — `request.geo` não existe mais no Next 15+). PT → países lusófonos · ES → hispanófonos · EN → demais (fallback).

**Seletor manual:** **"PT | EN | ES" em texto** na navbar (bandeiras descartadas — anti-pattern de UX para idiomas; ADR-009). Preferência salva em cookie, sobrescreve a detecção.

**CMS:** collections com campos por locale; editor preenche pt-BR, traduções progressivas (IA ou manual). Banners com texto no design = 3 uploads (um por idioma).
**SEO:** hreflang + sitemap nas 3 versões + OG Images por locale.

### 10.6 Vídeos

Embeds do YouTube com **facade** (thumbnail primeiro, player só no clique). Canal: `https://www.youtube.com/@Juma-Agro30/videos`.

### 10.7 Depoimentos

Cards com texto e foto. Oceon cadastra fictícios para layout; Juma substitui pelos reais via painel.

### 10.8 Redes sociais

Instagram, TikTok, YouTube, LinkedIn, Facebook — no footer e Open Graph (URLs em [01-cliente-e-stakeholders.md](../00-contexto/01-cliente-e-stakeholders.md)).

### 10.9 LGPD

Banner informativo minimalista, não bloqueante, sem aceite obrigatório. Umami não usa cookies de rastreamento; cookies de idioma e do pop-up são funcionais.

### 10.10 Domínio e redirects

`.com.br` principal (a confirmar) · `.com` → 301 · mapa completo de redirects da migração em [04-inventario-e-redirects.md](../00-contexto/04-inventario-e-redirects.md) — **obrigatório antes do go-live** para preservar o ranqueamento.

### 10.11 Tradução automática

UI/SEO traduzidos por IA a partir do pt-BR; conteúdo do CMS por locale (IA ou manual).

### 10.12 Background jobs

Payload Tasks nativos (emails, processamento de leads). Ferramentas externas só se o volume justificar.

---

## 11. Documentação Técnica (no repo do site)

```
/
├── CLAUDE.md          → memória do projeto (principal)
├── AGENTS.md          → "Leia o CLAUDE.md" (Codex CLI)
├── GEMINI.md          → "Leia o CLAUDE.md" (Gemini CLI)
├── CHANGELOG.md
└── docs/
    ├── decisions/     → ADRs
    ├── architecture/  → overview.md
    └── guides/        → como-adicionar-produto.md · como-criar-cultura.md ·
                         como-publicar-materia.md · como-atualizar-calculadora.md ·
                         como-alterar-link-vagas.md
```

Documentação vive ao lado do código; cada feature entregue atualiza a doc correspondente e o CHANGELOG.

---

## 12. Fases de Entrega

### Fase 0 — Fundação
- [ ] Repo + Vercel + Neon (via Vercel Marketplace) + Cloudinary + Sentry
- [ ] Design tokens no Figma e código (cor primária validada contra logo vetorial)
- [ ] Payload com todas as collections (localizadas)
- [ ] Pino + next-intl (3 locales) + middleware de geolocalização
- [ ] **Protótipo do efeito de água (gate da seção 4 do hero — decide plano A ou B)**

**Dependências:** logo vetorial, paleta confirmada, domínio definido

### Fase 1 — Site Público (MVP)
- [ ] Homepage (hero completo) · 13 produtos · 10 culturas · Juma Experience · Sobre · Contato
- [ ] Pop-up de lead WhatsApp (fluxo completo com dedup e contexto)
- [ ] SEO base (sitemap, robots, metadados, OG, hreflang, JSON-LD)
- [ ] Seletor de idioma (PT | EN | ES) · Link Vagas externo
- [ ] **Redirects 301 do mapa de migração**
- [ ] Showcase `/design`

**Dependências:** fotos de produto, textos revisados, dados de resultado

### Fase 2 — Funcionalidades Avançadas
- [ ] Calculadora de produtividade · Blog/Matérias · Umami integrado

**Dependências:** ⛔ tabela da calculadora preenchida pelo cliente

### Fase 3 — Painel Admin + Documentação
- [ ] Painel completo (sidebar multi-projeto, abas, saúde do site, analytics)
- [ ] Guias de uso + ADRs + treinamento do time Juma

---

## 13. Premissas e Pendências

### 13.1 Pendências do cliente

Checklist vivo em [../03-pendencias/pendencias.md](../03-pendencias/pendencias.md).

### 13.2 Premissas técnicas

- Idiomas: pt-BR (padrão), en, es — detecção por país + seletor manual
- Browsers: Chrome, Safari, Firefox, Edge (2 últimas versões) · IE não suportado
- Responsividade mobile-first (< 768 · 768–1024 · > 1024)
- Acessibilidade WCAG 2.1 AA
- Integrações futuras (CRM etc.): fora do escopo
- Auth gerenciada por terceiros (BaaS): fora do escopo, a autenticação é do Payload

---

*Documento confidencial — Oceon × Juma Agro — v3.0 — Junho 2026*
