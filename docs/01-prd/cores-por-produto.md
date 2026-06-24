# Cores por Produto e Ordem do Catálogo

> Sistema de cor de fundo por produto, para imersão visual e para reduzir o cansaço de leitura. Cada produto puxa uma cor do próprio rótulo. Catálogo de 13 produtos.

## Como a cor se aplica (duas intensidades)

Para dar imersão sem cansar o olho, a cor entra em dois níveis:

- **Cheia**, no momento do produto (card no catálogo da home, hero da página de produto): o fundo assume a cor do rótulo, o frasco se destaca, o texto vai na cor legível da tabela abaixo.
- **Suave**, nas seções de leitura da página de produto: a mesma cor diluída a cerca de 8 a 10% sobre o branco. Mantém a identidade e descansa o olho.

Na troca entre produtos, o fundo faz uma transição suave de cor (GSAP). Vale no catálogo (scroll horizontal) e nas páginas de produto. O filme da home (água, fundador, frascos) continua sempre no branco — a cor por produto começa só quando o catálogo entra.

## Tokens de cor por produto

| Produto | Cor cheia | Cor de texto | Família |
|---|---|---|---|
| Aminosan | `#006838` | branco | verde |
| FitoFert | `#006838` | branco | verde (unificado com Aminosan) |
| Redutan Sili-4 | `#006838` | branco | verde (unificado) |
| Supermix | `#388123` | branco | verde claro (destoa de propósito) |
| Acorda Cana | `#79ab34` | escuro `#1f2e0a` | verde-limão |
| Acorda Ultra | `#008dc2` | branco | azul |
| Linha Revigo | `#312783` | branco | índigo |
| RevigoPhos Amino | `#312783` | branco | índigo |
| Revigo Cobre Ultra | `#312783` | branco | índigo |
| Revigo + Milho | `#312783` | branco | índigo |
| Revigo + Pasto | `#312783` | branco | índigo |
| KMEP Ultra | `#ad1115` | branco | vermelho |
| Aduban | `#ad1115` | branco | vermelho (igual ao KMEP) |
| Redutan Sili-5 | `#7d252a` | branco | vinho |
| Redutan NPK Power-S | `#c2b400` | escuro `#3a3600` | dourado |

Notas:
- O verde unificado (`#006838`) parte do Aminosan; Aminosan, FitoFert e Sili-4 eram quase idênticos no rótulo original.
- Linha Revigo `#312783` é praticamente o secundário da marca (`#302783`) — padronizar num valor só no sistema de design.
- Todos os produtos da marca Revigo compartilham o índigo, por decisão deliberada (reforça que são uma família/linha).

## Regra de ordenação

Produtos vizinhos nunca da mesma família de cor (verde não encosta em verde, vermelho não encosta em vermelho). Exceção: produtos da mesma linha (ex.: as variantes da Linha Revigo) que ficam juntos dentro da página da própria linha.

## Ordem proposta do catálogo (home)

Começa no Aminosan (ponto de partida do hand-off da herança/morph) e alterna as famílias. Os cinco Revigos ficam espalhados (não agrupados) para o fundo mudar de cor mais vezes ao longo do scroll horizontal.

1. Aminosan — verde
2. Linha Revigo — índigo
3. Aduban — vermelho
4. FitoFert — verde
5. RevigoPhos Amino — índigo
6. Acorda Ultra — azul
7. Supermix — verde claro
8. Revigo Cobre Ultra — índigo
9. KMEP Ultra — vermelho
10. Revigo + Milho — índigo
11. Linha Redutan — bloco (dourado, verde, vinho; começa no dourado, termina no vinho)
12. Revigo + Pasto — índigo
13. Acorda Cana — verde-limão

Alternativa possível: agrupar todos os Revigos numa zona índigo contínua (um "capítulo Revigo"), em vez de espalhar. Avaliar as duas e decidir pela leitura real no protótipo — não é uma regra fechada, é uma proposta de ponto de partida.
