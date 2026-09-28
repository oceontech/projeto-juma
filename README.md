# Juma Agro — site institucional (Oceon)

Site da **Juma Agro** em Next.js 16 com Payload CMS 3 no mesmo app (painel em `/admin`). O mapa do projeto, as regras e a fase atual estão no [`CLAUDE.md`](CLAUDE.md).

## Rodar

1. Copie `.env.example` para `.env` e preencha `DATABASE_URL` (pooler do Neon) e `PAYLOAD_SECRET`.
2. `npm install`
3. `npm run dev` → site em `localhost:3000`, painel em `localhost:3000/admin`.
4. Depois de mudar coleções: `npm run generate:types`.

Testes: `npm run test:int` (Vitest) e `npm run test:e2e` (Playwright, sobe o `npm run dev`).

Deploy: Vercel (projeto `site-juma`).

## Documentação

| Pasta | Conteúdo |
|---|---|
| [docs/00-contexto/](docs/00-contexto/) | Cliente, briefing consolidado, análise do site antigo, inventário e redirects |
| [docs/01-prd/](docs/01-prd/) | PRD canônico e apoios (copy, cores por produto, técnicas, painel admin, painel central BR+EUA) |
| [docs/02-decisoes/](docs/02-decisoes/) | Registro de decisões (ADRs) |
| [docs/03-processos-oceon/](docs/03-processos-oceon/) | Processos da agência, do onboarding ao pós-lançamento |
| [docs/04-copy/](docs/04-copy/) | Copy oficial de todas as páginas |
| [docs/05-pendencias/](docs/05-pendencias/) | Pendências do cliente e internas |
| [docs/06-materiais/](docs/06-materiais/) | Materiais de referência do cliente |
