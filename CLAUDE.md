# Juma Agro — Site Institucional

Site da **Juma Agro** (fertilizantes especiais e aminoácidos), feito pela agência **Oceon**. Este arquivo é o mapa do projeto; o detalhe vive em `docs/`.

## Stack (já instalada)

- **Next.js 16** + React 19 + TypeScript (App Router)
- **Payload CMS 3.85** integrado (mesmo app), adapter **Postgres** (`@payloadcms/db-postgres`)
- Banco: **Neon** (lê `process.env.DATABASE_URL`)
- Gerenciador: **npm** (pnpm não foi instalado). Node 24.
- A instalar conforme as fases: Cloudinary (mídia), Sentry (erros), Umami (analytics, Fase 2)
- Animação: **GSAP + ScrollTrigger**, **Three.js/WebGL** (efeito de água), React Three Fiber, Framer Motion, smooth scroll. Skills instaladas (disparam sozinhas): `gsap-scrolltrigger`, `threejs-webgl`, `react-three-fiber`, `motion-framer`, `locomotive-scroll`, `modern-web-design`, `web3d-integration-patterns`. Para smooth scroll, considerar **Lenis** (padrão atual) — a skill locomotive serve de referência, não obriga a usar locomotive.

## Como rodar

1. `.env` precisa de `DATABASE_URL` (string pooler do Neon) e `PAYLOAD_SECRET` (já gerado).
2. `npm run dev` → site em `localhost:3000`, painel em `/admin`.
3. `npm run generate:types` após mudar coleções.

## Estrutura

- `src/app/(frontend)/` → site público · `src/app/(payload)/` → painel (não mexer na fiação do Payload sem necessidade)
- `src/collections/` → Products, Cultures, CalculatorData, Articles, Pages, Leads, Media, Users
- `src/globals/Settings.ts` → vagas, contato, redes
- `src/payload.config.ts` → config + localização (pt-BR padrão, en, es)
- `docs/` → toda a documentação (PRD, decisões, copy, design) · `assets/` → mídia do hero e herança

## Convenções

- Estrutura por **features** em `src/features/` (cada uma com componentes, actions, queries, types).
- **i18n** com next-intl: pt-BR (sem prefixo), en, es. Conteúdo do CMS é localizado.
- Renderização: **SSG + ISR** na maioria; o banco quase não é tocado pelo visitante.
- Captura de lead: **só** via pop-up do botão WhatsApp (nome, email, telefone) → salva em `leads` → redireciona ao WhatsApp. **Sem e-mail** (Resend cortado, ADR-017).

## Regras inegociáveis

- **Copy sem vícios de IA.** Proibido travessão, "não é X, é Y", tríades decorativas, aforismo por seção, vocabulário de IA. A copy oficial está em `docs/04-copy/` — usar ela, não reescrever do zero. Regra completa: skill `copy-mestre` (`references/vicios-de-ia.md`).
- **Números só com fonte.** Todo resultado (ex: +13,4 sc/ha) vem do briefing e aparece colado à fonte do ensaio. Nunca inventar dado nem depoimento.
- **Performance:** Lighthouse ≥ 90, LCP < 2,5s, INP < 200ms, CLS < 0,1. Animar só `transform`/`opacity`; WebGL sob demanda; `prefers-reduced-motion` estático.
- **Cor primária #004C26**; fontes Montserrat (Black títulos, Light texto).

## Direção de design (resumo; detalhe em docs/05)

- **Home = filme contínuo:** hero declaração "Juntos alimentamos o mundo" → jornada fase a fase (campo/folha/solo/gota) → herança (família + morph do frasco antigo→novo) → catálogo de produtos em **scroll horizontal com a cor de fundo mudando por produto** → culturas → números → experience → CTA. Ver `docs/05-design-direction/`.
- **Cor por produto:** cada produto tem cor de fundo do rótulo; vizinhos nunca da mesma família. Tokens em `docs/05-design-direction/04-cores-por-produto.md`.
- **Painel admin:** estética "Media Hub by Ocean" (sidebar escura flutuante, fundo claro, Geist). Fase 3. Ver `docs/05-design-direction/05-painel-admin.md`.

## Onde está a verdade

- PRD técnico: `docs/01-prd-site/prd-v3.0.md` · Decisões (ADRs): `docs/01-prd-site/decisoes.md`
- Briefing/conteúdo: `docs/00-contexto/` · Copy: `docs/04-copy/` · Design/animação: `docs/05-design-direction/`
- Pendências: `docs/03-pendencias/pendencias.md`

## Fase atual

**Fase 1 — front-end.** Ordem: tokens+Tailwind+fontes → i18n → shell (nav/footer) → camada de dados (ler do Payload) → home seção por seção → páginas internas → pop-up de lead → SEO. Trabalhar **uma tarefa por vez** e verificar antes de seguir.
