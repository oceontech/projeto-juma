# Processo 04 — Desenvolvimento

**Objetivo:** implementar o PRD em fases com qualidade, observabilidade e documentação desde o primeiro commit.

## Gatilho
Fase 0 liberada (design tokens aprovados + infra provisionada).

## Stack padrão Oceon (revisar por projeto)

- **Next.js (versão atual no início do projeto)** + TypeScript, App Router
- **Payload CMS 3.x integrado** quando há gestão de conteúdo
- Postgres gerenciado (tier pago em produção — free tiers que pausam são proibidos)
- Cloudinary (mídia) · Umami (analytics) · Sentry (erros) · Pino (logs)
- shadcn/ui + Tailwind + Radix · Vercel (CI/CD com previews)

## Convenções

1. **Repo único, app único** — monorepo só com justificativa em ADR
2. **Estrutura por features** — `src/features/<feature>/` com componentes, actions, queries e types juntos
3. **Documentação no repo**: `CLAUDE.md` (memória principal — stack, convenções, decisões), `AGENTS.md`/`GEMINI.md` apontando para ele, `CHANGELOG.md` por feature, ADRs em `docs/decisions/`
4. **Observabilidade antes do go-live** — Sentry e logs estruturados configurados na Fase 0, não depois
5. **Fases com dependências explícitas** — bloqueio de cliente (assets, dados) é comunicado por escrito no momento em que bloqueia

## Ciclo por fase

```
Planejar (issues da fase) → Implementar → Review (PR + preview Vercel)
→ Atualizar docs/CHANGELOG → Demo ao cliente → Aceite da fase
```

## Gate de saída (por fase)
- [ ] Critérios de aceite da fase cumpridos e demonstrados em preview
- [ ] Lighthouse ≥ 90 nas páginas novas · Web Vitals dentro das metas (LCP < 2.5s, INP < 200ms, CLS < 0.1)
- [ ] Docs e CHANGELOG atualizados
- [ ] Sem erro novo no Sentry após 48h em preview

## Lições do projeto Juma
- Features de risco (WebGL/shaders) entram com **gate de protótipo na Fase 0** e plano B documentado — nunca prometidas direto no design
- Animações: trigger-based com Intersection Observer, scroll sempre livre; só `transform`/`opacity`; `prefers-reduced-motion` obrigatório
- Lead capture com dedup desde o dia 1 (email/telefone) evita lixo no CRM do cliente
