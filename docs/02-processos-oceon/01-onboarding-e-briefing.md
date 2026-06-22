# Processo 01 — Onboarding & Briefing

**Objetivo:** transformar um cliente fechado em um projeto com informações completas, contatos definidos e expectativas alinhadas.

## Gatilho
Contrato assinado / projeto confirmado.

## Passos

1. **Reunião de kickoff** — apresentar o processo Oceon, prazos macro e o documento de briefing
2. **Enviar o briefing padrão** (template Oceon) com seções: identidade visual, produtos/serviços (bloco duplicável), dados para funcionalidades específicas (ex.: calculadora), programas/diferenciais, contato e conversão, materiais visuais, acessos técnicos, responsável pela aprovação
3. **Definir o aprovador único** — nome, cargo, WhatsApp, e-mail (regra inegociável)
4. **Receber e auditar o briefing** — conferir campo a campo; marcar o que veio vazio, inconsistente ou "anexado" sem anexo real
5. **Devolver lista de pendências** ao cliente com impacto de cada item (o que bloqueia o quê)
6. **Registrar tudo** em `docs/00-contexto/` do projeto

## Entregáveis
- Briefing preenchido e auditado (markdown no repositório de docs)
- Lista de pendências com impacto e responsável
- Mapa de stakeholders e canais

## Gate de saída
- [ ] Aprovador único definido e ciente do papel
- [ ] Briefing auditado, pendências comunicadas por escrito
- [ ] Acessos técnicos solicitados por canal seguro (nunca por e-mail aberto)

## Lições do projeto Juma
- Validar cores por **RGB/CMYK além do HEX** — o HEX veio com typo ("#004Bc26"), o RGB revelou o valor real (#004C26)
- Campo "anexado" no briefing não significa recebido — conferir a chegada real dos arquivos
- Dados obrigatórios de funcionalidades (tabela da calculadora) merecem destaque vermelho no template: sem eles a feature não existe
