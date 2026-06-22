# Processo 05 — QA & Lançamento

**Objetivo:** colocar o site em produção sem perder SEO, sem regressões e com monitoramento ativo desde o minuto zero.

## Gatilho
Todas as fases de desenvolvimento aceitas pelo cliente.

## Checklist de QA (pré-go-live)

### Funcional
- [ ] Todas as rotas do sitemap renderizam (desktop + mobile)
- [ ] Fluxo de lead completo: pop-up → gravação no CMS → email à pessoa certa → redirect WhatsApp com mensagem contextual
- [ ] Dedup de leads funcionando · CMS: CRUD de todas as collections
- [ ] i18n: detecção por país, seletor manual, conteúdo por locale, hreflang
- [ ] Formulários com validação e estados de erro

### Performance & SEO
- [ ] Lighthouse ≥ 90 em home, produto, cultura (mobile)
- [ ] Web Vitals: LCP < 2.5s · INP < 200ms · CLS < 0.1
- [ ] sitemap.xml (3 idiomas) + robots.txt + canônicas + JSON-LD validado
- [ ] OG Images por página e por idioma

### Migração (crítico)
- [ ] **Mapa de redirects 301 implementado e testado URL por URL** (script contra a lista do inventário)
- [ ] http→https e domínio secundário (.com) com 301
- [ ] Google Search Console configurado, sitemap submetido

### Segurança & conformidade
- [ ] Headers de segurança (CSP, HSTS) · painel CMS inacessível sem auth
- [ ] LGPD: banner ativo, cookies só funcionais
- [ ] Acessos e secrets em vault — nada em texto plano no repo

## Go-live

1. Janela combinada com o cliente (evitar sexta-feira)
2. DNS no Registro.br → Vercel · SSL validado
3. Smoke test pós-DNS (rotas críticas + fluxo de lead real)
4. Monitorar Sentry e Umami nas primeiras 48h
5. Rodar verificação de 404 no Search Console após 7 dias

## Gate de saída
- [ ] Checklist 100% · zero erro crítico no Sentry em 48h
- [ ] Cliente comunicado do go-live com relatório curto (o que subiu, o que monitorar)

## Lições do projeto Juma
- O mapa de redirects nasce no **discovery** (inventário do legado), não na véspera — a raspagem completa do site antigo é o insumo
- Hospedagens antigas instáveis (Hostgator) podem dificultar validação tardia do conteúdo legado: raspar TUDO no início garante o acervo
