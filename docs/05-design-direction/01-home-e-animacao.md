# Direção de Design — Home e Animação

> Decisões tomadas com o cliente em 20/06/2026 (sessão de elaboração das ideias de hero, fotos e animação). Complementa o PRD v3.0 e atualiza a especificação do hero (PRD 8.6).

## Referências do cliente

Três imagens trazidas pelo cliente:
1. Foto de estúdio do fundador Julio Matino com os dois filhos (fundo branco, camisas Juma).
2. Foto do primeiro frasco do Aminosan, peça antiga dentro de caixa de acrílico (aspecto de relíquia de museu).
3. Print de referência estética: título Montserrat Black gigante em caixa alta ("Juntos alimentamos o mundo"), uma palavra em verde, foto de campo full-bleed, nav flutuante em pílula, muito respiro.

Atenção registrada: a imagem 3 serve de referência **visual**, não de texto. O corpo de texto dela ("Soluções agrícolas integradas que unem tecnologia, sustentabilidade...") é o clichê genérico que a copy do projeto removeu. As palavras vêm sempre do `docs/04-copy/`.

## Decisões

| Tema | Decisão |
|---|---|
| Hero (H1) | **"Juntos alimentamos o mundo"**, estética da imagem 3. Subtítulo claro carrega o que a empresa faz. A Big Idea "fase a fase" vira o segundo ato no scroll. |
| Efeito de água (WebGL) | **Prototipar antes de decidir** (ADR-011 confirmado). Teste isolado na Fase 0; se a performance segurar, entra; senão, plano B. |
| Profundidade da animação | **Decidir por seção.** Esforço pesado concentrado onde gera mais impacto; resto mais sóbrio. Ver alocação abaixo. |

## Estrutura da home (v3, sequência contínua)

Decisão de 20/06/2026: o topo da home deixa de ser blocos separados e vira um **filme contínuo** (hero, jornada agronômica, herança e morph dos frascos), que desemboca no scroll horizontal de produtos. Os blocos racionais descem para depois do scroll de produtos. Ordem de cima para baixo:

1. **Hero declaração.** Título gigante, foto de campo, faixa de prova. Entrada GSAP e parallax leve. Sem WebGL no primeiro paint (protege o LCP).
2. **Sequência cinematográfica contínua.** Oito quadros em scroll contínuo: campo, folha, solo, gota (fundo ondulado), família do fundador, frasco antigo, morph para o frasco novo, hand-off. Detalhe abaixo.
3. **Linhas e produtos (scroll horizontal).** Entra direto do frasco novo. Pin horizontal das 5 linhas no desktop, carrossel de arrastar no mobile.
4. **Culturas.** Grade das 10 culturas, stagger reveal.
5. **Argumento racional.** Como funciona em 3 passos e números de prova (refluem para cá, já que a jornada carrega o problema e o mecanismo na emoção lá em cima).
6. **Juma Experience.** Teaser da visita, parallax.
7. **Depoimentos e CTA final.** Prova de produtor (aguardando cliente) e fecho com WhatsApp.

## Alocação de esforço de animação (decisão "por seção")

Recomendação da Oceon para concentrar o investimento onde o retorno visual é maior:

| Seção | Nível | Motivo |
|---|---|---|
| Hero | **Pesado** | É a primeira impressão e o teste dos 5 segundos |
| Jornada fase a fase | **Pesado** | É a Big Idea virando experiência; o diferencial do site |
| Herança (fotos) | **Pesado** | É o maior ativo de confiança da marca |
| Scroll horizontal de produtos | **Médio** | Impacto bom, técnica conhecida e previsível |
| Culturas, Números, Experience | **Leve** | Reveals e parallax discretos, sem custo de risco |
| Depoimentos, Footer | **Leve** | Fade simples |

## Sequência cinematográfica contínua, detalhamento

A jornada e a herança são um filme só. A gota é a ponte: leva o visitante da história agronômica para a história da empresa, dando motivo ao corte de "lavoura" para "família". O fecho desemboca no produto de hoje, que vira o primeiro card do scroll horizontal. Oito quadros (copy completa em `docs/04-copy/01-home.md`):

1. Campo (vídeo, trator ao entardecer).
2. Folha (vídeo, macro com gota).
3. Solo e raiz (vídeo).
4. Entra na gota, fundo branco ondulado. Texto de ponte: "veja onde tudo começou".
5. Foto do fundador com os dois filhos. A família que conduz hoje.
6. Frasco antigo do Aminosan, na vitrine, enquadrado como relíquia. Prova "mais de 40 anos" sem escrever a frase.
7. Morph em vídeo do frasco antigo para o atual, com o número de prova no reveal do novo.
8. Frasco atual em foco, hand-off para o scroll horizontal de produtos.

Riscos e técnica:
- O morph (quadro 7) usa frames extraídos de vídeo Kling, a mesma técnica das transições da jornada. **Baixo risco.**
- O fundo ondulado (quadro 4) é o único item no gate de protótipo (ADR-011). Os textos da herança ficam em HTML sobre o fundo, nunca capturados na textura. Essa montagem empurra o efeito de água naturalmente para o plano B mais seguro.
- Nuance de tempo: a foto é o fundador com os dois filhos adultos, então lê como "a família de hoje", não "a origem de 1988". Tratar a família como "as pessoas por trás disso" e deixar os dois frascos contarem a linha do tempo.

As mesmas fotos reaparecem na página Sobre (papel biográfico lá, emocional aqui). Aproveita o investimento sem repetir o sentido.

## Comprimento e mobile

O filme contínuo é longo antes da informação concreta de produto. Mitigações obrigatórias:
- Nav e CTA do hero permitem pular direto para produtos ou culturas.
- Mobile recebe versão mais curta e leve da sequência, com menos quadros e arrasto em vez de scroll preso.
- `prefers-reduced-motion` entrega os quadros estáticos.
- Todo o conteúdo textual (links de produto e cultura) fica no DOM independente da animação, por SEO e acessibilidade.

## Scroll horizontal de produtos, regras

- Desktop: pin horizontal do GSAP ScrollTrigger. A seção prende e os cards deslizam na horizontal conforme o scroll vertical. Sem sequestrar o scroll de verdade.
- Mobile: trocar por carrossel de arrastar ou empilhamento vertical. Metade do tráfego agro é mobile; não é detalhe.
- Conteúdo: organizar pelas **5 linhas**, não pelos 13 produtos soltos. Cinco blocos com identidade criam ritmo e conversam com a Big Idea do programa por fases. Cada linha abre para seus produtos.

## Guardrails de performance (inegociáveis)

Metas do PRD continuam valendo: Lighthouse acima de 90, LCP abaixo de 2,5s, INP abaixo de 200ms, CLS abaixo de 0,1.

- Hero sem WebGL: foto e texto no primeiro paint.
- Three.js carregado sob demanda, só quando a seção de água se aproxima.
- Animar apenas transform e opacity.
- Poster estático protege o LCP enquanto vídeos carregam.
- `prefers-reduced-motion` entrega versão estática (acessibilidade).
- Mobile recebe versões mais leves de vídeo e o shader é avaliado por device.

## Pendências geradas

- Tratamento e digitalização em alta das duas fotos do cliente (o frasco antigo pede captura cuidadosa, vale a pena fotografar em estúdio).
- Confirmar a legenda de continuidade do bloco Herança junto à copy.
- Protótipo do efeito de água na Fase 0 (gate do ADR-011).
