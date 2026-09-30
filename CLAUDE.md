# Juma Agro — Site Institucional

Site da **Juma Agro** (fertilizantes especiais e aminoácidos), feito pela agência **Oceon**. Este arquivo é o mapa do projeto; o detalhe vive em `docs/`.

## Stack (já instalada)

- **Next.js 16** + React 19 + TypeScript (App Router)
- **Payload CMS 3.85** integrado (mesmo app), adapter **Postgres** (`@payloadcms/db-postgres`)
- Banco: **Neon `juma-painel`** (Marketplace da Vercel, região iad1), lido de `PAYLOAD_DATABASE_URL`. O `DATABASE_URL` antigo é de **outra aplicação** e não é usado.
- Mídia do painel: **Vercel Blob** `juma-painel-midia` (público, `BLOB_READ_WRITE_TOKEN`), via `@payloadcms/storage-vercel-blob`
- Gerenciador: **npm** (há `package-lock.json`; o bloco `pnpm`/`engines` no `package.json` é resíduo do template Payload, ignorar). Node 24 em dev.
- Analytics: **Umami 3 instalado pela Oceon** em `juma-stats.vercel.app` (projeto Vercel `juma-stats`, código em `../umami-juma`, banco Neon `juma-stats-db`). Sem cookies. Script em `src/features/analytics/` (eventos `lead`, `whatsapp` e `tempo`: tempo de permanência, enviado ao sair da página e a cada minuto, a partir de 10 s; o site EUA manda o mesmo); a Visão geral lê os números com o usuário só de leitura `painel` (variáveis `UMAMI_*`). Senhas em `../CREDENCIAIS-UMAMI.txt`, fora do git.
- IA do blog (OpenAI, `OPENAI_API_KEY`): `POST /api/ai/:action` em `src/features/ai/` (sugestões, organizar texto, melhorar, revisão final com tempo de leitura, capa com `gpt-image-1-mini`, tradução EN/ES). Texto com `gpt-5.4-mini`; trocar por `OPENAI_TEXT_MODEL`/`OPENAI_IMAGE_MODEL`. As regras de copy da IA estão em `src/features/ai/rules.ts` (mesmas do projeto). Prévia real da matéria: `/[locale]/materias/previa` (iframe do painel).
- A instalar conforme as fases: Sentry (erros), Resend (só recuperação de senha e aviso de lead)
- **Animação — motor único: GSAP + ScrollTrigger + Lenis** (o que está no `package.json`: `gsap`, `@gsap/react`, `lenis`). **Sem segunda lib de animação de UI** — nada de Framer Motion ou React Three Fiber (ADR-021). **Three.js/WebGL** (efeito de água) entra **só sob demanda** para o pico da jornada, via import dinâmico, **ainda não instalado** e condicionado ao gate de performance (ADR-011). As skills `gsap-scrolltrigger`, `threejs-webgl`, `react-three-fiber`, `motion-framer`, `locomotive-scroll`, `modern-web-design`, `web3d-integration-patterns` são **referência** (disparam sozinhas), não dependências instaladas.
- **Prompts de site "cara de awards":** skill do projeto `motion-site-prompts` (`.claude/skills/motion-site-prompts/`) — método das 5 camadas, tokens de movimento e template pronto para colar. A stack-padrão da Juma é o motor único **GSAP/ScrollTrigger + Lenis** (Three.js só sob demanda). Use sempre que for escrever um prompt de hero/landing/seção animada. Tokens de movimento reais do código vivem em `src/features/animation/motion.ts` (a skill referencia, o código manda).

## Como rodar

1. `vercel env pull .env.local` (projeto ligado a `site-juma`) traz `PAYLOAD_DATABASE_URL`, `BLOB_READ_WRITE_TOKEN` e `LEADS_INTAKE_KEY_US`. `PAYLOAD_SECRET` fica no `.env`. Modelo em `.env.example`.
   **Atenção:** o `.env.local` aponta para o banco de produção do painel. Para testar à vontade, use um Postgres local (ver o cabeçalho de `tests/int/leads.int.spec.ts`).
2. `npm run dev` → site em `localhost:3000`, painel em `/admin`.
3. Mudou coleção? `npm run generate:types`, depois `npm run migrate:create -- <nome>` e `npm run migrate`. O schema **só muda por migration** (`push: false`). O deploy de produção roda as migrations no build (`scripts/migrate-on-vercel.mjs`); preview não, porque usa o mesmo banco.
   - Os scripts `migrate*` passam por `scripts/payload-cli.mjs`: o CLI padrão do Payload quebra no Windows com Node 24 ao gerar migration.
   - Na migration gerada, troque o import para `import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'` (sem `type`, o Vitest quebra).

## Estrutura

- `src/app/(frontend)/` → site público · `src/app/(payload)/` → painel (não mexer na fiação do Payload sem necessidade)
- `src/collections/` → Products, Cultures, Articles (blog BR), PostsUs (blog EUA), Leads, Media, Users · `src/globals/` → Settings e SettingsUs (contato/redes de cada site), HomeHighlights (destaques da home; Aminosan fixo em 1º) · `src/access/roles.ts` → papéis (admin, editor, comercial) e escopo por site · `src/migrations/` → migrations do banco
- `src/features/leads/` → pop-up de lead, `WhatsAppLink`, captura de origem e `server/ingest.ts` (entrada única de leads, usada também por `POST /api/leads/intake` do site EUA)
- `src/payload.config.ts` → config + localização (pt-BR padrão, en, es)
- `docs/` → toda a documentação (PRD canônico em `docs/01-prd/`, decisões, copy, processos) · `assets/` → mídia-fonte (hero, herança, produtos) · `public/` → cópia servida pelo build

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

## Direção de design (resumo; detalhe em docs/01-prd)

- **Home = filme contínuo:** hero declaração "Juntos alimentamos o mundo" → jornada fase a fase (campo/folha/solo/gota) → herança (família + morph do frasco antigo→novo) → catálogo de produtos em **scroll horizontal com a cor de fundo mudando por produto** → culturas → números → experience → CTA. Ver `docs/01-prd/PRD.md` (seção 7).
- **Cor por produto:** cada produto tem cor de fundo do rótulo; vizinhos nunca da mesma família. Tokens em `docs/01-prd/cores-por-produto.md`.
- **Painel admin:** estética "Media Hub by Ocean" (sidebar escura flutuante, fundo claro, Geist). Fase 5. Ver `docs/01-prd/painel-admin.md`. Painel BR+EUA em `/admin` (escopo, módulos, modelo de dados, roadmap, varredura de arquivos sem uso): `docs/01-prd/painel-central.md`.

## Onde está a verdade

- **PRD canônico (fonte única):** `docs/01-prd/PRD.md` + apoios na mesma pasta (`briefing.md`, `conteudo-paginas.md`, `fundamentos-narrativos.md`, `cores-por-produto.md`, `tecnicas-de-implementacao.md`, `assets-e-hero.md`, `producao-videos.md`, `painel-admin.md`).
- Decisões (ADRs): `docs/02-decisoes/decisoes.md` · Contexto/briefing: `docs/00-contexto/` · Copy oficial: `docs/04-copy/`
- Processos Oceon: `docs/03-processos-oceon/` · Pendências: `docs/05-pendencias/pendencias.md`

## Fase atual

**Fase 1 — front-end.** Ordem: tokens+Tailwind+fontes → i18n → shell (nav/footer) → camada de dados (ler do Payload) → home seção por seção → páginas internas → pop-up de lead → SEO. Painel e troca dos dados estáticos por queries ao Payload são Fase 5 (ver roadmap do PRD). Trabalhar **uma tarefa por vez** e verificar antes de seguir.
