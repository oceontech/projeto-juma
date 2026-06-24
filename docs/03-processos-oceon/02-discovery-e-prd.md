# Processo 02 — Discovery & PRD

**Objetivo:** entender profundamente o que existe (legado) e especificar o que será construído, em um PRD versionado e aprovado.

## Gatilho
Briefing auditado (Processo 01 concluído).

## Passos

1. **Raspar o site/sistema legado integralmente** (Firecrawl: `firecrawl x download <url> --format "markdown,links" --full-page-screenshot -y`)
   - Auditar a integridade do download (buscar páginas corrompidas/erros de conexão e re-raspar com retry)
   - Guardar em `.firecrawl/` no repositório de docs do projeto
2. **Analisar o legado**: estrutura, conteúdo, problemas, pontos fortes, números reais (contar páginas pelo acervo, não por impressão)
3. **Cruzar legado × briefing** — montar inventário de/para (conteúdo que permanece, muda de nome, sai, entra)
   - ⚠️ Slugs antigos mentem: confirmar pelo **conteúdo** da página, não pela URL (caso Juma: `/produto/kmep` era RevigoPHOS amino)
4. **Montar o mapa de redirects 301** a partir do inventário — antes do design, não na véspera do go-live
5. **Escrever o PRD**: visão geral, stakeholders, stack, arquitetura, design system, sitemap, especificação de páginas, CMS, funcionalidades, fases com dependências, premissas e pendências
6. **Revisão técnica do PRD** — checar versões de framework/APIs contra o estado atual (não memória), métricas vigentes (ex.: INP, não FID), riscos técnicos com gate de protótipo e plano B
7. **Registrar decisões como ADRs** — contexto → decisão → consequência
8. **Aprovar o PRD com o cliente** e congelar a versão

## Entregáveis
- Acervo do legado íntegro e auditado
- Análise do site antigo + inventário de/para + mapa de redirects
- PRD versionado (vX.Y) + registro de ADRs

## Gate de saída
- [ ] PRD aprovado pelo aprovador único
- [ ] Riscos técnicos identificados têm protótipo-gate agendado na Fase 0
- [ ] Toda divergência briefing × legado resolvida ou registrada como decisão

## Lições do projeto Juma
- O servidor legado pode ser instável: validar 100% do acervo raspado (15/98 páginas vieram corrompidas e precisaram de retry)
- Conferir números reais nos dados, não de cabeça — contagens erradas contaminam toda a documentação seguinte
- PRDs herdados de versões anteriores carregam APIs mortas (`request.geo`) e métricas obsoletas (FID) — revisão técnica é etapa obrigatória, não cortesia
