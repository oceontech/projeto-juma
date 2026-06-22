# Processos Oceon — Visão Geral

> v1.0 (junho 2026) — primeira formalização, modelada a partir do projeto Juma Agro. Documentos vivos: cada projeto encerrado deve gerar revisão destes processos (retrospectiva).

## Pipeline de projeto

```
01 Onboarding & Briefing  →  02 Discovery & PRD  →  03 Design  →  04 Desenvolvimento  →  05 QA & Lançamento  →  06 Pós-lançamento
```

| # | Processo | Entregável principal | Gate de saída |
|---|---|---|---|
| 01 | [Onboarding & Briefing](01-onboarding-e-briefing.md) | Briefing preenchido e validado | Aprovador único definido + briefing aceito |
| 02 | [Discovery & PRD](02-discovery-e-prd.md) | PRD versionado + inventário do legado | PRD aprovado pelo cliente |
| 03 | [Design](03-design.md) | Figma (tokens, componentes, layouts) | Layouts aprovados pelo aprovador único |
| 04 | [Desenvolvimento](04-desenvolvimento.md) | Software em produção por fases | Critérios de aceite de cada fase |
| 05 | [QA & Lançamento](05-qa-e-lancamento.md) | Go-live com redirects, SEO e monitoramento | Checklist de lançamento 100% |
| 06 | [Pós-lançamento](06-pos-lancamento.md) | Treinamento, suporte, métricas | Cliente autônomo + retrospectiva feita |

## Princípios da agência

1. **Um aprovador único por cliente** — decisões não viram comitê
2. **Documentação antes de código** — briefing → PRD → ADRs; tudo versionado em markdown
3. **Fonte de verdade explícita** — quando briefing e material antigo divergem, o briefing vence; divergências são registradas, não ignoradas
4. **Evidência antes de promessa** — features de risco (ex.: WebGL) têm protótipo-gate antes de entrar no design aprovado
5. **Pendências visíveis** — checklist vivo por projeto, cobrado em todo checkpoint com o cliente
6. **IA como ferramenta de produção** — raspagem de legado (Firecrawl), análise de conteúdo, geração de assets (Kling), tradução; sempre com revisão humana
7. **Entrega por fases com dependências explícitas** — nenhuma fase começa com bloqueio conhecido não comunicado
