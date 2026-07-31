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
- `familia-matino.webp` — foto da Família Matino (fundador, os dois filhos e o neto), fundo transparente. Usada na home e na página Sobre.
- `desktop/` e `mobile/`:
  - `morph-aminosan-1-antigo.png` — frame inicial do morph (frasco antigo, recortado, centralizado).
  - `morph-aminosan-2-novo.png` — frame final do morph (frasco novo 1L, mesma posição).
  - `morph-aminosan.mp4` — vídeo do morph (antigo → novo).
- Os frames já estão alinhados (mesma posição e escala), prontos pro start/end frame do Kling.

## produtos/
- `<slug>.webp` — foto oficial de cada produto, 1000×1000 com fundo transparente. O nome do arquivo é o slug da rota (`acorda-cana.webp` → `/produtos/acorda-cana`). Usadas na listagem, na página do produto e nos relacionados das culturas.
  - Exceção: a Linha Revigo é representada pelo `revigo-comoni.webp` e a Linha Redutan pelo `redutan-sili-4.webp` (não existe foto "da linha").
- `*-destaque.png` — recortes 1000×1000 usados **só** no catálogo animado da home. São as mesmas fotos dos `.webp`, mantidas em arquivo separado porque o Aminosan é o alvo do morph com o vídeo da seção anterior e depende do enquadramento exato.
- `aminosan-catalogo.png` — frame do vídeo (1777×1000), só na ponte de transição entre AminosanStory e o catálogo.
- `placeholder-produto.png` — fallback quando um produto não tem foto.
- Os arquivos por tamanho (`*-1l.png`, `*-10l.png`, `*-20l.png`) ficaram sem uso quando as fotos únicas entraram; as embalagens hoje são pílulas de texto, não imagens.

## cta-final/ (última seção da home — fecha o filme repetindo a declaração do hero)
- `globo-terra.webp` — globo terrestre, fundo transparente (só a curva da Terra com brilho, sem retângulo). Ancorado no rodapé da seção, atrás do título "Juntos alimentamos o mundo.".

## experience/ (seção "Juma Experience" da home)
- `juma-experience-still.webp` — still de visita guiada na fábrica, usado como capa do card de vídeo (com botão de play por cima) até o vídeo real entrar.

## Pendências de asset
- **Tamanhos do Aminosan recortados** (1L, 10L, 20L em PNGs separados) para a revelação de tamanhos depois do morph e nas páginas de produto.
- **Fotos reais dos produtos** do catálogo (cada um, e por tamanho onde houver), para substituir o placeholder.
- **Otimização** antes do go-live: PNGs e MP4 passam pelo Cloudinary (WebP/AVIF, WebM/VP9 + MP4, poster).
