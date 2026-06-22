# Assets do site Juma Agro

Nomes em kebab-case, sem espaços nem acentos. Estrutura espelhada em `desktop/` (16:9) e `mobile/` (9:16) onde faz sentido.

## brand/
- `logo-juma-agro.png` — logo oficial.

## hero/ (seções 1 a 3 do filme da home: campo, folha, solo)
- `desktop/` e `mobile/`:
  - `frame-1-campo.png`, `frame-2-folha.png`, `frame-3-solo.png` — imagens de repouso de cada seção.
  - `overlay-folhas.png` — folhas desfocadas da frente da seção 1 (balança com o vento).
  - `video-1-campo-folha.mp4`, `video-2-folha-solo.mp4`, `video-3-gota-branco.mp4` — tocam ao rolar.
- Detalhes de aplicação: `docs/05-design-direction/03-assets-e-implementacao-hero.md`.

## heritage/ (fundador + morph do Aminosan, depois da água)
- `fundador-e-filhos.png` — foto do fundador com os dois filhos, fundo transparente. Usada na home e na página Sobre.
- `desktop/` e `mobile/`:
  - `morph-aminosan-1-antigo.png` — frame inicial do morph (frasco antigo, recortado, centralizado).
  - `morph-aminosan-2-novo.png` — frame final do morph (frasco novo 1L, mesma posição).
  - `morph-aminosan.mp4` — vídeo do morph (antigo → novo).
- Os frames já estão alinhados (mesma posição e escala), prontos pro start/end frame do Kling.

## produtos/
- `placeholder-produto.png` — montagem padrão (Revigo CaB) usada só como protótipo. Trocar pela foto real de cada produto.

## Pendências de asset
- **Tamanhos do Aminosan recortados** (1L, 10L, 20L em PNGs separados) para a revelação de tamanhos depois do morph e nas páginas de produto.
- **Fotos reais dos produtos** do catálogo (cada um, e por tamanho onde houver), para substituir o placeholder.
- **Otimização** antes do go-live: PNGs e MP4 passam pelo Cloudinary (WebP/AVIF, WebM/VP9 + MP4, poster).
