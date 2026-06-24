# Assets e Implementação do Hero (seções 1 a 3)

> Assets entregues pelo cliente para as três primeiras seções do filme da home. Reorganizados em `assets/hero/desktop/` e `assets/hero/mobile/`. Este doc descreve o que cada arquivo é, como aplicar e o que ainda falta.

## Inventário (após reorganização)

| Arquivo | O que é | Cena |
|---|---|---|
| `frame-1-campo.png` | Campo ao entardecer, trator, montanhas | Estado de repouso da seção 1 e primeiro frame do vídeo 1 |
| `frame-2-folha.png` | Folha de milho com gota d'água, fundo branco | Junção vídeo 1 → vídeo 2 (repouso da seção 2). **Só existe no mobile.** |
| `frame-3-solo.png` | Planta no solo com respingo d'água, fundo branco | Junção vídeo 2 → vídeo 3 (repouso da seção 3) |
| `overlay-folhas.png` | Folhas desfocadas em primeiro plano, fundo transparente | Camada da frente da seção 1 (balança com o vento) |
| `video-1-campo-folha.mp4` | Zoom do campo até a folha em macro | Seção 1, toca ao rolar |
| `video-2-folha-solo.mp4` | Água escorre pela folha e pinga no chão | Seção 2, toca ao rolar |
| `video-3-gota-branco.mp4` | A gota entra na câmera e tudo fica branco | Seção 3, entrega para a seção de água (WebGL) |

Os mesmos nomes existem em desktop (paisagem, 16:9) e mobile (retrato, 9:16).

## Lógica de aplicação

### Princípio geral: jornada fixa, scroll controla o vídeo (scroll-scrub)

A jornada é **UMA seção fixa (pinned)**. Enquanto o visitante rola, o **scroll controla o vídeo**: o progresso do scroll avança o vídeo (scrubbing) e troca os textos nos pontos certos. A página **só passa para a próxima seção quando a sequência do vídeo termina**. Não são cenas separadas que se rola por cima; é um filme só, dirigido pelo scroll (estilo Apple).

No desktop: GSAP ScrollTrigger com **pin + scrub**, amarrando o `currentTime` do vídeo ao progresso do scroll. Se o scrubbing do MP4 ficar travado, usar **sequência de frames desenhada em canvas** (mais suave, jeito robusto de fazer scroll-scrub). O `frame-N` nítido serve de poster/repouso enquanto o vídeo carrega.

**Sem overlay nem gradiente sobre as imagens.** Os assets já têm **espaço em branco de respiro**, e é nesse espaço que os textos ficam, não sobre a imagem escurecida.

No mobile: pin + scrub de vídeo é pesado; usar versão mais leve (menos quadros ou transição simplificada). `prefers-reduced-motion` mostra um frame estático com a legenda, sem vídeo.

> Isto **substitui** a mecânica anterior (gatilho com scroll livre). Decisão atualizada em 22/06/2026 pelo cliente: o scroll deve dirigir o vídeo, preso, em vez de a página rolar para a próxima seção.

### Seção 1 = hero + jornada numa coisa só, em camadas, com o vídeo atrás

A jornada inteira (campo → folha → solo → gota) NÃO são seções separadas. É **uma seção fixa (pin)**, montada em camadas. Ordem de empilhamento (de trás para a frente):

1. **VÍDEO da jornada** (`video-1...`, depois 2 e 3), atrás de TUDO, parado no primeiro frame.
2. **Headline** "JUNTOS ALIMENTAMOS O MUNDO", em cima do vídeo.
3. **`frame-1-campo.png`** (céu transparente), em cima da headline — as montanhas escondem a base do texto (profundidade). Como é o primeiro frame do vídeo, casa perfeito com ele.
4. **`overlay-folhas.png`**, as folhas desfocadas na frente de tudo, balançando (CSS, transform).

O texto de apoio (subtítulo + CTA) fica num canto, no branco, sem overlay.

**Ao rolar:** a seção **prende (trava o scroll)** e o **vídeo de trás toca sozinho uma vez**, no ritmo normal. **Não é scrub** — o usuário não controla o vídeo quadro a quadro pelo scroll. O scroll fica **travado até a animação terminar**, aí solta e a página segue. As camadas estáticas (campo, folhas) dão lugar ao vídeo (crossfade — sem emenda, pois a imagem é o 1º frame). Os textos das fases (folha, solo, gota) trocam conforme o vídeo toca. No fim, a gota entrega para a seção de água (gate do ADR-011).

Técnica: GSAP ScrollTrigger com **pin**; o vídeo dá `play()` no enter e o pin solta quando o vídeo acaba (evento `ended` ou duração equivalente). Mobile: versão leve.

## Pendências e decisões

### 1. Falta o `frame-2-folha` do desktop
O mobile tem os três frames; o desktop tem só o 1 e o 3. Falta a folha em macro (junção vídeo 1 → vídeo 2) na versão desktop, fundo branco, paisagem. Sem ele, não há imagem de repouso nítida para a seção 2 no desktop.

### 2. O campo do mobile está com céu; o do desktop está recortado
`frame-1-campo` do desktop vem sem fundo (céu transparente) para o efeito de texto atrás das montanhas sobre branco. O do mobile veio com o céu do pôr do sol inteiro (foto cheia). Como o overlay de folhas do mobile existe, a intenção parece ser o mesmo efeito em camadas. Decisão a tomar: ou geramos a versão recortada (céu transparente) do campo mobile para repetir o efeito, ou assumimos que no mobile a seção 1 é foto cheia com céu (sem texto atrás das montanhas). Recomendo manter o mesmo conceito nas duas telas para coerência.

### 3. Conferir o fundo dos vídeos (sem ffprobe aqui, é checagem manual)
MP4 não carrega transparência. Para o swap imagem → vídeo não dar pulo, o **primeiro frame de cada vídeo precisa bater com a imagem de repouso** daquela seção, e o fundo do vídeo (branco ou céu) precisa combinar com o fundo da seção. Vale abrir os três vídeos e confirmar: o vídeo 1 começa no campo igual ao `frame-1`? O vídeo 2 começa na folha igual ao `frame-2`? O vídeo 3 começa no solo igual ao `frame-3` e termina no branco?

### 4. Otimização (obrigatória antes do go-live)
Os arquivos estão pesados para web: PNGs de 1,7 a 4,3 MB e vídeos de 4 a 6 MB. Pipeline no Cloudinary:
- Frames recortados (com transparência): manter PNG ou WebP com alpha.
- Frames de foto cheia: AVIF ou WebP.
- Vídeos: WebM (VP9) + fallback MP4, comprimidos, com poster do primeiro frame.
- Lazy-load por proximidade da viewport; só o frame da seção 1 carrega no primeiro paint (protege o LCP).
- `prefers-reduced-motion`: mostra só os frames estáticos, sem vídeo.

## Resumo do que falta o cliente entregar

- [ ] `frame-2-folha` na versão desktop (folha em macro, fundo branco, paisagem).
- [ ] Decidir o tratamento da seção 1 no mobile (recortar o céu ou manter foto cheia).
- [ ] Confirmar que o primeiro frame de cada vídeo bate com a imagem de repouso.
