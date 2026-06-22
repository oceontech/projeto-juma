# Inventário De/Para e Mapa de Redirects 301

> O catálogo do site antigo é **idêntico** ao briefing (13 produtos, 10 culturas). Os slugs antigos enganam — o de/para abaixo foi confirmado lendo o conteúdo de cada página raspada.

## Produtos — de/para confirmado

| Slug antigo (`/produto/…`) | Produto real | Slug novo (`/produtos/…`) |
|---|---|---|
| `acorda` | **Acorda Ultra** (slug antigo incompleto) | `acorda-ultra` |
| `acorda-cana` | Acorda Cana | `acorda-cana` |
| `aduban` | Aduban | `aduban` |
| `aminosan` | Aminosan® | `aminosan` |
| `fitofert` | FitoFert® | `fitofert` |
| `kmep` | **RevigoPHOS® amino** (produto rebatizado, slug antigo mantido no WP) | `revigophos-amino` |
| `kmep-ultra` | KMEP Ultra® (continua em linha) | `kmep-ultra` |
| `milho` | Revigo® + Milho | `revigo-milho` |
| `pasto` | Revigo® + Pasto | `revigo-pasto` |
| `redutan-npk` | Linha Redutan (NPK) | `linha-redutan` |
| `redutan-sili-4` | Linha Redutan (Sili-4; novo site soma o Sili-5) | `linha-redutan` |
| `revigo` | Linha Revigo® | `linha-revigo` |
| `supermix` | Supermix® | `supermix` |
| — *(sem página antiga)* | **Revigo® Cobre Ultra (novo)** | `revigo-cobre-ultra` |

## Culturas — mesmas 10, slugs quase idênticos

| Slug antigo (`/cultura/…`) | Slug novo (`/culturas/…`) |
|---|---|
| `soja` | `soja` |
| `milho` | `milho` |
| `cafe` | `cafe` |
| `cana` | `cana-de-acucar` |
| `algodao` | `algodao` |
| `feijao` | `feijao` |
| `citros` | `citros` |
| `batata` | `batata` |
| `tomate` | `tomate` |
| `pastagem` | `pastagem` |

## Demais rotas

| URL antiga | Destino novo |
|---|---|
| `/empresa` | `/sobre` |
| `/produtos` | `/produtos` |
| `/culturas` | `/culturas` |
| `/eventos` + posts `/2019/…`, `/2020/…` | `/materias` (ou post equivalente se migrado) |
| `/desata` | `/sobre#desata` ou página própria (decidir) |
| `/area/*` (administrativo, rh, comercial, faturamento, contas-a-receber, rh-curriculo) | `/contato` |
| `/en/*` (árvore inteira, inclusive slugs com sufixo `-2`) | rota equivalente em `/en/…` |
| PDFs (`/Prospectos/*`, `/Publicacoes_Tecnicas/*`, `/Artigos/*`) | **manter URLs ou redirecionar para nova seção de materiais — decidir com cliente** |
| `juma-agro.com` (domínio) | 301 → `juma-agro.com.br` |

## Regras gerais

1. Toda URL indexada do site antigo precisa de um 301 explícito — a lista completa de URLs está em `.firecrawl/` (98 páginas mapeadas)
2. Normalizar `http://` → `https://` e remover `www.` no nível de domínio
3. Validar pós-go-live com o Google Search Console (cobrir os relatórios de 404)
4. Os slugs novos acima são proposta — congelar junto com o sitemap final antes da Fase 1
