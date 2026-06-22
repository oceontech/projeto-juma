# Registro de Decisões (ADRs) — Site Juma Agro

> Formato curto: contexto → decisão → consequência. Decisões da v2.3 mantidas + novas da revisão v3.0 (junho 2026).

## ADR-001 — App único com Payload integrado ao Next.js
**Contexto:** v1.0 previa monorepo e CMS em servidor separado. **Decisão:** um único app Next.js com Payload 3.x no mesmo processo e deploy (Vercel). **Consequência:** menos infra, menos custo, deploy único; escala suficiente para o porte do projeto.

## ADR-002 — Cloudinary para mídia
**Decisão:** todo upload do CMS vai ao Cloudinary (WebP/AVIF automático, resize, CDN). **Consequência:** payload do Postgres leve; dependência de serviço externo aceitável (free tier 25GB).

## ADR-003 — REST + Server Actions, sem GraphQL
**Decisão:** remover GraphQL do escopo. **Consequência:** menos superfície de API, menos complexidade; Payload já expõe REST nativo.

## ADR-004 — Calculadora client-side com dados do CMS
**Decisão:** cálculo no cliente, dados (produto × cultura × ganho) fetchados no build via CMS. **Consequência:** interatividade instantânea, zero custo de função por uso; atualização de dados via ISR.

## ADR-005 — Captura de lead exclusivamente via pop-up do WhatsApp
**Decisão:** nenhum formulário tradicional; o pop-up intercepta o clique no WhatsApp, salva o lead e redireciona. **Consequência:** um único funil mensurável; dedup por email/telefone; mensagem contextual por página.

## ADR-006 — Postgres no Neon (via Vercel Marketplace)
**Contexto:** o banco guarda tudo do Payload. Só precisamos de Postgres (auth é do Payload, mídia é do Cloudinary). **Decisão (20/06/2026):** usar Neon, adicionado pelo Marketplace da Vercel, que injeta as variáveis de conexão automaticamente (pooler para o app serverless, direta para as migrações). Free tier para começar; o site é quase todo SSG/ISR, então o banco quase não é tocado pelo visitante e o auto-suspend do Neon (acorda sozinho no próximo acesso) não pesa. Subir para o plano pago se o tráfego pedir. **Consequência:** integração e variáveis mais simples na Vercel; sem pausa manual como no free do Supabase; pequeno cold start na primeira consulta após ocioso, irrelevante pelo desenho estático. Substitui a opção Supabase considerada antes.

## ADR-007 — Pop-up de lead com 3 campos (não os 6 do briefing)
**Contexto (v3.0):** o briefing pedia nome, cultura, região, produto de interesse, WhatsApp e e-mail. **Decisão (Oceon, jun/2026):** manter apenas **nome, e-mail e telefone** para não gerar barreira; cultura e produto de interesse são inferidos automaticamente do contexto da página (campo `contexto` do lead). Região fica de fora da v1. **Explicar o racional ao cliente (fricção × volume de leads) na apresentação.** **Consequência:** mais conversão; menos dados declarados por lead — se o comercial sentir falta, adicionar campo progressivo depois.

## ADR-008 — Showcase autoral do design system no lugar do Storybook
**Contexto (v3.0):** Storybook apareceu na v2.3 como seção vazia; ferramenta pesada para o tamanho do time. **Decisão:** rota interna `/design` (noindex) construída com os componentes reais do repo — paleta, tipografia, estados de componentes, grid — com layout autoral, bonito e simplificado. **Consequência:** zero infraestrutura extra, documentação viva que nunca dessincroniza do código e vitrine da Oceon para o cliente.

## ADR-009 — Seletor de idioma em texto (PT | EN | ES), sem bandeiras
**Contexto (v3.0):** bandeiras para idiomas é anti-pattern (Espanha ≠ América hispânica, EUA ≠ inglês global). **Decisão:** seletor textual na navbar. **Consequência:** UX neutra e mais elegante; menos assets.

## ADR-010 — Next.js 16 e geolocalização via @vercel/functions
**Contexto (v3.0):** v2.3 especificava Next.js 14 e `request.geo` (removido no Next 15). **Decisão:** iniciar no Next.js 16 (versão atual) e ler país via `geolocation()` de `@vercel/functions` ou header `x-vercel-ip-country`. **Consequência:** sem dívida de upgrade no dia 1; INP substitui FID nas metas de Web Vitals.

## ADR-011 — Gate de validação do efeito de água (jornada fase a fase)
**Contexto (v3.0):** abordagem html2canvas → textura → shader é frágil (fontes, CSS moderno, recaptura por idioma). **Decisão:** prototipar isoladamente na Fase 0 antes de o design prometer o efeito; plano B definido (shader só na camada de fundo, texto HTML real por cima). Confirmado pelo cliente em 20/06/2026: prototipar antes de decidir. **Consequência:** risco contido; decisão A/B baseada em evidência, não em aposta.

## ADR-012 — Hero da home é declaração de marca, não a jornada animada
**Contexto (20/06/2026):** o cliente trouxe referência visual (Montserrat Black gigante, foto full-bleed, palavra em verde) e quer "Juntos alimentamos o mundo" no topo. **Decisão:** o hero passa a ser uma declaração estática de alto impacto (H1 "Juntos alimentamos o mundo" + subtítulo claro do que a empresa faz). A jornada animada campo/folha/solo/água (antiga PRD 8.6) vira o **segundo ato** no scroll, onde mora a Big Idea "fase a fase". **Consequência:** primeiro paint leve (foto + texto), bom para LCP; WebGL sai do hero. Atualiza a especificação do hero no PRD 8.6. Atenção: o texto de apoio da imagem de referência é clichê e foi descartado; só a estética foi aproveitada.

## ADR-013 — Bloco Herança com as duas fotos do cliente
**Contexto (20/06/2026):** o cliente tem foto do fundador com os dois filhos e foto do primeiro frasco do Aminosan (peça antiga em caixa de acrílico). **Decisão:** as duas dividem um bloco cinematográfico na home (frasco antigo como relíquia → frasco atual → foto da família), que também é o destaque do Aminosan. As mesmas fotos reaparecem na página Sobre (papel biográfico lá, emocional na home). **Consequência:** maior ativo de confiança da marca concentrado num momento; aproveita o investimento das fotos em dois lugares.

## ADR-014 — Scroll horizontal de produtos por linha, com fallback mobile
**Contexto (20/06/2026):** o cliente quer scroll horizontal na apresentação dos produtos. **Decisão:** pin horizontal do GSAP ScrollTrigger no desktop, organizado pelas **5 linhas** (não os 13 produtos soltos); no mobile, carrossel de arrastar ou empilhamento vertical. **Consequência:** efeito premiado sem sequestrar o scroll; metade do tráfego (mobile) tratada à parte.

## ADR-015 — Esforço de animação alocado por seção
**Contexto (20/06/2026):** site mira nível Awwwards, mas com metas de Core Web Vitals e orçamento de tempo. Cliente escolheu "decidir por seção". **Decisão:** esforço pesado no hero, na jornada fase a fase e no bloco Herança; médio no scroll horizontal; leve em culturas, números, experience, depoimentos e footer. **Consequência:** investimento concentrado onde o retorno visual é maior; resto sóbrio e barato. Detalhe em `docs/05-design-direction/01-home-e-animacao.md`.

## ADR-018 — Painel admin adota a linguagem visual do Media Hub by Ocean
**Contexto (20/06/2026):** o cliente (Oceon) quer que o painel da Juma use a estética do Media Hub, produto da própria agência: workspace claro arejado + sidebar escura flutuante, glassmorphism, soft shadows, Geist, tokens de status (âmbar/verde/vermelho/azul). **Decisão:** adotar essa linguagem como base do painel, aplicada via tema e componentes customizados do Payload (custom.scss com as variáveis, Nav custom para a sidebar flutuante com a estrutura multi-projeto, logo, view de Dashboard, login). **Consequência:** o painel ganha a cara da Oceon nos pontos de personalidade (sidebar, dashboard, login, branding); as telas internas de CRUD ficam restilizadas, não recriadas (estrutura de tabela/form do Payload permanece). Estimativa ~85% da linguagem. Trabalho de Fase 3; fundação do tema pode vir antes. Tokens e plano em `docs/05-design-direction/05-painel-admin.md`.

## ADR-017 — Sem e-mail transacional nesta versão (Resend fora do escopo)
**Contexto (20/06/2026):** o plano previa o Resend para avisar a Debora por e-mail a cada lead. **Decisão (cliente):** remover o Resend desta versão. Os leads ficam registrados na aba Leads do painel (Payload), e a conversa segue pelo WhatsApp logo após o pop-up. O aviso por e-mail entra numa atualização futura, se fizer falta. **Consequência:** uma conta e uma integração a menos; sem dependência de verificação de domínio de envio (que dependia do DNS, ainda pendente). A Debora acompanha os leads pelo painel (a aba Visão geral mostra o total do mês). Os Payload Tasks (jobs nativos) seguem disponíveis caso a notificação volte ao escopo.

## ADR-016 — Topo da home como filme contínuo (jornada + herança + morph → produtos)
**Contexto (20/06/2026):** o cliente propôs costurar a jornada agronômica e a herança num único scroll contínuo, usando a gota como ponte para a origem da empresa, terminando numa transição em vídeo do frasco antigo para o atual que desemboca no scroll horizontal de produtos. **Decisão:** adotado. O topo da home (hero, jornada, herança, morph) vira uma sequência contínua de 8 quadros; o bloco Herança deixa de ser separado e passa a viver dentro da jornada; o argumento racional (como funciona, números) reflui para depois do scroll de produtos. **Consequências:** (1) o morph dos frascos usa frames de vídeo (baixo risco), e só a gota com fundo ondulado fica no gate do ADR-011; (2) montar os textos da herança sobre fundo ondulado empurra o efeito de água para o plano B mais seguro; (3) sequência longa exige versão mobile mais curta, skip via nav/CTA e `prefers-reduced-motion` estático; (4) todo texto fica no DOM por SEO/acessibilidade. Detalhe e copy em `docs/05-design-direction/01-home-e-animacao.md` e `docs/04-copy/01-home.md`.
