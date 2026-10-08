# Contexto do projeto

Leia o `CLAUDE.md` na raiz antes de começar. Ele tem a stack, as convenções, as regras inegociáveis (copy sem vícios de IA, números só com fonte, performance) e o mapa da pasta `docs/`, que é a fonte de verdade do projeto.

## Contas e CLIs

- Este projeto usa os tokens de `.claude/settings.local.json`, que valem só para esta pasta (GitHub: `oceontech`; Vercel: time `oceon`).
- Nunca rodar `gh auth login`, `supabase login` ou `vercel login`, nem alterar configurações globais (git, gh, supabase, vercel).
- Todo comando da Vercel usa `--token $VERCEL_TOKEN` e o escopo da conta deste projeto: `--scope team_jsF9ervoTl8eJv5RwbwjQAlC` (time `oceon`). No PowerShell, use `$env:VERCEL_TOKEN`.
- Nunca exibir, registrar ou commitar tokens.
