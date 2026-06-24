# Brief de Construção — Restante da Home + Fundação de Animação

> Prompt de execução para uma IA (Claude Code) construir o que falta da home da Juma Agro
> com qualidade de site premiado (referência Dribbble/Awwwards): fluido, dinâmico, moderno.
> Hoje só existem as 3 primeiras "cenas" (hero, folha, solo, gota) em `HeroJornada.tsx`.
> Este documento é autossuficiente, mas aponta para as fontes de verdade do projeto.

---

## 0. Como usar este documento

**Você é um engenheiro de front-end sênior especializado em interfaces animadas premium.**
Sua meta não é "colocar conteúdo na tela": é entregar uma home que pareça ter saído de um estúdio
premiado — ritmo, respiro, micro-interações, reveals fluidos, transição de cor entre seções.

Método obrigatório:
1. **Leia a seção 2 (leitura obrigatória) antes de escrever qualquer linha.**
2. **Construa a fundação de animação (seção 3) primeiro.** Nada de seção nova antes disso.
3. **Depois, uma seção por vez**, na ordem da seção 5. Ao terminar cada uma: `npx tsc --noEmit`,
   subir `npm run dev`, conferir no navegador (inclusive mobile e `prefers-reduced-motion`), e
   só então seguir. Não despeje 8 seções de uma vez.
4. **Nunca invente copy nem número.** Texto vem de `docs/04-copy/`. Número vem do briefing, colado à fonte.

---

## 1. Contexto (resumo)

- **Cliente:** Juma Agro (fertilizantes especiais e aminoácidos). Agência: Oceon.
- **Stack:** Next.js 16 (App Router) + React 19 + TS, Payload CMS 3 (Postgres/Neon), Tailwind v4
  (config CSS-first em `src/app/(frontend)/globals.css`), next-intl (pt-BR sem prefixo, en, es).
- **Fonte:** Montserrat — Black (900) em títulos, Light (300) em texto. Cor primária `#004C26`.
- **Estrutura por features:** `src/features/<feature>/components|actions|queries|types`.
- **A home é um filme contínuo**, não blocos soltos. Ordem canônica em
  `docs/01-prd/PRD.md` (seção 7).

### O que já existe
- `src/features/home/components/HeroJornada.tsx` — hero + jornada (campo→folha→solo→gota) com
  vídeo scrubado na mão e reveals GSAP `fromTo` soltos. **Funciona, mas a mecânica é frágil e as
  animações de texto não estão fluidas. Parte do trabalho é corrigir isso (seção 4).**
- `src/components/layout/` — `Navbar`, `Footer`, `Container`, `LanguageSwitcher`.
- `src/config/site.ts` — contato, redes, navegação, endereços.
- Tokens de cor por produto já no `globals.css`: `--color-product-aminosan`, `--color-product-revigo` etc.
- `messages/{pt-BR,en,es}.json` — namespaces `nav`, `hero`, `journey`, `common`, `footer`.

### O que falta (escopo deste brief)
Da gota em diante: **Herança** (família + morph do frasco) → **faixa de prova** → **problema** →
**solução/3 passos** → **linhas de produto (scroll horizontal com cor por produto)** → **culturas** →
**números** → **Juma Experience** → **vídeo institucional** → **depoimentos (placeholder)** →
**CTA final**. Páginas internas (`/produtos`, `/culturas`, `/sobre`, `/juma-experience`) ficam para depois.

---

## 2. Leitura obrigatória (antes de codar)

| Arquivo | Por quê |
|---|---|
| `CLAUDE.md` | Regras inegociáveis (copy sem vícios de IA, performance, cor, fontes). |
| `docs/01-prd/PRD.md` (seção 7) | Ordem das seções, alocação de esforço de animação, regras do scroll horizontal. |
| `docs/01-prd/cores-por-produto.md` | Tokens de cor, ordem do catálogo, regra de famílias vizinhas. |
| `docs/04-copy/01-home.md` | **Toda a copy da home.** É a fonte. Não reescrever. |
| `docs/04-copy/04-produtos.md` e `05-culturas.md` | Nomes de linhas, produtos, culturas e números com fonte. |
| `src/features/home/components/HeroJornada.tsx` | Convenções já em uso (Container, i18n, GSAP). |
| `src/app/(frontend)/globals.css` | Tokens (cor, espaçamento, utilitários `text-heading`/`text-body`). |

⚠️ **Atenção ao espaçamento do Tailwind v4 deste projeto:** os nomes `xs..5xl` foram redefinidos como
*spacing* (4px..128px). Por isso `max-w-xl` NÃO é largura de container — para largura use valor
explícito (`max-w-[42rem]`). Está documentado no topo do `globals.css`.

---

## 3. FUNDAÇÃO DE ANIMAÇÃO (construir primeiro — é o que separa "ok" de "premiado")

> Diagnóstico do estado atual: não há smooth scroll; o hero faz scroll-jacking manual com `wheel`+`rAF`
> mexendo em `video.currentTime` (engasga); reveals são `fromTo` por cronômetro, sem SplitText, sem
> ScrollTrigger, com easing genérico (`power2.out`) e delays mágicos. Resultado: travado e sem ritmo.
> A correção começa por uma fundação compartilhada.

### 3.1 Smooth scroll — Lenis (já é padrão do projeto, ver CLAUDE.md)
- Instalar `lenis`. Criar `src/features/animation/SmoothScroll.tsx` (client) que inicializa o Lenis
  uma vez, no layout do site, e **sincroniza com o ScrollTrigger do GSAP**:
  ```ts
  // dentro do componente, após criar `const lenis = new Lenis({ lerp: 0.1, smoothWheel: true })`
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((t) => lenis.raf(t * 1000))
  gsap.ticker.lagSmoothing(0)
  ```
- Respeitar `prefers-reduced-motion`: se reduzido, **não** instanciar Lenis (scroll nativo).
- Montar `<SmoothScroll>` envolvendo o conteúdo em `src/app/(frontend)/[locale]/layout.tsx`.
- Não usar `scroll-behavior: smooth` no CSS junto com Lenis (conflita) — remover do `globals.css`
  quando o Lenis entrar, ou condicionar.

### 3.2 GSAP + ScrollTrigger — registro central
- Criar `src/features/animation/gsap.ts` que registra plugins uma vez:
  `gsap.registerPlugin(ScrollTrigger, useGSAP)` e exporta `gsap`, `ScrollTrigger`.
- GSAP 3.13+ tornou o **SplitText gratuito** (o projeto está na 3.15) — registrar e usar para
  reveal por linha/palavra em vez de quebrar string na mão.

### 3.3 Linguagem de easing e tempo (tokens — usar SEMPRE os mesmos)
Padronizar para dar coesão. Definir constantes em `src/features/animation/motion.ts`:
- **Ease principal (reveals):** `expo.out` ou custom `cubic-bezier(0.16, 1, 0.3, 1)` ("easeOutExpo").
- **Ease de saída/loop suave:** `power3.inOut`.
- **Durações:** entrada de título 0.9–1.2s; subtítulo/линha 0.5–0.7s; micro (hover/chip) 0.2–0.35s.
- **Stagger:** por linha de título 0.08s; por palavra 0.03–0.05s; por card de grid 0.06–0.1s.
- Nunca misturar 4 easings diferentes na mesma seção. Uma seção = uma "voz" de movimento.

### 3.4 Primitivas de reveal reutilizáveis (a base de tudo)
Criar componentes/hooks em `src/features/animation/` para não repetir `fromTo` solto:
- **`<RevealText as="h2">`** — usa SplitText (lines, mask) + ScrollTrigger (`start: 'top 80%'`,
  `once: true`); cada linha entra com máscara `overflow-hidden` subindo de `yPercent: 110 → 0`.
- **`<FadeUp>`** — wrapper genérico: `y: 24, opacity: 0 → 0, 1`, disparado por ScrollTrigger.
- **`<StaggerGroup>`** — anima `children` em sequência ao entrar no viewport.
- **`useColorShift(color)`** — tween de `background-color` da seção via ScrollTrigger (catálogo).
- Todas respeitam `prefers-reduced-motion`: estado final aplicado de imediato, sem tween.

### 3.5 Regras de performance (inegociáveis — ver CLAUDE.md e doc 01)
- Animar **só `transform` e `opacity`** (e `clip-path` para máscaras). Nada de animar `width/top/filter blur` em scrub.
- `will-change: transform` apenas durante a animação; limpar com `clearProps` ao fim.
- Three.js/WebGL **sob demanda** (dynamic import quando a seção se aproxima), nunca no primeiro paint.
- LCP protegido: hero é foto+texto; vídeos com `poster`. Lighthouse ≥ 90, LCP < 2,5s, INP < 200ms, CLS < 0,1.
- `prefers-reduced-motion` = versão estática de tudo.

---

## 4. Refactor do que já existe (antes de seguir adiante)

1. **Animação de texto da gota (cena 4) e das fases 2/3:** trocar os `gsap.fromTo` manuais por
   `<RevealText>` da fundação. Mesma "voz" de movimento das novas seções. Esse é o item que o
   cliente reclamou diretamente ("animações de texto horríveis, nada fluido") — priorizar.
2. **Mecânica do hero:** avaliar substituir o scrub manual (`wheel`/`touch`/`rAF` + `currentTime`)
   por `ScrollTrigger` com `pin` + `scrub` amarrado ao vídeo (padrão "video scrubbing on scroll").
   Se o risco/tempo for alto, manter a mecânica atual mas, no mínimo, **remover o scroll-jacking
   por listeners e deixar o Lenis conduzir**. Não regredir o que já está aprovado visualmente no hero.
3. Limpar chaves i18n órfãs (`q3L1..q3S3`) se a fase 3 não as usa mais.

---

## 5. Seções a construir (uma por vez, nesta ordem)

> Cada seção é um componente em `src/features/home/components/` montado em `page.tsx` (ou num
> `HomeSections.tsx`). Copy sempre via `useTranslations` — adicionar as chaves nos 3 `messages/*.json`.
> Os textos abaixo são os de `docs/04-copy/01-home.md`; **não reescrever**, só portar.

### 5.1 Herança — fecho do filme (esforço: PESADO)
- **Objetivo:** maior ativo de confiança da marca. Família do fundador + frasco antigo → morph → frasco novo.
- **Copy (doc 01-home, quadros 5–8):** "A família que começou a Juma e ainda conduz a empresa." /
  "O primeiro frasco do Aminosan." / "Mais de 40 anos depois, o mesmo aminoácido. Hoje, de 10 a 14
  sacas a mais por hectare em soja." / "E hoje, uma linha inteira: treze produtos, do plantio à colheita."
- **Layout:** fundo branco (o filme continua no branco). Foto do fundador full-bleed com reveal;
  frasco antigo enquadrado como relíquia (vitrine, sombra suave, tratamento de "patrimônio 40 anos").
- **Animação:** morph antigo→novo por frames de vídeo (técnica das transições da jornada, baixo risco —
  ver doc 01 §"Riscos e técnica"). Número de prova aparece no reveal do frasco novo, colado à fonte.
- **Hand-off:** o frasco atual (Aminosan) vira o **primeiro card** do scroll horizontal (5.5). CTA `Conhecer o Aminosan`.
- **Mobile/reduced-motion:** sequência de imagens estáticas com fade.
- **Assets:** fotos do cliente (ver pendência no doc 01 — se não digitalizadas, usar placeholder e marcar TODO).

### 5.2 Faixa de prova social (esforço: LEVE)
- **Objetivo:** prova imediata logo após o filme. Números clicáveis → página do produto (onde a fonte aparece por extenso).
- **Copy (doc 01-home):** `+6,87 t/ha` cana (Acorda Cana) · `+13,4 sc/ha` milho (Acorda Ultra) ·
  `+14 sc/ha` soja (Aminosan, ensaio DETEC) · `74%` controle bicho-mineiro café (KMEP Ultra, Rehagro).
- **Regra de ouro:** número em Montserrat Black, **fonte do ensaio em corpo menor logo abaixo — número e fonte nunca se separam.**
- **Animação:** count-up discreto ao entrar no viewport (só se reduced-motion permitir); senão valor final.

### 5.3 Problema (esforço: LEVE)
- **Copy:** os 2 parágrafos de `[PROBLEMA]` em `docs/04-copy/01-home.md` (a "conta que passa despercebida").
- **Layout:** tipografia grande, muito respiro, talvez fundo levemente mais escuro para marcar a tensão narrativa.
- **Animação:** `<RevealText>` por linha.

### 5.4 Solução / Como funciona em 3 passos (esforço: LEVE→MÉDIO)
- **Copy:** `[SOLUÇÃO / MECANISMO]` + os 3 passos (Escolha a cultura → Veja o programa fase a fase →
  Converse com o time técnico). CTA `Quero o programa da minha cultura`.
- **Layout:** 3 passos numerados, com ícone/linha conectora. Stagger reveal dos passos.

### 5.5 Linhas de produto — scroll horizontal com cor por produto (esforço: MÉDIO, alto impacto)
- **Objetivo:** o momento "assinatura" do catálogo. Entra direto do frasco novo (5.1).
- **Organização:** pelas **5 linhas**, não pelos 13 produtos soltos (doc 01 §scroll horizontal). Cards:
  | Título | Apoio |
  |---|---|
  | Para a safra começar na frente | Acorda Ultra, Acorda Cana, Aduban |
  | Para a planta produzir no potencial | Aminosan, FitoFert, Linha Revigo, RevigoPhos Amino, Revigo Cobre Ultra |
  | Para o inseticida render mais | KMEP Ultra |
  | Para a calda chegar no alvo | Linha Redutan e Supermix |
  | Programas prontos de milho e pasto | Revigo + Milho e Revigo + Pasto |
- **Mecânica:** desktop = `ScrollTrigger` com **pin horizontal** (a seção prende, cards deslizam na
  horizontal conforme scroll vertical, `scrub`). Mobile = carrossel de **arrastar** (metade do tráfego
  é mobile — não é detalhe). Não sequestrar o scroll de verdade.
- **Cor por produto:** o fundo da seção faz **transição suave de cor** (GSAP) a cada card, usando os
  tokens `--color-product-*` do `globals.css`. Texto na cor legível da tabela do doc 04 (branco ou escuro).
  Respeitar a regra: vizinhos nunca da mesma família. Ordem de referência no doc 04 §"Ordem proposta".
- **Dados (decisão tomada):** começar com **array tipado provisório** em `src/features/products/data.ts`
  espelhando o doc 04 (não bloquear o visual na camada de dados). Estruturar o tipo de forma que a
  troca por uma query do Payload depois seja só mudar a fonte, não o componente. Marcar `// TODO: vir do Payload`.
- **Acessibilidade/SEO:** todos os links de produto no DOM independentemente da animação (doc 01 §mobile).

### 5.6 Culturas — grid (esforço: LEVE)
- **Copy:** "Sua cultura tem um programa" + intro. Grid das 10: Soja, Milho, Café, Cana, Algodão,
  Feijão, Citros, Batata, Tomate, Pastagem.
- **Animação:** stagger reveal dos cards ao entrar (clip/scale sutil + fade). Hover com leve zoom na imagem.

### 5.7 Números — prova profunda (esforço: LEVE)
- **Copy:** bloco `[NÚMEROS]` do doc 01 (soja, milho, cana, café, cada um com fonte). Mesma regra de
  número+fonte coladas. Incluir a ressalva "Resultados de ensaio comparados com testemunha...".

### 5.8 Juma Experience — teaser (esforço: LEVE, parallax)
- **Copy:** "Visite a Juma por dentro" + "Quem vive, entende. Quem entende, produz mais." CTA `Conhecer a Juma Experience`.
- **Animação:** parallax discreto na imagem de fundo (só `transform`).

### 5.9 Vídeo institucional (esforço: LEVE)
- "A Juma em 2 minutos" — embed YouTube com **facade** (clique carrega o iframe; protege performance/LCP).

### 5.10 Depoimentos (placeholder)
- "Quem aplica, conta" — 3 cards. **Depoimentos reais aguardando cliente** — montar a estrutura
  (citação curta com resultado, nome, cultura, cidade/UF) com placeholder claramente marcado. Não inventar depoimento.

### 5.11 CTA final (esforço: LEVE)
- **Copy:** "A próxima safra pode ser a que confirma o número." + apoio + CTA `Quero esse resultado na minha lavoura`
  com a linha "Quem responde é o time técnico, em horário comercial. Sem compromisso."
- É a única frase de efeito permitida na página inteira (doc 01). O CTA abre o pop-up de WhatsApp (lead 3 campos) quando ele existir.

---

## 6. Convenções técnicas

- **Componentes de seção:** `src/features/home/components/<Secao>.tsx`. Montar em `page.tsx`.
- **i18n:** toda string em `messages/{pt-BR,en,es}.json`. Criar namespace por seção (ex: `heritage`,
  `proof`, `problem`, `solution`, `lines`, `cultures`, `numbers`, `experience`, `ctaFinal`).
  Traduzir os 3 idiomas com o mesmo cuidado ortográfico (acentuação correta em pt e es).
- **Dados:** SSG + ISR; o visitante quase não toca o banco. **Decisão para esta fase:** catálogo e
  culturas vêm de **arrays tipados provisórios** em `src/features/<f>/data.ts` (espelhando `docs/04-copy/`),
  com o tipo desenhado para a futura troca por query do Payload ser trivial. Marcar cada um com `// TODO: Payload`.
- **Server vs client:** seções animadas são `'use client'`; o resto Server Component sempre que possível.
- **Verificação por seção:** `npx tsc --noEmit -p tsconfig.json` + olhar no navegador (desktop, mobile, reduced-motion).

---

## 7. Definition of Done (global)

- [ ] Lenis + ScrollTrigger integrados; uma única linguagem de easing/tempo em toda a home.
- [ ] Reveals via primitivas compartilhadas (sem `fromTo` solto com delay mágico espalhado).
- [ ] Animação de texto da gota/fases refeita e fluida (reclamação direta do cliente resolvida).
- [ ] Scroll horizontal de produtos com transição de cor por produto, desktop pin + mobile arrasto.
- [ ] `prefers-reduced-motion`: versão estática completa e correta.
- [ ] Mobile com versão leve (menos quadros no filme, arrasto no catálogo).
- [ ] Lighthouse ≥ 90, LCP < 2,5s, INP < 200ms, CLS < 0,1. Só `transform`/`opacity`/`clip-path` animados.
- [ ] Toda copy vinda de `docs/04-copy/`; todo número colado à sua fonte; nenhum dado/depoimento inventado.
- [ ] `npx tsc --noEmit` limpo; i18n completo nos 3 idiomas.

---

## 8. O que NÃO fazer (vícios proibidos — CLAUDE.md / skill copy-mestre)

- **Copy:** sem travessão, sem "não é X, é Y", sem tríades decorativas, sem aforismo por seção, sem
  vocabulário de IA. Uma única frase de efeito na página (no CTA final).
- **Número sem fonte.** Jamais. Todo resultado aparece colado ao ensaio que o gerou.
- **Animação por animação.** Movimento serve à narrativa "fase a fase"; nada de efeito gratuito que
  custe performance ou distraia. Esforço pesado só onde o doc 01 manda (hero, jornada, herança).
- **WebGL no primeiro paint.** Protege o LCP. Three.js só sob demanda, e o efeito de água está num
  gate de protótipo (ADR-011) — não assumir que entra.
