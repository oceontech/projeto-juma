# Pendências — Projeto Juma Agro

> Checklist vivo. Atualizar a cada checkpoint com o cliente. Última revisão: 11/06/2026.

## ⛔ Bloqueiam fase

| # | Item | Bloqueia | Responsável | Status |
|---|---|---|---|---|
| 1 | **Logo em vetor (.ai/.svg)** | Fase 0 — design system | Rodrigo (Juma) | ⛔ Pendente |
| 2 | **Tabela da calculadora** (produto × cultura × dosagem × ganho médio × fonte) | Fase 2 — calculadora | Rodrigo (Juma) | ⛔ Vazia no briefing — calculadora retirada da home e da página de culturas em 03/08/2026 até os dados chegarem (ver nota abaixo) |
| 3 | **Domínio definitivo** (.com.br como principal?) | Fase 0 — DNS/infra | Rodrigo (Juma) | ⚠️ A confirmar |
| 4 | **Acessos Registro.br + Hostgator** (canal seguro) | Go-live — migração DNS | Rodrigo (Juma) | ⚠️ Aguardando |

## ⚠️ Importantes (não bloqueiam início)

| # | Item | Impacta | Responsável | Status |
|---|---|---|---|---|
| 5 | Manual de marca / brandbook | Design system | Juma | Pendente (não informado se existe) |
| 6 | Fotos de produto (embalagens, fundo limpo) | Páginas de produto | Juma | Marcadas como anexadas — conferir recebimento |
| 7 | Fotos de campo e resultados | Culturas, seções de resultado | Juma | Marcadas como anexadas — conferir recebimento |
| 8 | Depoimentos reais (texto/vídeo) | Seção de depoimentos | Juma | "A inserir comercialmente" — fictícios no layout até lá |
| 9 | Fontes oficiais do site (briefing 1.3 vazio) | Tipografia | Oceon propôs Montserrat (validar c/ cliente) | Proposta feita |
| 10 | Confirmar de/para de produtos com o cliente (KMEP→RevigoPHOS, Acorda→Acorda Ultra, destino dos PDFs antigos) | Redirects 301 | Oceon → Rodrigo | Mapeado, falta validar |

> **Nota — calculadora fora do ar (03/08/2026):** componentes preservados, não deletados. `HomeCalculator` (home) continua em `src/features/home/components/HomeCalculator.tsx`, só sem import/render em `src/app/(frontend)/[locale]/page.tsx` (procurar comentário "HomeCalculator removida temporariamente"). Da página de culturas, a calculadora foi extraída de `CulturePage.tsx` para `src/features/cultures/components/CultureCalculator.tsx` (não importada em nenhum lugar hoje). O item de nav "calculadora" também foi removido de `SectionNav.tsx`. Para religar quando a tabela de dados (item #2) chegar: reimportar os dois componentes nos lugares indicados — cabe num único prompt.

## ✅ Resolvidas

| Item | Resolução | Data |
|---|---|---|
| Inventário do site antigo | Raspagem completa e íntegra (98 páginas) em `.firecrawl/` | 11/06/2026 |
| Divergência cor primária (#004B26 × #004C26) | #004C26 confirmado pelo RGB do briefing — validar contra logo quando chegar | 11/06/2026 |
| Catálogo antigo × novo | Mesmos 13 produtos e 10 culturas; só Revigo Cobre Ultra é novo | 11/06/2026 |
| Campos do formulário de lead | Mantido enxuto (3 campos + contexto automático) — ADR-007; explicar ao cliente | 11/06/2026 |
| Storybook | Fora do escopo — showcase autoral `/design` no lugar — ADR-008 | 11/06/2026 |
