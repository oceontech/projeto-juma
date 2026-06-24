# Produção dos Vídeos da Home — Frames + Kling

> Roteiro de produção da sequência cinematográfica da home (ADR-016). O Kling gera vídeo interpolando entre um frame inicial e um frame final. Este doc lista os quadros-chave a gerar na IA de imagem, as fotos reais e os clipes a montar no Kling.

## Princípio que economiza metade do trabalho

O **frame final de um clipe é o frame inicial do clipe seguinte**. Então você não gera 2 imagens por clipe; gera os **quadros-chave** (as imagens paradas de cada beat) uma vez só, e cada um serve de fim de um clipe e início do próximo. Resultado: 7 quadros-chave da IA + 2 fotos reais geram 7 clipes.

Dica de consistência: gere o KF1 e use-o como **imagem de referência** (img2img) para gerar o KF2, o KF2 como referência do KF3, e assim por diante. Mantém a mesma planta, a mesma luz e a mesma paleta na descida inteira. Trave o seed.

Paleta e luz fixas em todos: golden hour, verde profundo e âmbar quente, fotorrealista, profundidade de campo rasa, lente macro nos closes.

## Quadros-chave a gerar na IA de imagem (7)

| ID | Beat | Brief | Prompt sugerido (EN, colável) |
|---|---|---|---|
| KF1 | Campo amplo | Campo de milho ao entardecer, trator pulverizando ao fundo, montanhas, uma planta de milho em foco no 1º plano à direita | `Cinematic wide shot of a vast cornfield at golden hour, a modern tractor spraying in the distance, rolling green hills behind, a single corn plant in sharp focus in the foreground right, warm backlight, volumetric haze, photorealistic, shallow depth of field, 16:9` |
| KF2 | Planta média | A mesma planta de milho em plano médio, folhas preenchendo o quadro | `Cinematic medium shot of a single healthy corn plant, golden hour backlight, green leaves filling the frame, blurred field and tractor far behind, photorealistic, shallow depth of field, warm tones, 16:9` |
| KF3 | Folha macro com gota | Macro da ponta da folha com uma gota d'água pendurada | `Extreme macro of the tip of a corn leaf with a single clear water droplet hanging from the edge, soft blurred green background, warm golden rim light, dewy, photorealistic, shallow depth of field, 16:9` |
| KF4 | Gota caindo | A gota desprendida, em queda, solo escurecendo ao fundo | `Macro of a single water droplet detaching and falling from a corn leaf tip, motion blur on the drop, darker soil coming into view below, warm light catching the droplet, photorealistic, 16:9` |
| KF5 | Splash e raiz | Splash da gota no solo úmido, raiz de milho emergindo, partículas de terra | `Macro of a water droplet splashing on moist dark soil, a young corn root emerging from the earth, suspended soil particles, dramatic close light, photorealistic, shallow depth of field, 16:9` |
| KF6 | Gota estourando para branco | Close extremo numa gota no solo refletindo luz, começando a estourar para branco | `Extreme close-up of a water droplet on wet soil reflecting bright light, the highlight starting to bloom into pure white, photorealistic turning abstract, 16:9` |
| KF7 | Branco ondulado | Superfície branca com ondulação sutil; entrega para o WebGL | `Pure soft white surface with subtle water ripples, minimal, bright, clean abstract liquid surface, gentle caustics, 16:9` |

## Fotos reais (não geradas na IA)

- **P1 — Família.** Foto do fundador com os dois filhos (cliente já tem). Entra como reveal sobre o branco, com leve movimento Ken Burns em CSS, sem Kling.
- **P2 — Frasco antigo.** O primeiro frasco do Aminosan na caixa de acrílico. Recomendado re-fotografar em estúdio.
- **P3 — Frasco novo.** O frasco atual do Aminosan, em estúdio.

**Regra crítica do morph (P2 → P3):** as duas fotos precisam de **enquadramento, ângulo, distância, escala, luz e fundo idênticos**. Fotografe os dois frascos na mesma montagem, com a câmera travada no tripé, trocando só o frasco. Sem isso, o Kling não consegue um morph limpo. Fundo neutro.

## Clipes a gerar no Kling (7)

| Clipe | Frame inicial → final | Movimento (prompt Kling) | Duração |
|---|---|---|---|
| 1 | KF1 → KF2 | `slow dolly in toward the corn plant, gentle wind on the leaves` | 3–4 s |
| 2 | KF2 → KF3 | `push in and rack focus to the leaf tip and the water droplet` | 3 s |
| 3 | KF3 → KF4 | `the droplet detaches and falls, camera follows it downward` | 2–3 s |
| 4 | KF4 → KF5 | `the droplet falls and splashes on the soil, a root emerges` | 3 s |
| 5 | KF5 → KF6 | `camera pushes into a single droplet on the soil, light intensifies` | 2–3 s |
| 6 | KF6 → KF7 | `camera enters the droplet, light blooms into white ripples` | 2–3 s |
| 7 (morph) | P2 → P3 | `smooth morph from the old weathered bottle to the new bottle, the label and glass transform, very subtle rotation` | 3–4 s |

O clipe 6 entrega para a seção WebGL (gota/branco ondulado), que é shader com texto HTML por cima, não vídeo. Os beats família (P1) e frasco antigo (P2) entram como fotos antes do morph. Depois do clipe 7, o frasco novo vira o primeiro card do scroll horizontal, transição feita em código.

## Configurações e pipeline

- **Modo do Kling:** geração com início e fim (start frame + end frame). Criatividade moderada para não distorcer o rótulo nem a planta.
- **Proporção:** gere tudo em 16:9 para desktop. Para o mobile, gere uma variante 9:16 dos quadros-chave e rode o Kling de novo (recortar 16:9 para vertical perde enquadramento). Vale ao menos para os beats principais.
- **Resolução:** gere as imagens e exporte o vídeo no maior tamanho disponível. A compressão final é no Cloudinary.
- **Export:** Kling em MP4 → Cloudinary → WebM (VP9) + fallback MP4, com **poster do primeiro frame** de cada clipe (protege o LCP).
- **Performance:** cada clipe roda uma vez ao entrar na viewport (lazy-load por proximidade), só transform e opacity. `prefers-reduced-motion` mostra o poster estático.
- **Mobile:** versão mais curta da sequência (menos clipes) e arrasto em vez de scroll preso.

## Ordem de produção sugerida

1. Aprovar o KF1 (define a paleta e a luz de tudo).
2. Gerar KF2 a KF7 em cadeia, cada um referenciando o anterior.
3. Fotografar P2 e P3 na mesma montagem travada (o morph depende disso).
4. Rodar os 7 clipes no Kling.
5. Subir no Cloudinary com posters e integrar com GSAP ScrollTrigger.
