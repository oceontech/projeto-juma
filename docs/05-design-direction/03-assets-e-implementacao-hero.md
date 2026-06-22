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

### Princípio geral: imagem no repouso, vídeo ao rolar

Cada seção mostra a **imagem parada** (PNG, mais nítida) enquanto o visitante está nela. Ao rolar, o **vídeo** daquela seção toca uma vez, do frame inicial ao final, e entrega a seção seguinte já na imagem parada dela. Sequência do swap: PNG nítido → vídeo tocando → PNG nítido da próxima cena.

O vídeo toca por gatilho ao entrar na viewport (duração fixa), com o scroll livre. Mantém a decisão do ADR-016 (sem prender o scroll). No protótipo dá para testar também o modo scrubbing (vídeo amarrado à posição do scroll), mas só se a performance no mobile permitir.

### Seção 1 (campo): a única com movimento no repouso

A seção 1 é montada em camadas, e fica viva mesmo sem rolar:

1. Fundo branco sólido.
2. Texto do hero (aparece subindo, **por trás das montanhas**).
3. `frame-1-campo.png`, a imagem do campo sem fundo (céu transparente), que ocupa a frente do texto e faz as montanhas esconderem a base dele. Cria profundidade.
4. `overlay-folhas.png`, as folhas desfocadas na frente, balançando com o vento via animação CSS (transform leve, contínuo).

Ao rolar, entra o `video-1-campo-folha.mp4` (zoom até a folha). As folhas da frente podem desaparecer no começo do vídeo.

### Seções 2 e 3: estáticas até rolar

No repouso ficam só na imagem parada (`frame-2-folha.png` e `frame-3-solo.png`), sem loop nem animação CSS. Ao rolar, tocam `video-2-folha-solo.mp4` e `video-3-gota-branco.mp4`. O fim do vídeo 3 entrega para a seção de água em WebGL (o gate do ADR-011).

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
