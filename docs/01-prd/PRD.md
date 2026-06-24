# PRD — Site Juma Agro

> **Fonte de verdade única do projeto.** Tudo que é preciso para construir o site — experiência pública, painel e infraestrutura — está nesta pasta. Arquivos:
> - `PRD.md` (este arquivo) — visão geral, pesquisa, stack, sistema de design, estrutura do site, infraestrutura, roadmap.
> - `briefing.md` — fatos da empresa, produtos, culturas, contatos, lacunas conhecidas.
> - `fundamentos-narrativos.md` — voz da marca, arco narrativo, regras de copy (o que nunca escrever).
> - `conteudo-paginas.md` — matéria-prima factual de cada página (o que cada uma precisa dizer).
> - `cores-por-produto.md` — tokens de cor por produto e regra de ordenação do catálogo.
> - `tecnicas-de-implementacao.md` — receitas técnicas concretas de GSAP/ScrollTrigger para os pontos mais difíceis (scroll horizontal com entrada por card, drag com física no mobile), validadas contra um projeto de referência real.
> - `assets-e-hero.md` — assets de mídia e implementação do hero/jornada.
> - `producao-videos.md` — produção dos vídeos da jornada e do morph dos frascos.
> - `painel-admin.md` — direção de design do painel administrativo (tema do Payload).
> - `prompts/` — prompts de execução para gerar/evoluir seções (apoio, não especificação).
>
> **Escopo deste PRD:** site público **trilíngue** (pt-BR padrão, en, es), **painel administrativo** (Payload CMS) e a infraestrutura que os sustenta. Decisões formais (ADRs) ficam em `../02-decisoes/decisoes.md`. Especificação pensada para ser construída por um agente de IA (Claude Code, Gemini ou equivalente) sobre a stack já instalada (Next.js 16 + Payload 3 + GSAP/Lenis — ver seção 3).

---

## 0. Como usar este documento

Você é um engenheiro de front-end sênior especializado em interfaces animadas premium (nível Awwwards/FWA/CSS Design Awards). Regras de uso:

1. **Uma fase por vez** (seção 12). Termine, verifique (type-check, rodar local, navegador desktop + mobile + `prefers-reduced-motion`), só então siga para a próxima.
2. **Não invente dado nem depoimento.** Todo número de ensaio vem colado à fonte. Os fatos (produtos, resultados, contatos, endereços) estão em `briefing.md` e `conteudo-paginas.md` — use-os como matéria-prima, não os reescreva sem necessidade.
3. **Copy final segue `fundamentos-narrativos.md` à risca**, especialmente a lista de proibições de estilo — nenhuma seção pode violar essas regras.
4. **A direção visual do hero, da jornada e da herança (descritos na seção 7) já foi validada com o cliente** — não é um convite a redesenhar a composição, é a especificação a seguir.

---

## 1. Contexto e objetivo

A Juma Agro é uma empresa familiar com mais de 40 anos no mercado de fertilizantes especiais e aminoácidos para o agronegócio brasileiro. O site institucional precisa comunicar dois ativos ao mesmo tempo: **resultado medido em ensaio de campo** (o argumento racional, decisivo para quem compra insumo) e **uma marca de família que constrói confiança pela origem** (o argumento emocional). A categoria de insumos agrícolas no Brasil é visualmente datada — esse é o espaço a ocupar: o primeiro site do setor com qualidade de produção de um site premiado internacional (nível Awwwards/FWA), fluido, dinâmico, com vídeo vinculado ao scroll e animações de entrada e saída que dão vida à página, sem abrir mão de performance.

---

## 2. Pesquisa — o que os sites premiados estão fazendo agora

Síntese de pesquisa (2025–2026) sobre as técnicas usadas em sites recentes premiados com vídeo vinculado ao scroll, animação fluida e tipografia de destaque. As conclusões abaixo orientam as decisões de stack da seção 3.

### 2.1 Vídeo vinculado ao scroll: o que de fato funciona

A tentação óbvia é jogar um `<video>` na tela e mexer em `video.currentTime` conforme o usuário rola a página (scrubbing manual). **Essa técnica está obsoleta para produção.** Um case documentado de um estúdio que abandonou exatamente essa abordagem (projeto Optikka, publicado na Codrops em out/2025) relata engasgo visível, perda de qualidade por compressão e restrição de autoplay no mobile. Um benchmark independente sobre a mesma técnica mediu queda de frames "estupenda" no mobile, e falta de confiabilidade mesmo no desktop em vídeo de alta resolução.

O que os sites premiados fazem em vez disso, em ordem de uso:

1. **Vídeo com autoplay travado por `pin` (sem scrub manual).** A seção prende o scroll, o vídeo toca uma vez no ritmo normal, o scroll solta quando termina. O navegador toca o vídeo nativamente, sem se meter no `currentTime` a cada frame de scroll — evita o problema de engasgo por completo. **É a técnica recomendada para a jornada fase a fase e para o morph dos frascos desta home** (seção 7).
2. **Sequência de frames (imagens) renderizada em `<canvas>`, avançada por uma biblioteca de scroll** — reservada para os poucos momentos que realmente precisam de controle quadro a quadro pelo usuário (ex.: um morph que o visitante "dirige" com o próprio scroll, ou um configurador de produto). Mais trabalho de pipeline (extração de frames, pré-carregamento inteligente), mas é a técnica usada por sites de referência (ex.: páginas de produto da Apple) e replicada por estúdios de ponta, com performance estável em qualquer dispositivo.
3. **Vídeo cru com `currentTime` em scroll:** evitar. Só seria aceitável para um clipe muito curto, em baixa resolução, sem compromisso de qualidade visual.

**Decisão:** usar autoplay travado por `pin` para a jornada e para o morph dos frascos — é uma narrativa linear que o usuário destrava ao rolar, não controla quadro a quadro. Reservar frame-sequence + canvas só se um momento futuro pedir controle fino do usuário sobre o frame.

### 2.2 Animação de scroll: uma biblioteca de orquestração ainda é o padrão

O navegador já suporta animação nativa vinculada ao scroll (CSS puro, sem JavaScript) — leve, roda fora da thread principal, ótima para casos simples (parallax decorativo, fade). Mas essa API nativa ainda cobre só uma fração do que uma biblioteca de orquestração dedicada (como GSAP/ScrollTrigger) faz: falta `pin` robusto, falta `scrub` com easing controlado, e o suporte entre navegadores ainda não é uniforme o bastante para um site comercial que não pode quebrar em nenhum navegador.

**Decisão:** usar uma biblioteca de orquestração de animação completa (GSAP + ScrollTrigger + um motor de smooth scroll como Lenis é a combinação recomendada e mais usada em produção hoje) como motor único de animação. Não somar uma segunda biblioteca de animação de UI (ex.: Framer Motion) ao mesmo projeto — seria redundância: duas bibliotecas fazendo o mesmo trabalho custam manutenção sem ganho. Animação de scroll nativa do navegador pode ser usada pontualmente em microinterações triviais e totalmente decorativas, nunca como motor principal.

Essa decisão foi confirmada ao estudar um projeto open-source real que usa exatamente essa combinação (Next.js + GSAP + ScrollTrigger + Lenis, zero segunda biblioteca de animação) para construir um site no mesmo nível de ambição visual da Juma. As receitas técnicas mais úteis desse estudo — em especial como fazer cada elemento de um carrossel pinado animar sua própria entrada durante o scroll horizontal — estão em `tecnicas-de-implementacao.md`.

### 2.3 Tipografia: o duo "estrutura + emoção"

A tendência de tipografia em sites premiados recentes não é uma fonte só — é **duas fontes com personalidades opostas**: uma grotesca/geométrica pesada para estrutura (títulos, leitura) e uma serifada expressiva (com itálico) para a palavra ou linha de destaque dentro do título. O contraste é o que faz o destaque parecer destaque — quando as duas fontes de um título são da mesma família visual (duas geométricas, por exemplo), o olho não separa bem o que é "estrutura" do que é "ênfase": a cor sozinha não é suficiente. Ver decisão de tipografia completa na seção 4.2.

---

## 3. Stack técnica recomendada

| Camada | Tecnologia recomendada | Por quê |
|---|---|---|
| Framework | Next.js (App Router) + React + TypeScript | SSG/ISR para um site majoritariamente estático, com rotas de produto/cultura geradas em build. |
| Estilo | Tailwind CSS (ou equivalente CSS-first com tokens de design) | Tokens de cor/espaçamento/tipografia centralizados, consistência entre páginas. |
| Idioma | **next-intl** — pt-BR (padrão, sem prefixo), en, es; `localePrefix: 'as-needed'` | Site trilíngue. Conteúdo do CMS é localizado no Payload (mesmos três locales); UI estática vem dos `messages/*.json`. |
| Smooth scroll | Lenis (ou equivalente) | Sincronizado com a biblioteca de orquestração de scroll (próxima linha). |
| Orquestração de animação | GSAP + ScrollTrigger (+ plugin de split de texto para reveals por linha/palavra) | Motor único de animação — ver justificativa na seção 2.2. Não somar uma segunda biblioteca de animação de UI (sem Framer Motion, sem React Three Fiber). |
| Vídeo narrativo | `<video>` com autoplay travado por `pin` (sem scrub manual). Os vídeos da jornada e do morph dos frascos já estão produzidos — entregar com poster (protege LCP) e fallback WebM/MP4. | Ver justificativa na seção 2.1. |
| Efeito 3D/WebGL pontual | Biblioteca WebGL (ex.: Three.js), só sob demanda — **ainda não instalada** | Só para o momento de maior impacto visual da jornada (seção 7) — carregado via import dinâmico quando a seção se aproxima, nunca no primeiro paint. Tratar como protótipo a validar por performance antes de assumir que entra na versão final (gate ADR-011; plano B: a mesma cena sem o efeito interativo, só com vídeo/imagem). |
| CMS / dados de conteúdo | **Payload CMS 3.85** (mesmo app Next), adapter Postgres (Neon) | O time da Juma gerencia produtos, culturas, calculadora, matérias, leads e settings com autonomia. Conteúdo gerado em build (SSG) e revalidado por ISR — o banco quase não é tocado pelo visitante. |
| Banco | Postgres no **Neon** (via Marketplace da Vercel) | `process.env.DATABASE_URL`. Free tier; auto-suspend irrelevante pelo desenho estático. |
| Hospedagem | Vercel (deploy por git, preview por branch) | Padrão de mercado para Next.js; injeta as variáveis do Neon. |

**O que esta stack explicitamente não inclui:** uma segunda biblioteca de animação de UI (Framer Motion, R3F), e-mail transacional (Resend cortado — ADR-017), GraphQL (ADR-003).

---

## 4. Sistema de design

### 4.1 Cor

- **Primária da marca:** `#004C26`.
- **Secundária:** `#302783`.
- **Cor por produto:** cada produto/linha usa a cor do próprio rótulo no scroll horizontal e nas páginas de produto — cheia no momento do produto, diluída a 8–10% nas seções de leitura. Tokens completos e regra de ordenação em `cores-por-produto.md`.

### 4.2 Tipografia — três vozes, não duas

Sistema recomendado:

- **Fonte de estrutura (títulos):** uma sans-serif geométrica bem pesada (ex.: Montserrat Black/900) para todo título, e a mesma família em peso leve (Light/300) para o corpo de texto.
- **Fonte técnica (camada de apoio):** uma segunda sans-serif mais geométrica/técnica (ex.: Space Grotesk), usada **só** em três lugares: o kicker/pré-título (rótulo curto em caixa alta acima de um título, ex. "01 / FOLHA"), o subtítulo de apoio sob um título grande, e — **antes desta revisão** — também na palavra de destaque dentro do título.
- **Fonte de destaque (nova nesta revisão):** uma serifada com itálico (recomendação: **Fraunces**, peso 600–900 itálico; alternativa mais delicada: **Instrument Serif**), usada **só** na palavra ou linha em cor de marca dentro de um título de estrutura. É a mudança desta revisão: a palavra de destaque deixa de usar a mesma fonte técnica do kicker (que cria pouco contraste por serem duas geométricas) e passa a usar essa serifada — o contraste de família tipográfica é o que faz o destaque parecer destaque, não só a cor. A fonte técnica do kicker/subtítulo **não muda**, continua exatamente como descrita acima.

Estrutura de tokens recomendada (CSS, adaptar ao framework de estilo escolhido):

```css
--font-heading: "Montserrat", sans-serif;   /* 900 — estrutura dos títulos */
--font-body: "Montserrat", sans-serif;      /* 300 — corpo de texto */
--font-tech: "Space Grotesk", sans-serif;   /* kicker e subtítulo — só isso */
--font-accent: "Fraunces", serif;           /* só a palavra/linha de destaque no título */

.text-highlight {
  font-family: var(--font-accent);
  font-style: italic;
  font-weight: 600; /* ajustar conforme leitura do peso real escolhido */
}
.text-eyebrow, .text-subtitle {
  font-family: var(--font-tech);
}
```

**Onde aplicar o destaque:** toda palavra/linha em cor de marca dentro de um título — por exemplo "MUNDO" no hero ("Juntos alimentamos o **mundo**"), ou a palavra final de um título de seção em verde/cor de marca. **Não aplicar** em kicker/eyebrow nem em subtítulos — esses continuam na fonte técnica.

### 4.3 Sistema de movimento

Tokens recomendados de easing/duração/stagger — usar sempre os mesmos, para que toda a página tenha uma única "linguagem" de movimento:

```ts
const EASE = {
  reveal: 'expo.out',       // entrada de título/linha/card
  inOut: 'power3.inOut',    // saída e loops suaves (parallax, transição entre fases)
  micro: 'power2.out',      // hover, chip, count-up
}
const DUR = {
  title: 1.1,       // segundos — entrada de título grande
  sub: 0.6,          // subtítulo / linha de apoio
  micro: 0.3,        // micro-interação
  colorShift: 0.6,   // transição de cor de fundo entre produtos
}
const STAGGER = {
  line: 0.08,   // por linha de título
  word: 0.04,    // por palavra
  card: 0.08,    // por card de grid
}
```

**Entrada e saída — só onde há substituição de conteúdo na mesma área da tela.** Para seções normais (cultura, números, depoimentos), animação de entrada única (revela e fica) é suficiente — saída ali não tem função narrativa, só custaria performance e poderia confundir leitores de tela. Mas nas seções **pinadas**, onde um texto literalmente precisa dar lugar a outro no mesmo espaço (a jornada fase a fase, a herança, o scroll horizontal de produtos), a transição de saída precisa ser tão cuidada quanto a de entrada: o texto atual sai (fade + leve deslocamento, easing `inOut`) antes ou durante a entrada do próximo, nunca um corte seco.

Construir primitivas de animação reutilizáveis (não repetir tweens soltos por seção):
- **Reveal de texto** — divide em linhas/palavras, cada uma entra com máscara (`overflow-hidden`, deslocamento vertical que vai a zero), disparado ao entrar na viewport.
- **Fade-up genérico** — wrapper para qualquer elemento: desloca um pouco e aparece.
- **Stagger de grupo** — anima filhos em sequência ao entrar na viewport (grids de card).
- **Transição de cor de fundo** — tween de `background-color` da seção, usado no scroll horizontal de produtos.

Todas as primitivas devem respeitar `prefers-reduced-motion`: nesse caso, nem entrada nem saída são animadas — o estado final é aplicado direto.

**Regras de performance (inegociáveis):**
- Animar só `transform`, `opacity` e `clip-path`. Nunca `width`/`top`/`filter blur` em scrub.
- `will-change: transform` só durante a animação ativa; limpar ao final.
- WebGL sob demanda (import dinâmico), nunca no primeiro paint.
- Hero é foto + texto, sem WebGL; vídeos sempre com poster (protege o LCP).
- Metas: Lighthouse ≥ 90, LCP < 2,5s, INP < 200ms, CLS < 0,1.

---

## 5. Arquitetura do site

Páginas (rotas em pt-BR sem prefixo; `en`/`es` com prefixo — `/en/...`, `/es/...`):

```
/                    Home — o filme contínuo
/produtos            Listagem de produtos (filtro por cultura)
/produtos/[slug]     Página de cada um dos 13 produtos
/culturas            Listagem de culturas
/culturas/[slug]     Página de cada uma das 10 culturas
/calculadora         Calculadora de ganho estimado
/juma-experience     Programa de visita à fábrica
/sobre               História, fundador, marcos, propósito
/materias            Blog técnico (listagem + posts)
/contato             Canais de contato, sem formulário próprio
/admin               Painel administrativo (Payload CMS) — fora do roteamento i18n
```

Navbar fixa (pílula flutuante, encolhe no scroll): Início · Produtos · Culturas · Calculadora · Juma Experience · Sobre · Matérias · Contato · Vagas ↗ (link externo) · **seletor de idioma textual PT | EN | ES** (sem bandeiras — ADR-009).

---

## 6. Narrativa — arquitetura antes da copy

### 6.1 Diagnóstico

Uma copy de abertura forte (o hero, ver `conteudo-paginas.md`) declara uma promessa e a ancora em prova concreta. O risco do resto do site é virar uma sequência de blocos informativos corretos mas desconectados — jornada fala de planta, herança fala de família, produtos falam de fórmula, números repetem dados que já apareceram. Falta um fio que amarre tudo: por que essa sequência de informações, nessa ordem, conta uma história e não um catálogo.

### 6.2 Arquitetura narrativa (o fio)

Ideia central: **a promessa do hero só é crível porque cada seção seguinte resolve uma dúvida específica que ela cria, na ordem em que essa dúvida apareceria na cabeça de quem rola a página.** Não é "seção de produto, seção de cultura, seção de prova" — é uma sequência de perguntas e respostas:

| Ordem | Seção | Pergunta do visitante nesse ponto | Função da seção |
|---|---|---|---|
| 1 | Hero | "Quem fala e o que promete?" | Declarar a promessa, ancorada em prova — copy já aprovada. |
| 2 | Jornada (campo/folha/solo/gota) | "'Fase a fase' quer dizer o quê, na prática?" | Tornar tangível, sensorial, que cada etapa da lavoura é uma decisão separada — demonstração, não aula. |
| 3 | Herança (família/frascos) | "Quem é essa empresa, por que confiar?" | A confiança muda de alvo: da metáfora da lavoura para a origem da empresa. |
| 4 | Faixa de prova | "Tem prova ou é discurso?" | Resposta rápida, em número, antes de qualquer explicação longa. |
| 5 | Problema | "Isso é problema meu?" | Nomear a perda específica que o produtor já sente mas não tem nome para ela. |
| 6 | Solução / 3 passos | "E o que eu faço com isso?" | Caminho prático e simples, sem prometer milagre. |
| 7 | Linhas de produto | "Tem produto pra minha situação?" | Organizar pela fase da lavoura, não pelo catálogo — reforça a Big Idea. |
| 8 | Culturas | "Isso vale pra minha cultura especificamente?" | Atalho direto. |
| 9 | Números | "Quero comparar os números de verdade." | Aprofundamento para quem já decidiu olhar com calma. |
| 10 | Juma Experience | "Isso é só marketing ou dá pra verificar?" | Convite concreto para ver de perto. |
| 11 | Vídeo institucional | "Quero resumir isso pra alguém (sócio, comprador)." | Formato compartilhável. |
| 12 | Depoimentos | "Outros produtores confirmam isso?" | Prova social de pares. |
| 13 | CTA final | "Ok, e agora?" | Convite direto, sem nova promessa. |

**Como usar esta tabela:** ela não é a copy — é a função de cada seção. Toda headline e todo parágrafo deve responder à pergunta da coluna 3, usando os fatos de `conteudo-paginas.md` e `briefing.md` como matéria-prima, seguindo a voz e as proibições de `fundamentos-narrativos.md`.

---

## 7. Home — especificação seção a seção

Ordem completa e conteúdo de referência de cada seção em `conteudo-paginas.md` seção "1) HOME". Resumo da sequência (a "regra geral" é: tamanhos de texto, posições e o peso visual descrito abaixo são a especificação a seguir, não um ponto de partida a redesenhar):

1. **Hero — declaração.** Foto de campo full-bleed, título gigante em caixa alta com uma palavra em destaque (fonte nova, seção 4.2), subtítulo, CTA com linha de redução de ansiedade. Sem WebGL no primeiro paint.
2. **Sequência cinematográfica contínua (jornada + herança).** Oito quadros em scroll travado por seção, vídeo em autoplay (seção 2.1): campo → folha → solo → gota (efeito visual mais tecnológico, sob avaliação de performance) → família do fundador → frasco antigo → morph para o frasco atual → hand-off para o catálogo. Texto sempre em HTML real sobre o fundo, nunca capturado numa textura.
3. **Faixa de prova social.** Números clicáveis, fonte do ensaio colada abaixo de cada um.
4. **Problema.** Tipografia grande, muito respiro, tensão narrativa.
5. **Solução / 3 passos.** Numerados, com stagger reveal.
6. **Linhas de produto — scroll horizontal.** Pin horizontal no desktop, arrasto com física de inércia no mobile (não um slide que trava seco — ver `tecnicas-de-implementacao.md` seção 3), transição de cor por produto (`cores-por-produto.md`). Organização pelas 5 linhas, não pelos 13 produtos soltos. Cada card anima sua própria entrada conforme desliza para o centro da tela durante o pin (técnica de `containerAnimation`, detalhada em `tecnicas-de-implementacao.md` seção 1) — não é a seção inteira que "aparece", é cada card que tem seu próprio momento.
7. **Culturas — grid.** As 10 culturas, stagger reveal, hover com zoom sutil.
8. **Números — prova profunda.** Mesma regra de número colado à fonte, com ressalva de variação.
9. **Juma Experience — teaser.** Parallax discreto (só `transform`).
10. **Vídeo institucional.** Embed com facade (protege LCP/INP).
11. **Depoimentos.** Placeholder claramente marcado até receber os reais.
12. **CTA final.** Única frase de efeito do site inteiro.

**Comprimento e mobile:** a sequência cinematográfica é longa antes da informação concreta de produto — mitigar com nav/CTA do hero que permitem pular direto para produtos ou culturas, versão mobile mais curta e leve (menos quadros, arrasto em vez de scroll travado), e todo o conteúdo textual (links de produto e cultura) no DOM independentemente da animação, por SEO e acessibilidade.

---

## 8. Páginas internas

Estrutura completa de cada página (hero, blocos, ordem) em `conteudo-paginas.md`, seções 2 a 8. Resumo:

- **`/produtos`** — hero + filtro por cultura + grid de cards na cor do produto. **`/produtos/[slug]`** — hero (cor cheia) → Problema → Mecanismo → Culturas (badges) → Benefícios → Modo de uso → Resultados (número + fonte) → Galeria → CTA WhatsApp → Relacionados.
- **`/culturas`** — hero + grid das 10 culturas. **`/culturas/[slug]`** — hero → problema da cultura → tabela de manejo fase a fase → prova → bloco de fechamento (calculadora + WhatsApp).
- **`/calculadora`** — formulário → resultado em sacas e reais, com fonte do ganho médio citada → CTA.
- **`/juma-experience`** — hero → para quem é → experiência em 4 passos → resultado → CTA final.
- **`/sobre`** — abertura/crença → história de origem → marcos (linha do tempo) → propósito → CTA.
- **`/materias`** — listagem com estado vazio definido; conteúdo inicial como módulo de dados tipado.
- **`/contato`** — canais, mapa, sem formulário próprio.

---

## 9. Componentes globais

- **Pop-up de lead (WhatsApp)** — 3 campos (nome, e-mail, WhatsApp). Sem captura por formulário tradicional em nenhuma página.
- **Botão flutuante de WhatsApp** persistente.
- **Banner de cookies** minimalista, não bloqueante.
- **Footer** completo: marca + propósito, navegação, contato, redes sociais, linha legal.
- **Página 404** com CTAs de recuperação (produtos, culturas, falar com a empresa).

Conteúdo de referência de cada componente em `conteudo-paginas.md`, seção "Componentes globais".

---

## 10. Dados e conteúdo

O conteúdo é gerenciado no **Payload CMS** (coleções `Products`, `Cultures`, `CalculatorData`, `Articles`, `Pages`, `Leads`, `Media`, `Users` e o global `Settings`), localizado nos três idiomas. As páginas são geradas em build (SSG) lendo do Payload e revalidadas por ISR, de modo que o banco quase não é tocado pelo visitante.

Durante a Fase 1 do front, enquanto as coleções não estão populadas, é aceitável espelhar os fatos de `briefing.md` e `conteudo-paginas.md` em **módulos de dados tipados** em `src/features/*/data.ts` — com os tipos desenhados para que as queries ao Payload substituam o módulo estático depois sem mudar os componentes que os consomem. Detalhe da infraestrutura na seção 10.5.

---

### 10.5 Infraestrutura (Payload + i18n)

- **App único.** Payload 3 roda no mesmo processo e deploy do Next (ADR-001): site público em `src/app/(frontend)/`, painel em `src/app/(payload)/`. Não mexer na fiação do Payload sem necessidade.
- **i18n com next-intl.** Locales `pt-BR` (padrão, sem prefixo), `en`, `es`; `localePrefix: 'as-needed'` (`src/i18n/routing.ts`). UI estática nos `messages/{pt-BR,en,es}.json`; conteúdo do CMS localizado nos mesmos três locales (`localization` em `src/payload.config.ts`, com `fallback`). O `middleware.ts` cuida do roteamento por idioma.
- **Mídia no Cloudinary** (ADR-002): WebP/AVIF automático, resize, CDN; Postgres fica leve.
- **API REST + Server Actions, sem GraphQL** (ADR-003).
- **Calculadora** client-side com dados (produto × cultura × ganho) lidos do CMS no build (ADR-004).
- **Captura de lead** exclusivamente via pop-up do botão WhatsApp — 3 campos (nome, e-mail, telefone), cultura/produto inferidos do contexto da página; salva em `Leads` e redireciona ao WhatsApp. Sem formulário tradicional, sem e-mail transacional (ADR-005, ADR-007, ADR-017).

### 10.6 Painel administrativo

O painel é o Payload CMS, restilizado com a linguagem visual do **Media Hub by Ocean** (sidebar escura flutuante, workspace claro, glassmorphism, Geist) — tema e componentes custom sobre o Payload, não UI do zero (ADR-018). Especificação completa de tokens, sidebar, dashboard e o que dá/não dá para customizar em `painel-admin.md`. Trabalho da Fase 5; a fundação do tema (variáveis + Geist + Nav escura) pode vir antes sem atrapalhar o front.

## 11. Performance, acessibilidade e SEO

- Lighthouse ≥ 90 · LCP < 2,5s · INP < 200ms · CLS < 0,1.
- Animar só `transform`, `opacity` e `clip-path`.
- WebGL só sob demanda, nunca no primeiro paint.
- Hero é foto + texto; vídeos com poster. `prefers-reduced-motion` = versão estática completa em todo o site.
- Todo link de produto/cultura no DOM, independente de animação.
- Roteamento por idioma com `hreflang` correto entre pt-BR/en/es e `canonical` por locale; pt-BR sem prefixo é o idioma padrão.

---

## 12. Roadmap de implementação

> Uma fase por vez. Cada fase termina com verificação de tipos, execução local e checagem visual (desktop, mobile, `prefers-reduced-motion`) antes de seguir.

**Fase 0 — Fundação.** Setup do projeto (framework, estilo, fontes — seção 3 e 4.2), tokens de cor e tipografia, sistema de movimento (primitivas de reveal/fade/stagger/color-shift da seção 4.3), **i18n** (next-intl, `messages/*.json`, seletor PT|EN|ES), layout global (navbar, footer). *(O scaffold de Next 16 + Payload + Postgres já existe — esta fase é tokens/i18n/shell sobre ele.)*

**Fase 1 — Hero e sequência cinematográfica (jornada + herança).** A seção de maior esforço visual e a primeira impressão do site — construir com a mecânica de autoplay travado por `pin` (seção 2.1), texto sempre em HTML real, coreografia de entrada e saída entre os 8 quadros (seção 4.3). Os vídeos já estão produzidos — o trabalho desta fase é a integração técnica (pin, autoplay, poster, troca de texto por fase), não a produção de mídia.

**Fase 2 — Restante da home, na ordem da seção 7**: faixa de prova → problema → solução → linhas de produto (scroll horizontal) → culturas → números → experience → vídeo → depoimentos → CTA final. Copy de cada seção revisada pela arquitetura narrativa (seção 6.2) e pelas regras de `fundamentos-narrativos.md` antes de codar, não depois.

**Fase 3 — Páginas internas**, na ordem: produtos (listagem + slug) → culturas (listagem + slug) → calculadora → sobre → juma-experience → contato → matérias.

**Fase 4 — Componentes globais restantes**: pop-up de lead (grava em `Leads`), botão flutuante de WhatsApp, banner de cookies, 404.

**Fase 5 — Integração com o CMS e painel administrativo.** Trocar os módulos de dados estáticos por queries ao Payload (produtos, culturas, calculadora, matérias, settings), localizadas nos três idiomas; restilizar o painel com o tema Media Hub (`painel-admin.md`). A fundação do tema (variáveis + Geist + Nav) pode ser adiantada para antes da Fase 1.

---

## 13. Definition of Done

- [ ] Site trilíngue (pt-BR/en/es) navegável, com `hreflang`/`canonical` por locale e seletor PT|EN|ES.
- [ ] Conteúdo lido do Payload (coleções localizadas) e painel `/admin` no ar; leads gravando na coleção `Leads`.
- [ ] Palavra/linha de destaque nos títulos usando a fonte serifada nova; kicker e subtítulo na fonte técnica, sem mudança.
- [ ] Seções pinadas (jornada, herança, scroll horizontal) com saída coreografada, não só entrada.
- [ ] Todas as 13 seções da home no ar, na ordem da seção 7, com copy revisada pela arquitetura narrativa.
- [ ] Todas as páginas internas da seção 8 navegáveis.
- [ ] Nenhum número sem fonte colada; nenhum depoimento inventado.
- [ ] Lighthouse ≥ 90, LCP < 2,5s, INP < 200ms, CLS < 0,1.
- [ ] `prefers-reduced-motion` cobre o site inteiro.
- [ ] Verificação de tipos limpa.

## 14. Melhorias opcionais (pós-MVP, não bloqueiam o lançamento)

Duas microinterações vistas em sites de referência valem registro, mas não como requisito — só como ideia a avaliar depois que o site essencial estiver no ar, e sempre numa versão sóbria que combine com uma marca de 40 anos no agronegócio (nunca a versão lúdica de adesivo/emoji vista em sites de agência de publicidade):

- **Cursor contextual discreto** — um pequeno indicador que segue o cursor com easing suave e muda sutilmente sobre CTAs ou sobre o vídeo institucional. Detalhe e ressalva de tom em `tecnicas-de-implementacao.md` seção 4.
- **Transição de página em wipe da cor primária** — uma camada na cor `#004C26` cobrindo a tela na troca de página, em vez de corte seco. Detalhe em `tecnicas-de-implementacao.md` seção 5.

## 15. Fora de escopo (explicitamente)

E-mail transacional (Resend cortado — ADR-017; leads ficam na aba `Leads` do painel), GraphQL (ADR-003), uma segunda biblioteca de animação de UI (Framer Motion, R3F), e idiomas além de pt-BR/en/es. **Painel administrativo, CMS, banco e autenticação estão DENTRO do escopo** (seções 10.5 e 10.6) — o Payload é parte do app.
