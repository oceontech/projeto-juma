# Técnicas de Implementação — Receitas de Referência

> Padrões concretos de GSAP/ScrollTrigger/Lenis extraídos do estudo de um projeto open-source real (Next.js + GSAP + Lenis, sem CMS, arquitetura por componentes) que resolve bem interação fluida e scroll-driven. **Não é código a copiar** — são as receitas técnicas, descritas em texto, para o time aplicar com os componentes e o conteúdo da Juma. Confirma que a stack da seção 3 do `PRD.md` (Next.js + GSAP + ScrollTrigger + Lenis, sem segunda biblioteca de animação) é exatamente o que sites de produção desse nível usam hoje.

## 1. Scroll horizontal pinado com entrada de elementos (linhas de produto)

Esta é a receita que faltava detalhar na seção 7 do `PRD.md` ("Linhas de produto — scroll horizontal"). O problema técnico: a seção precisa (a) prender o scroll vertical, (b) traduzir o conteúdo na horizontal conforme o usuário rola, e (c) fazer cada card individual "entrar" com sua própria animação (fade, escala, bounce) **no momento em que ele aparece na tela horizontal**, não no momento em que a seção aparece na tela vertical. São três comportamentos que não podem ser resolvidos com um `ScrollTrigger` só.

**A receita usa dois `ScrollTrigger` separados, mais uma técnica pouco conhecida (`containerAnimation`):**

1. **Um `ScrollTrigger` só para prender (`pin: true`, `pinSpacing: true`).** Define onde a seção trava e por quanto tempo de scroll ela fica travada.
2. **Uma timeline própria (`scrollTween`) com seu próprio `ScrollTrigger` (`scrub: 1`)** que move o conteúdo na horizontal (`x`) proporcionalmente ao progresso do scroll, cobrindo a distância travada. Essa timeline é a "régua" que representa o progresso horizontal da seção inteira.
3. **Cada card individual recebe seu próprio `ScrollTrigger`, mas com `containerAnimation: scrollTween`** (referenciando a timeline do passo 2) em vez de usar o scroll da página direto. Isso faz o `start`/`end` desse ScrollTrigger ser medido **na régua horizontal** (ex.: `start: 'left 90%'`, `end: 'left 50%'`), não na posição vertical da página. Resultado: cada card anima sua própria entrada (escala de 0 a 1, leve rotação, easing elástico) exatamente no instante em que cruza um ponto da tela durante o deslocamento horizontal — não quando a seção inteira aparece.

Esse é o mecanismo certo para: os 5 cards de linha de produto entrando com uma pequena animação de chegada conforme deslizam para o centro da tela, e (se fizer sentido visualmente) o traço de uma linha conectora ou ícone sendo "desenhado" (`stroke-dasharray`/`strokeDashoffset`) no mesmo ritmo.

## 2. Vídeo ambiente vs. vídeo narrativo — dois problemas diferentes, duas técnicas diferentes

Vale reforçar a distinção (já presente no `PRD.md` seção 2.1, esta seção só confirma com um exemplo real): um vídeo de fundo **ambiente** (loop contínuo, `autoplay muted loop playsInline`, sem nenhuma relação com a posição de scroll) é uma técnica trivial e comum até em sites premiados — não tem nada a ver com a complexidade de um vídeo **narrativo** vinculado ao scroll (a jornada fase a fase da Juma, que precisa contar uma sequência com início, meio e fim amarrada à posição do usuário). Não confundir os dois ao planejar esforço de implementação: o hero da Juma é foto + texto (decisão já tomada, protege o LCP), e é a sequência de jornada/herança — não o hero — que carrega a complexidade do vídeo narrativo com `pin` e autoplay travado.

## 3. Drag com física no mobile (carrossel de arrastar)

O `PRD.md` seção 7 já decide "scroll horizontal no desktop, carrossel de arrastar no mobile" para as linhas de produto, mas não detalhava a sensação do arrasto. Recomendação concreta: usar arrasto com inércia (drag + física de "fling", disponível no ecossistema GSAP via plugin de inércia, ou qualquer biblioteca de drag que suporte momentum) em vez de um arrasto que trava direto no card mais próximo. O usuário solta o dedo em movimento e o carrossel continua deslizando e desacelerando, naturalmente, até parar — é o que dá a sensação "premium" de um app nativo, em vez de um carrossel de slide genérico. Vale também para qualquer outro carrossel do site que precise de arrasto no mobile (ex.: galeria de produto).

## 4. Cursor contextual (opcional — avaliar contra o tom de marca antes de priorizar)

Um padrão comum em sites premiados é um pequeno indicador que segue o cursor (via easing suave tipo `quickTo`, não 1:1 com o mouse) e muda de conteúdo/forma dependendo do que está sob o cursor (ex.: vira "play" sobre um vídeo, vira um texto curto sobre um link). É um recurso real de polimento, mas **a versão vista na referência é lúdica (bolhas, adesivos, emojis) — isso combina com uma agência de publicidade jovem, não com uma marca de 40 anos de agronegócio familiar.** Se for adotado para a Juma, a versão precisa ser sóbria: um ponto discreto na cor da marca que talvez cresça levemente sobre um CTA, sem ilustração lúdica. Tratar como melhoria opcional pós-MVP (seção "Melhorias opcionais" do `PRD.md`), não como requisito.

## 5. Transição de página em wipe de cor de marca (opcional)

Outro padrão comum: ao navegar entre páginas, uma camada cheia de cor cobre a tela e descobre a página seguinte, em vez de um corte seco. Para a Juma, a versão que faria sentido é um wipe simples na cor primária (`#004C26`), sem floreio (a referência usa um efeito de "rabisco" decorativo, que não combina com o tom técnico/institucional da marca). Também é melhoria opcional pós-MVP — só vale o esforço se o tempo do projeto permitir, depois do site funcional estar no ar.

## 6. Um único registro para intensidade de microinterações

Padrão de engenharia simples e que vale adotar independente do visual: manter um único objeto/arquivo de configuração para a intensidade de cada microinteração de hover (graus de rotação, força de um efeito, duração) em vez de espalhar números mágicos pelos componentes. Isso estende a mesma lógica que o `PRD.md` seção 4.3 já recomenda para `EASE`/`DUR`/`STAGGER` — qualquer nova microinteração (hover de card, wiggle de ícone) deveria registrar sua intensidade no mesmo lugar, não inline no componente.
