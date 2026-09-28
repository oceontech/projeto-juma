# Painel Juma: análise dos dois sites e arquitetura do painel administrativo

> Documento de planejamento, **versão 2 (28/09/2026)**. Base: leitura de `projeto-juma/` (site BR) e `projeto-juma-eua/web/` (site EUA).
> A v2 incorpora as decisões da Oceon sobre escopo enxuto e domínio, e acrescenta a varredura de arquivos sem uso (seção 11).

## Decisões já tomadas (v2)

| Tema | Decisão |
|---|---|
| **Escopo** | O painel cobre **o essencial do dia a dia**. Mudanças de texto institucional e de estrutura continuam com a Oceon, no código. |
| **Domínio** | `juma-agro.com.br/admin`. O Payload **continua dentro do app do site BR** (ADR-001 mantido), e o site EUA consome a API dele. |
| **Módulos fora do painel** | Provas e ensaios, Downloads, Calculadora, SEO por página, Auditoria e Aprovações. **Redirecionamentos** ficam. |
| **Produtos fora do catálogo** | Revigo Mol, Master, Boro 10, Nitrogênio Plus, Mn e CaB existem, mas a Juma **não quer página** para eles. Continuam citados como texto no manejo das culturas, por decisão, sem aviso. |
| **Português no site EUA** | Existe só para facilitar a construção pela equipe brasileira. **Não entra no painel.** O EUA é só inglês, e o seletor EN/PT sai no lançamento. |

---

## 1. Diagnóstico

### 1.1 Site BR (`projeto-juma/`)

- **Idiomas e páginas:** trilíngue (pt-BR/en/es). Páginas:
  - Home, com 14 seções;
  - Produtos: listagem e 14 páginas;
  - Culturas: listagem e 10 páginas;
  - Matérias: 7 artigos;
  - Sobre, Juma Experience, Olho no Alvo e Contato.
- **Payload + Neon já instalados, mas o site não lê nada do Payload.**
  - O conteúdo está em `messages/*.json` (cerca de 4 mil linhas por idioma), em arrays dentro dos componentes e em `src/config/site.ts`.
  - As coleções existentes não batem com os campos que as páginas usam.
  - A mídia vai para o disco local, que a Vercel não preserva.
  - Não há papéis de usuário nem migrations.
- **Nenhum lead é salvo.** O formulário de contato só abre o WhatsApp, e o pop-up de lead previsto no PRD não existe.
- **O mesmo produto está descrito em pelo menos 8 lugares, com cores divergentes** (o Aminosan tem três cores). A relação produto × cultura está em 3 listas sem ligação entre si.
- **Os depoimentos da Home são fictícios** (pendência #8).
- **Faltam:**
  - sitemap, robots, hreflang, canonical e OG;
  - analytics;
  - banner de cookies;
  - política de privacidade (linkada no rodapé, mas a página não existe).

### 1.2 Site EUA (`projeto-juma-eua/web/`)

- **Páginas:** Home, LP KMEP Ultra® (com variante `/kmep-b`) e LP Aminosan®. `/aminosan-b` é a LP antiga, ainda com placeholders visíveis.
- **Conteúdo** em TS tipado (`web/src/content/*.ts`). As cenas são sob medida (partículas, timelines, sprites) e **não se prestam a edição livre**.
- **O formulário de trial descarta o lead:** só faz `console.info`.
- **O "A/B" não mede nada:** as duas variantes do KMEP enviam `source="kmep"`.
- **Não existem:** telefone, e-mail, redes sociais e páginas legais (os links apontam para `#`). Os CTAs do header apontam para uma âncora que só existe na Home.
- **O site está bloqueado para indexação** até a liberação regulatória (FIFRA/EPA/FTC).

### 1.3 O que isso significa para o painel

| | BR | EUA |
|---|---|---|
| Conteúdo editável no painel | Produtos, Culturas, Matérias, Depoimentos | **Nenhum conteúdo de página.** As LPs continuam em código com a Oceon: são 2 produtos, cenas sob medida e copy regulada. |
| Operação no painel | Leads, Analytics, Configurações, Redirecionamentos | Leads, Analytics, Configurações (contato, legal, blocos HOLD), Redirecionamentos |
| Idiomas | pt-BR, en, es | en |

O ganho real para o EUA está em **leads, métricas e configurações**. Levar as LPs para o CMS custaria caro, com risco de quebrar as cenas e de publicar claim sem revisão, para uma frequência de mudança baixa.

---

## 2. Inventário do que vai para o painel

**BR: conteúdo**
- **Produtos**, que substituem as 8 fontes duplicadas atuais:
  - identidade: nome, slug, linha, tag, descrição, frasco, embalagens;
  - cores: uma cor oficial do rótulo, mais a paleta do showcase;
  - culturas: relação com as 10 do site, mais a lista livre do rótulo;
  - problemas, benefícios e aplicações por cultura;
  - resultados, com valor, unidade, descrição e fonte;
  - galeria e relacionados;
  - destaque no showcase da Home, com 3 stats.
- **Culturas:**
  - nome, badge e imagem;
  - "como atua";
  - desafios por fase;
  - manejo por fase, com produto (relação ou nome livre) e dose;
  - nota e fonte;
  - produtos recomendados.
- **Matérias:**
  - título, subtítulo, slug, categoria, data, capa, autor;
  - introdução, corpo e citação;
  - destaque.
- **Depoimentos:** substituem os 3 fictícios quando chegarem os reais.

**Os dois sites: configurações**
- Contato:
  - WhatsApp (hoje repetido em 4 componentes);
  - telefones e e-mails por área (comercial, compras, RH);
  - horário;
  - endereços e mapa.
- Redes sociais.
- Textos legais: privacidade, termos e cookies. As páginas são criadas pela Oceon e o texto passa a vir do painel.
- Aviso temporário no topo do site (feira, evento).
- EUA: liga/desliga dos blocos HOLD (claims pendentes de registro na EPA) e contato da LLC, quando a P11 for resolvida.

**Continua no código, com a Oceon:**
- textos institucionais da Home, Sobre, Experience e Olho no Alvo;
- menus e rodapé;
- microcopy da interface;
- todo o conteúdo das páginas do EUA;
- vídeos e animações;
- calculadora;
- SEO técnico (gerado automaticamente, ver 4.9).

---

## 3. Sidebar

O **seletor de site** fica no topo, com três opções: Todos, Brasil e Estados Unidos.
- **"Todos"** agrega Visão geral, Leads e Analytics.
- **"Brasil" e "EUA"** filtram tudo e mostram só os módulos daquele site.
- Uma **faixa de cor de contexto** mostra o site ativo: verde #004C26 para o Brasil e azul para os EUA.

```
[Logo Juma]
[ Site: Todos ▾ ]            Todos · Brasil · Estados Unidos
─────────────────────
Visão geral
Leads                  (12)
Analytics
─────────────────────
CONTEÚDO                     só no contexto Brasil
  Produtos
  Culturas
  Matérias
  Depoimentos
─────────────────────
Mídia
─────────────────────
CONFIGURAÇÕES
  Configurações do site      contato, redes, legal, avisos, HOLD (EUA)
  Redirecionamentos
─────────────────────
Usuários
```

São 11 itens. No contexto EUA, a sidebar mostra só: Visão geral, Leads, Analytics, Mídia, Configurações do site, Redirecionamentos e Usuários.

---

## 4. Funcionalidades por módulo

### 4.1 Visão geral
- **Cards:**
  - leads de hoje, 7, 30 e 90 dias, com variação;
  - visitantes;
  - taxa de conversão;
  - leads sem atendimento há mais de 48 h, em alerta.
- **Gráfico:** leads × visitas por dia. Em "Todos", separa Brasil e EUA.
- **Rankings:**
  - páginas mais vistas;
  - produtos e matérias mais vistos;
  - origem dos leads (página, UTM).
- **Mapa:** estados/regiões dos visitantes e dos leads.
- **Últimos leads** recebidos.

### 4.2 Leads (caixa única)
- **Captura:**
  - BR: pop-up de 3 campos antes do WhatsApp (ADR-007) e formulário de contato;
  - EUA: TrialForm completo e compacto.
- **Campos gravados:**
  - site e idioma;
  - formulário;
  - página de origem;
  - contexto (produto/cultura da página);
  - variante A/B;
  - campos do formulário (flexíveis por site);
  - UTM de primeiro e último toque, gclid/fbclid e referrer;
  - dispositivo e navegador;
  - país/estado/cidade aproximados, pelos headers da Vercel, sem guardar IP;
  - consentimento com data.
- **Gestão:**
  - status: Novo → Em contato → Qualificado → Convertido / Descartado;
  - responsável;
  - notas internas;
  - filtros, busca e exportação CSV.
- **Proteção:**
  - deduplicação por e-mail/telefone;
  - honeypot e Cloudflare Turnstile;
  - limite de requisições.
  - O `POST /api/leads` público de hoje é fechado: cada site grava por server action com chave de API.
- **CRM:** o painel é a fonte dos leads. A integração com CRM entra depois, por webhook, quando o CRM estiver escolhido (P27).

### 4.3 Analytics
- **Ferramenta:** Umami, já previsto, com os dois sites como dois "websites" na mesma conta.
  - Não usa cookies nem identifica pessoas, o que simplifica LGPD, GDPR e CCPA.
  - Tem API, que alimenta o painel.
- **Eventos padronizados nos dois sites:**
  - `lead_open` e `lead_submit`;
  - `whatsapp_click`;
  - `trial_form_submit`;
  - `variant_view`.
- **Tela no painel:** resumos filtrados por Todos, Brasil ou EUA, com link para abrir o Umami.
- **Complementos:**
  - Vercel Speed Insights só para performance.
  - GA4 e Meta Pixel só quando houver mídia paga, com banner de consentimento.

### 4.4 Produtos (BR)
- **Formulário em abas que seguem a página atual:** Identidade · Culturas · Problemas · Benefícios · Aplicações · Resultados · Galeria · Relacionados · Destaque na Home.
- **Validações:**
  - "resultado precisa de fonte";
  - "vizinho no showcase não pode ter a mesma família de cor" (`cores-por-produto.md`).
- **Ações:**
  - criar e editar;
  - duplicar;
  - ordenar arrastando;
  - publicar/despublicar;
  - arquivar.
- **Criar produto novo gera a página completa sem código**, porque o template BR é padronizado.
- **Sem page builder livre:** o layout é fixo e o que varia é o dado.

### 4.5 Culturas (BR)
- Campos da seção 2.
- **Manejo:** cada produto do manejo pode ser um produto do catálogo (vira link) ou um nome livre, para os produtos que não estão no site.
- **Ordem:** arrastando.
- **Exclusão:** bloqueada quando a cultura está em uso. A tela lista onde ela aparece (Home, grid, filtros, produtos) e oferece arquivar.

### 4.6 Matérias (BR)
- **Estados:** rascunho → publicado, com agendamento e preview.
- **Campos:** os da seção 2, mais resumo e produtos/culturas relacionados, para o CTA contextual.
- **Categorias:** editáveis.
- **Idiomas:** abas PT | EN | ES, com indicador de tradução faltando e fallback para pt-BR.
- **Autores:** texto simples. Os autores atuais precisam ser validados pela Juma.
- **Dados técnicos:** o tempo de leitura é calculado. A meta description sai do resumo.
- **Correções no caminho:**
  - eliminar as 3 listas duplicadas de artigos;
  - capas `.png` inexistentes;
  - paginação real.

### 4.7 Depoimentos (BR, e EUA se houver)
- **Campos:**
  - nome, cargo, fazenda, cidade/UF;
  - cultura e produto;
  - foto e vídeo;
  - texto por idioma;
  - resultado com fonte;
  - termo de autorização (arquivo);
  - ativo e ordem.
- **Regra:** sem termo de autorização, o depoimento não publica.

### 4.8 Mídia
- **Biblioteca única,** com pastas, busca e filtro "em uso / sem uso".
- **Upload:**
  - arrastar e soltar;
  - alt obrigatório;
  - ponto focal;
  - substituir o arquivo mantendo a mesma referência.
- **Otimização:** `next/image` entrega WebP/AVIF. O armazenamento é o Vercel Blob (ver D2).
- **Vídeos e sequências das animações continuam no repositório.**

### 4.9 Configurações do site (uma por site)
- Contato, redes, textos legais e aviso temporário (seção 2).
- **Mensagem padrão do WhatsApp por contexto.** Exemplo: "Olá, vim pela página do Acorda Ultra".
- **Textos do pop-up / formulário e texto de consentimento.**
- **EUA:**
  - blocos HOLD, com liga/desliga e motivo;
  - variante A/B ativa;
  - chave "indexação ligada/desligada", que substitui o bloqueio fixo no código no dia da liberação.
- **IDs de integração** (Umami, GA4, Turnstile), visíveis só para Admin.
- **SEO técnico, gerado pelo código e fora do painel:**
  - sitemap e robots;
  - hreflang e canonical;
  - OG padrão;
  - JSON-LD de produto/artigo, a partir dos dados do CMS.

### 4.10 Redirecionamentos
- Tabela de/para por site (301/302), com contador de acessos.
- Importação em lote, para migrar as 98 páginas do site antigo (pendência #10).
- Redirect criado automaticamente quando o slug de um produto, cultura ou matéria muda.

### 4.11 Usuários
- Login, logout, sessão persistente e recuperação de senha.
- Papel e site(s) permitidos por usuário (seção 7).

### 4.12 Recursos nativos que vêm sem custo extra
- Rascunho, autosave e histórico de versões, com restauração, em Produtos, Culturas, Matérias e Depoimentos. É nativo do Payload e não é a "Auditoria" que saiu do escopo.
- Aviso de edição simultânea.
- Confirmação antes de excluir.
- Preview ao vivo e publicação por ISR on-demand, sem deploy.

---

## 5. Modelo de dados

```
users            email, nome, papel, sites[], ativo
products         slug, status, ordem, linha(select), nome/tag/descrição (loc), frasco(media),
                 embalagens[], corRotulo, showcase{base,mid,accent,destaque,ordem,stats[]},
                 culturas(rel cultures), culturasRotulo[] (loc), problemas[] (loc),
                 beneficios[] (loc), aplicacoes[{label,nota,linhas[{cultura,quando}]}] (loc),
                 resultados[{valor,unidade,descricao,fonte}] (loc), galeria(rel media),
                 relacionados[{produto,chamada}], versions+drafts
cultures         slug, status, ordem, nome/badge/descrição (loc), imagem, gradiente,
                 comoAtua[] (loc), desafios[{fase,titulo,descricao}] (loc),
                 manejo[{label,fase,itens[{produto(rel)?|nomeLivre,dose}]}] (loc), notaManejo, fonte,
                 recomendados[{produto,tag,descricao}] (loc), versions+drafts
posts            slug, status, publishAt, categoria(rel), capa, cor, autor, destaque,
                 titulo/subtitulo/resumo/intro/corpo/citacao (loc), produtos[], culturas[]
categories       nome (loc), slug, cor
testimonials     site, nome, cargo, fazenda, local, cultura, produto, foto, video,
                 texto (loc), resultado{valor,fonte}, termo(media), ativo, ordem
media            arquivo, alt (loc), pasta, focalPoint
leads            site, locale, formulario, pagina, contexto{produto?,cultura?,post?}, variante,
                 dados(json), utm{first,last}, referrer, clickIds, device, browser, geo{pais,uf,cidade},
                 consentimento{texto,data}, status, responsavel(rel users), notas[], contato(rel contacts)
contacts         email/telefone normalizados, site (deduplicação)
redirects        site, de, para, tipo, hits
siteSettings     global por site (br|us): contato, redes, legal, aviso, whatsappMensagens,
                 formulario, hold[] (us), variante (us), indexacao (us), integracoes
```

- **Coleções só do BR:** products, cultures, posts, categories. Não levam campo de site, porque só o BR tem essas coleções.
- **Coleções com campo `site`:** leads, testimonials, redirects e siteSettings.
- **Por que sem multi-tenant:** conteúdo compartilhado quase não existe. O plugin de multi-tenant seria complexidade sem retorno.

---

## 6. Arquitetura técnica

```
juma-agro.com.br  (Vercel · app Next 16 do site BR)
 ├─ /            site BR (SSG/ISR, lê o Payload pela Local API)
 ├─ /admin       painel Payload (tema Media Hub)
 └─ /api         REST do Payload + /api/leads (chave por site) + /api/revalidate
        │
        ├── Neon Postgres (migrations versionadas, PITR)
        └── Vercel Blob (mídia)

site EUA (Vercel · app Next 16 separado)
 ├─ lê siteSettings/redirects do BR via REST, com cache por tag
 ├─ server action do TrialForm → POST juma-agro.com.br/api/leads (chave EUA)
 └─ /api/revalidate chamado pelo hook afterChange do Payload
```

- **Painel:** Payload Admin com o tema de `painel-admin.md`:
  - `custom.scss` e Geist;
  - Nav custom com o seletor de site;
  - Dashboard custom;
  - Logo e login.
  - Telas custom: Visão geral e Analytics.
- **Backend:**
  - Payload 3 com hooks, controle de acesso e versions;
  - REST;
  - **remover as rotas GraphQL** (ADR-003).
- **Banco:**
  - Neon, que já está em uso;
  - migrations com `payload migrate` no lugar do push de dev;
  - seed a partir de `messages/*.json` e dos arrays TS. O seed gera um relatório de divergências (cores, datas) para a Juma validar.
- **Auth:** nativa do Payload.
  - Cookie HTTP-only e bloqueio após tentativas falhas.
  - "Esqueci a senha" precisa de e-mail transacional (D3).
  - Supabase não é necessário.
- **Cache:** os sites continuam estáticos. Publicar no painel revalida as páginas por tag em segundos.
- **Observabilidade:** Umami para métricas e Sentry para erros (os dois já previstos).
- **Variáveis de ambiente:** `DATABASE_URL`, `PAYLOAD_SECRET`, `BLOB_READ_WRITE_TOKEN`, `LEADS_API_KEY_BR/US`, `REVALIDATE_SECRET`, `UMAMI_*`, `TURNSTILE_*` e `RESEND_API_KEY` (D3).

**Cuidado com o `/admin` no mesmo domínio:** o middleware do next-intl já exclui `admin` e `api`. O bundle do Payload fica só nas rotas `(payload)` e não pesa no site público. É preciso verificar no build que o Lighthouse continua ≥ 90.

---

## 7. Permissões

| Papel | Conteúdo BR | Leads | Analytics | Configurações e Redirecionamentos | Usuários |
|---|---|---|---|---|---|
| **Admin** (Oceon + 1 pessoa da Juma) | total | total | total | total | total |
| **Editor** (marketing/conteúdo) | criar, editar, publicar | ver | ver | editar contato, redes e aviso | não |
| **Comercial** | ler | total (status, notas, responsável, CSV) | resumo | não | não |

- **Escopo por site:** cada usuário tem os sites em que atua. Exemplo: o comercial da LLC vê só leads do EUA.
- **Papel "Leitura":** pode ser acrescentado depois sem mudar a estrutura.

---

## 8. Melhorias que cabem no escopo enxuto

1. **Mensagem de WhatsApp com contexto da página.** Melhora o atendimento e o lead já chega qualificado.
2. **Alerta de lead parado há mais de 48 h** na Visão geral.
3. **A/B real no EUA,** com divisão de tráfego e variante gravada no lead, para o painel comparar as variantes.
4. **Relatório mensal** de leads e visitas por site, exportável.
5. **Checagem de saúde** na Visão geral:
   - traduções EN/ES faltando;
   - imagens sem alt;
   - produto sem foto.

---

## 9. Roadmap

> **Andamento em 28/09/2026 (branches `feat/painel-leads` no BR e `feat/leads-no-painel` no EUA):**
> - **Feito: papéis e escopo por site.**
>   - Admin, editor e comercial, com os sites de cada usuário.
>   - O primeiro usuário nasce admin.
>   - Se o banco não tiver admin, o usuário mais antigo vira admin.
>   - Bloqueio após 5 senhas erradas.
> - **Feito: leads nos dois sites.**
>   - Pop-up BR antes do WhatsApp em todos os CTAs, com a copy oficial nos 3 idiomas e mensagem por produto ou cultura.
>   - Formulário de contato BR gravando.
>   - Trial EUA enviando por `POST /api/leads/intake`, com chave.
>   - Cada lead guarda UTM de primeiro e último toque, página, variante A/B, dispositivo, geo pelos headers da Vercel e consentimento.
>   - Deduplicação por e-mail/telefone, isca anti-robô e tempo mínimo de envio.
>   - REST público de criação fechado.
>   - Painel com status, responsável e notas, em português.
>   - Testes em `tests/int/leads.int.spec.ts`.
> - **Feito: infraestrutura na Vercel.**
>   - Neon `juma-painel` (iad1), lido de `PAYLOAD_DATABASE_URL`, com migration inicial aplicada.
>   - Blob público `juma-painel-midia`; a mídia sai direto da CDN.
>   - Chave dos leads nos dois projetos: `LEADS_INTAKE_KEY_US` no BR; `LEADS_INTAKE_KEY` e `LEADS_INTAKE_URL` no EUA.
>   - Schema só por migrations, aplicadas no build de produção.
> - **Pendente para ir ao ar:**
>   - publicar juntas as branches `feat/painel-leads` (BR) e `feat/leads-no-painel` (EUA). O EUA já tem `LEADS_INTAKE_URL` em produção, e o endpoint só existe depois do deploy do BR;
>   - criar o primeiro usuário em `/admin` (vira admin);
>   - Resend para recuperação de senha (D3), conta criada pela Juma/Oceon;
>   - remover da Vercel o `DATABASE_URL` antigo do `site-juma`, que é de outra aplicação;
>   - exportação CSV.

**MVP**
1. **Infra:**
   - storage no Vercel Blob;
   - migrations;
   - remover GraphQL;
   - papéis Admin/Editor/Comercial com escopo por site;
   - recuperação de senha (D3).
2. **Leads nos dois sites:**
   - pop-up BR antes do WhatsApp;
   - TrialForm EUA gravando no painel;
   - UTM, contexto e geo;
   - anti-spam;
   - lista com status, notas e CSV.
3. **Configurações do site:** BR e EUA, com as páginas legais criadas.
4. **Produtos, Culturas e Matérias BR** lidos do Payload, com seed a partir do conteúdo atual e ISR on-demand.
5. **Mídia.**
6. **Tema Media Hub:** sidebar com seletor de site, login e Visão geral v0.
7. **Umami** nos dois sites, com os eventos de lead.

**Versão 1**
- Depoimentos.
- Redirecionamentos, com importação do site antigo.
- Analytics no painel e Visão geral completa.
- HOLD e chave de indexação do EUA.
- Agendamento e preview de matérias.
- Faxina da seção 11 concluída.

**Futuro**
- Webhook para CRM.
- A/B com divisão real e comparação.
- Relatório mensal.
- Papel Leitura.
- Matérias no EUA, se a Juma quiser.

---

## 10. Decisões que ainda faltam

| # | Decisão | Recomendação |
|---|---|---|
| D2 | Storage de mídia | **Vercel Blob** (adapter oficial do Payload). O ADR-002 (Cloudinary) é revogado por simplicidade. É bloqueante: os uploads em disco somem na Vercel. |
| D3 | E-mail transacional (o ADR-017 cortou) | Voltar com Resend **só** para "esqueci a senha" e aviso de lead novo ao responsável. Sem isso, não há recuperação de senha. |
| D5 | Cor oficial de cada produto | Juma valida uma tabela única, gerada pelo seed. |
| D7 | Quem atende os leads do EUA (P11) | Definir o responsável antes de ligar o formulário. |
| D11 | Depoimentos fictícios na Home BR | Esconder a seção até chegarem os reais. |
| D12 | LP antiga `/aminosan-b` | Aposentar: libera cerca de 26 MB e 11 componentes (seção 11.2). |

---

## 11. Varredura: o que não está sendo usado

Método: cada arquivo de `public/` foi cruzado com todas as referências no código (caminhos literais e caminhos montados por template). Também foram procurados componentes não importados, chaves de conteúdo sem leitor e dependências sem import. **Nada foi apagado.** As listas abaixo são para decisão.

### 11.1 Site BR (`projeto-juma/`)

**Arquivos em `public/` sem referência, cerca de 4,8 MB:**

| Arquivo(s) | Tamanho | Observação |
|---|---|---|
| `public/cultures/*.webp` (10) | 2,0 MB | Cópia idêntica de `public/assets/cultures/`, que é a pasta usada. |
| `public/heritage/desktop/{line-aminosan-full,morph-aminosan-1-antigo,morph-aminosan-2-novo}.png` | 0,85 MB | O código usa as versões `.webp`. |
| `public/desata/{banner-olho-no-alvo,olho-no-alvo-comercial}.webp` | 0,54 MB | Cópias; o código usa `public/olho-no-alvo/`. |
| `public/desata/{team-1,maquina-agricola,logo_nitec,logo_uenp}.webp` | 0,38 MB | Sobra da antiga página Desata. |
| `public/assets/about/{ao-lado-produtor,conhecimento-aplicado,responsabilidade}.webp` e `bento/{gallery-ensaios-campo,gallery-suporte-campo}.webp` | 0,63 MB | Imagens do Sobre que não entraram. |
| `public/heritage/familia-matino.webp` | 0,37 MB | Foto da família sem uso. |
| `public/brand/logo-juma-agro.ico` | 0,13 MB | O favicon usado é `src/app/favicon.ico`. |

**Referências quebradas (o código pede um arquivo que não existe):**
- `/materias/capa-destaque.png`, `/materias/aminoacidos-foliares.png` e `/materias/calda-eficiente.png`: existem só em `.webp`. Afetam o hero da matéria e o "Leia também".
- `/heritage/desktop/morph-aminosan.mp4`, em `AminosanStory.tsx`.
- `/produtos/placeholder-produto.png`, fallback do `ProductPage`.

**Código sem uso:**
- `src/features/home/components/HomeMarquee.tsx`: não é importado.
- `HomeCalculator.tsx` e `CultureCalculator.tsx`: desligados. Com a calculadora fora do painel, decidir se ficam guardados ou saem.
- **Namespaces órfãos em `messages/*.json`:** `culturesGrid`, `numbers`, `video`, `testimonials`, `ctaFinal` e `homeResults`, nos 3 idiomas.
- **Dependência `framer-motion`:** instalada, sem nenhum import, e contra o ADR-021. Pode sair do `package.json`.
- **Rotas GraphQL** do Payload (`src/app/(payload)/api/graphql*`): contra o ADR-003.

**Arquivos soltos e restos de template na raiz:**
- `.tmp-probe.mjs` e `.tmp-idle2.mjs`: testes rápidos, **versionados no git**.
- `dev.err.log`, `dev.out.log` e `test-results/`: ignorados pelo git, podem ser apagados.
- `conhecimento-juma-agro/`: pasta vazia.
- `docker-compose.yml` (configura Mongo) e `Dockerfile` (exige `output: 'standalone'`, que não está configurado): não refletem a stack. Apagar ou refazer.
- `.env.example`: mostra string MongoDB.
- `README.md`: aponta para pastas antigas.
- `tests/`: são do template Payload e estão quebrados ("Payload Blank Template").
- `playwright.config.ts`: usa `pnpm dev`, mas o projeto usa npm.
- `folhetos-pdf-culturas/` (83 MB, 8 PDFs **versionados no git**): nenhuma página usa, e Downloads saiu do painel. Sugestão: mover para `docs/06-materiais/` fora do git (ou para um drive) e manter só como fonte de copy.

### 11.2 Site EUA (`projeto-juma-eua/`)

**Arquivos em `web/public/` sem referência, cerca de 23 MB:**

| Arquivo(s) | Tamanho | Observação |
|---|---|---|
| `video/aminosan-b/hero/` (tall 108 `.webp` + wide 131 `.avif`) | 11 MB | Sequência de quadros que nenhum componente carrega. |
| `img/kmep/soil-transition-2k.png` e `soil-transition-mobile.png` | 5,8 MB | O código usa as versões `.webp`. |
| `img/aminosan-b/compare/{leaf,plant,roots}-cutout.png` | 5,0 MB | Recortes que não entraram. |
| `img/kmep/cigarrinha-do-milho.png` | 0,75 MB | Imagem de praga. Além de sem uso, é sensível para FIFRA. |
| `img/proof-treated.jpg` e `img/proof-untreated.jpg` | 0,7 MB | Substituídas por `soybean-*-desktop/mobile.webp`. |
| `img/{connector-1,connector-2,globe,icon-arrow,logo-juma,orbit,products-gradient}.svg` | < 30 KB | Restos do protótipo. |

**LP antiga `/aminosan-b`,** caso seja aposentada (D12):
- `src/components/aminosan/` (11 componentes);
- `src/content/aminosan.ts`;
- `public/videos/` (4 MP4, 20 MB);
- a maior parte de `public/img/aminosan/` (6,4 MB; `trial-strip-soy-v2` é usada pela LP nova e fica).
- Libera cerca de **26 MB** e remove a página com placeholders `[P3]`, `[P4]` e `[P9]` visíveis.

**Código sem uso:**
- `src/components/aminosan-b/Origin.tsx` (653 linhas): não montado. Única razão da dependência `lil-gui`. `src/lib/origin/` é usado em parte por `lib/scan/stipple.ts` e precisa de revisão antes de sair.
- `src/components/kmep/Economics.tsx` (344 linhas): retirado porque o cliente não publica preço.
- **Conteúdo sem leitor em `src/content/`:**
  - `kmep.economics`, `kmep.proofBand`, `kmep.hero.cta` e `hero.secondary`;
  - `blackout*.chapters[].image/alt`;
  - `aminosanB.origin`, `aminosanB.meet.{intro,cta,pauseVideo,playVideo}` e `aminosanB.final.{fields,call,submit,sending,privacy}`;
  - `home.usOperation.form.crop.options`.
- **Espelho em português,** a remover no lançamento:
  - `src/content/pt/*`;
  - seletor de idioma (`languages` em `content/index.ts`);
  - `LocaleProvider` com leitura de cookie;
  - `getContent()` por cookie.
  - O site passa a ser só `en`.
- **13 TODOs e 20 marcadores `[P..]`** em `src/`. Os da LP antiga aparecem na tela.

**Pastas da raiz:**
- `site/` (2 MB): protótipo HTML antigo. Útil só como referência de copy, então pode ir para `docs/`.
- `output/imagegen/` (13 MB, 18 arquivos): saídas de geração de imagem. Arquivar fora do repositório.
- `skills-lock.json`: trava de skills do Higgsfield, sem relação com o site.
- `docs/assets/`: manter; são fontes (vídeo do frasco, ficha BR e folheto US do KMEP).

### 11.3 Faxina proposta
Tudo reversível pelo git.

> **Status em 28/09/2026: etapas 1 e 2 executadas, ainda sem commit. Builds dos dois sites passando.**
> - Arquivos apagados com `git rm`: 34 no BR e 255 no EUA.
> - `framer-motion` desinstalado.
> - Rotas GraphQL removidas, com `graphQL.disable` no `payload.config.ts`.
> - Apagados `.tmp-*.mjs`, os logs de dev e a pasta vazia.
> - Referências quebradas corrigidas:
>   - capas `.webp` das matérias;
>   - vídeo da `SimpleVersion` apontando para `full-transition-aminosan.mp4`;
>   - fallback de produto com o logo.
> - **Pendentes:** `Origin.tsx` + `lil-gui` (precisam revisar `lib/origin` usado por `stipple.ts`) e as etapas 3 e 4.
>
> **Etapas 3 e 4 executadas em 28/09/2026 (decisão da Oceon), ainda sem commit:**
> - **LP antiga `/aminosan-b` aposentada:**
>   - removidos a rota, `components/aminosan/`, `content/aminosan.ts` (EN e PT), `public/videos/` e 55 imagens de `img/aminosan/`;
>   - removidas cerca de 60 regras CSS mortas;
>   - `/aminosan-b` passa a redirecionar (308) para `/aminosan`.
> - **Mais cerca de 30 imagens sem referência** removidas do EUA (sobras das cenas). `web/public` caiu de 113 MB para cerca de 57 MB.
> - **`Economics.tsx` removido,** junto com `kmep.economics` (EN e PT), a imagem e o CSS do slider.
> - **Calculadoras BR removidas:**
>   - componentes, coleção `CalculatorData`, `calcProducts` e chaves de tradução (ADR-022);
>   - pendência #2 cancelada.
> - **Folhetos PDF:** `folhetos-pdf-culturas/` removida (83 MB).
> - **Template BR:**
>   - removidos `Dockerfile`, `docker-compose.yml` (Mongo) e `.yarnrc`;
>   - `.env.example` corrigido para Neon;
>   - README reescrito;
>   - teste e2e do front refeito;
>   - Playwright com `npm run dev`.
> - **Espelho PT do EUA:** mantido por decisão; sai depois.

1. **Sem risco** (duplicatas e sem referência):
   - apagar os arquivos das tabelas 11.1 e 11.2;
   - remover `framer-motion` e `lil-gui` (este depois de `Origin.tsx`);
   - remover as rotas GraphQL;
   - apagar `.tmp-*` e a pasta vazia.
2. **Corrigir referências quebradas no BR:**
   - trocar `.png` por `.webp` nas matérias;
   - resolver `morph-aminosan.mp4`;
   - resolver o placeholder de produto.
3. **Com decisão:**
   - aposentar `/aminosan-b` (D12);
   - destino dos folhetos PDF;
   - calculadoras BR;
   - `Economics.tsx`;
   - espelho PT do EUA, no lançamento.
4. **Template:** refazer README, `.env.example`, Docker e testes, ou apagar.

---

## Verificação (quando for implementado)
- **Leads:** um envio de teste em cada site aparece no painel com site, página, UTM e geo corretos. Um envio duplicado é agrupado. Spam com honeypot é rejeitado.
- **Publicação:** editar e publicar um produto BR muda `/produtos/[slug]` nos 3 idiomas em menos de 1 minuto, sem deploy.
- **Permissões:** o Comercial EUA não vê leads BR nem edita conteúdo.
- **Seed:** screenshots Playwright das páginas antes e depois da troca não mostram diferença de conteúdo.
- **Faxina:** `npm run build` limpo nos dois sites. Uma navegação completa sem 404 de mídia no console. Lighthouse ≥ 90 mantido.
