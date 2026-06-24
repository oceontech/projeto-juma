# Direção de Design — Painel Administrativo

> Referência: **Media Hub by Ocean** (produto da própria Oceon). O painel da Juma adota essa linguagem visual como base. Não precisa ser idêntico, pode evoluir. O painel é o **Payload CMS**, então isto é um tema/customização sobre o Payload, não uma UI do zero (ver "Aplicação no Payload" no fim).

## Pilares visuais

- **Dualidade claro/escuro:** workspace principal claro e arejado; navegação (sidebar) escura e profunda. O contraste joga o foco no conteúdo.
- **Glassmorphism:** translucidez + `backdrop-filter: blur()` em barras e overlays (vidro fosco).
- **Floating UI:** cards, sidebar e painéis não encostam nas bordas; margens generosas, cantos arredondados, sensação de flutuar.
- **Soft shadows:** sombras difusas e discretas (`rgba(0,0,0,0.08)` a `0.15`), sem contornos pesados.

## Tokens de cor

**Workspace claro**
- `--bg` #FBFBFD (fundo de tela, cinza ultra-claro fosco)
- `--bg-pure` #FFFFFF (cards e modais destacados)
- `--surface` #F5F5F7 (painéis internos, controles)
- `--border` #E5E5EA (divisores)
- `--border-strong` #D2D2D7 (inputs, botões secundários)

**Sidebar escura (Midnight)**
- `--sidebar-bg` #0F0F0F (fundo da sidebar)
- `--sidebar-card` #1A1A1A (blocos na lateral)
- `--sidebar-active` #262626 (item ativo)
- texto ativo #F5F5F7, texto inativo #A1A1AA

**Status (acentos)**
- Âmbar (atenção): fundo #FEF3C7, texto #92400E
- Verde (sucesso/aprovado): fundo #DCFCE7, texto #166534
- Vermelho (alerta/erro): fundo #FEE2E2, texto #991B1B
- Azul (agendado/neutro): fundo #DBEAFE, texto #1E40AF

## Tipografia

- **Geist** (sans) para a interface; **Geist Mono** para datas, métricas e códigos. Ambas gratuitas (Vercel), fáceis de carregar via next/font.
- Display 30px / 600 / -0.03em · H1 23px / 600 / -0.025em · H2 17px / 600 / -0.02em · Corpo 14px / 400 / -0.01em · Legenda 12px / 500.

## Sidebar desktop

- Bloco flutuante: `border-radius: 20px`, 12px de margem em relação às bordas (topo, esquerda, base).
- Fundo #0F0F0F; logo com contorno horizontal limpo no topo; itens com hover sutil e transição suave.
- **Estrutura (do PRD, seção 9):** projetos com "Website" ativo + slots "Em breve" bloqueados, e "Usuários" fixo fora da área de projetos. É aqui que a estética escura flutuante se aplica.

## Navegação mobile

- **Top bar translúcida:** `rgba(251,251,253,0.85)` + `blur(12px)`, borda inferior 1px.
- **Bottom tab dock:** menu horizontal escuro #0F0F0F, 64px de altura, ícones finos + rótulos 10px, badges com anel escuro de separação.

## Aplicação no Payload (o que dá e o que não dá)

O painel é o Payload CMS. A linguagem se aplica assim:

**Dá pra fazer (alta fidelidade):**
- **Tema global** via variáveis CSS no `src/app/(payload)/custom.scss`: mapear `--bg`, superfícies, bordas, e as variáveis de tema do Payload para esta paleta; aplicar Geist em `--font-body` e Geist Mono em `--font-mono`.
- **Sidebar custom** (`admin.components.Nav`): substituir a nav padrão pelo bloco escuro flutuante com a estrutura multi-projeto.
- **Logo/ícone custom** (`admin.components.graphics.Logo` e `Icon`).
- **Dashboard custom** (`admin.components.views.Dashboard`): a "Visão geral" com cards no estilo Media Hub (totais, leads do mês, etc.).
- **Login** restilizado; **status colors** mapeados para estados do Payload.

**Não vira 1:1 (fica restilizado, não recriado):**
- As telas de lista e de edição das coleções mantêm a estrutura de tabela/formulário do Payload. Ganham a paleta, a fonte, o espaçamento, os cantos e as sombras, mas não viram os cards bespoke (tipo "workspaces") do Media Hub.
- Estimativa realista: ~85% da linguagem, com sidebar, dashboard, login e branding com cara claramente custom.

## Fase

É trabalho da **Fase 3** (painel administrativo). A fundação do tema (variáveis + Geist + Nav escura) pode ser montada antes, como base, sem atrapalhar a Fase 1 do front.
