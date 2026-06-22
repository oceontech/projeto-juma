# Assets do Hero — seções 1 a 3

Assets do filme da home (campo, folha, solo). Estrutura espelhada em `desktop/` (16:9) e `mobile/` (9:16).

- `frame-N-cena.png` — imagem parada de cada cena (estado de repouso, alta qualidade).
- `overlay-folhas.png` — folhas desfocadas da frente da seção 1 (balança com o vento).
- `video-N-origem-destino.mp4` — vídeo que toca ao rolar, do frame N ao N+1.

Aplicação, lógica de camadas e pendências: ver `docs/05-design-direction/03-assets-e-implementacao-hero.md`.

Pendências: falta `frame-2-folha` no desktop; decidir tratamento do campo mobile (céu x recorte); otimizar pesos antes do go-live.
