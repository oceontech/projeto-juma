# Copy — Contato, Pop-up de Lead e Microcopy Global

> Revisado na passada de humanidade (jun/2026).

---

## [PÁGINA CONTATO — /contato]

**[HERO]**
> **Fale direto com o time técnico.**
> Sem fila de atendimento e sem robô. Quem responde entende de lavoura.

**[CANAIS]**
- **WhatsApp**, o caminho mais rápido: `Chamar no WhatsApp` *(abre o pop-up padrão)*
- **E-mail:** marketing@juma-agro.com.br
- **Telefone:** (19) 3891-6415
- **Horário:** segunda a quinta, das 7h30 às 17h15; sexta, das 7h30 às 16h

**[ENDEREÇO]**
Juma Agro Indústria e Comércio Ltda
R. Victor Acierini, 2.370, Distrito Industrial, Mogi Guaçu - SP, CEP 13.849-106

**[EUA]**
Juma-Agro Fertilizer LLC, 3928 Anchuca Drive, Suite 11, Lakeland, FL 33811

**[SEO]** Meta title: *Contato Juma Agro: WhatsApp direto com o time técnico* · Meta description: *Converse com o time técnico da Juma Agro sobre o programa da sua cultura. Mogi Guaçu - SP. Atendimento em horário comercial.*

---

## [POP-UP DE LEAD — WhatsApp]

> Aparece ao clicar em qualquer CTA de WhatsApp. Três campos (ADR-007). Tom: rápido, sem burocracia.

**Título:** **Antes de abrir a conversa, como podemos te chamar?**
**Apoio:** Seus dados vão para o nosso time de atendimento, e só para ele.

| Campo | Label | Placeholder |
|---|---|---|
| Nome | Seu nome | |
| E-mail | Seu e-mail | nome@exemplo.com.br |
| Telefone | Seu WhatsApp | (DDD) 99999-9999 |

**Botão:** `Abrir conversa no WhatsApp`
**Linha de apoio:** *Leva dez segundos e a conversa já começa.*

**Retorno (cookie):** usuário já cadastrado vai direto, sem pop-up.
**Erro de validação:** *Confere esse campo? Assim garantimos o retorno.*

**Mensagens pré-preenchidas do WhatsApp:**
- Padrão: `Olá! Vim pelo site e quero saber mais sobre os produtos Juma.`
- Produto: `Olá! Vim pelo site e quero saber mais sobre o {produto}.`
- Cultura: `Olá! Vim pelo site e quero um programa para {cultura}.`
- Calculadora: `Olá! Simulei {produto} em {cultura} na calculadora e quero saber mais.`
- Juma Experience: `Olá! Quero agendar uma visita pela Juma Experience.`

---

## [NAVEGAÇÃO — navbar]

Início · Produtos · Culturas · Calculadora · Juma Experience · Sobre · Matérias · Contato · **Vagas ↗** *(externo)*
Seletor de idioma: **PT | EN | ES** *(texto, sem bandeiras, ADR-009)*

---

## [FOOTER]

**Coluna marca:** logo, a frase *Juntos, alimentamos o mundo* e as redes sociais
**Coluna navegação:** links do menu
**Coluna contato:** WhatsApp, e-mail, telefone, horário e os endereços do Brasil e dos EUA
**Linha legal:** © {ano} Juma Agro Indústria e Comércio Ltda · Política de Privacidade

---

## [BANNER LGPD]

> Usamos apenas cookies funcionais: o do idioma e o do seu cadastro de contato. Nosso analytics não rastreia visitantes.
> `Entendi` · `Saber mais` *(link para a política)*

---

## [BLOG / MATÉRIAS — /materias]

**[HERO da listagem]**
> **Conteúdo técnico do nosso time.**
> Resultados de ensaio, manejo por cultura e tecnologia de aplicação, escritos por quem acompanha lavoura.

**[Card de matéria]** categoria, título, resumo de uma linha, data
**[Estado vazio]** *As primeiras matérias estão a caminho. Enquanto isso, os programas por cultura já estão no ar.* `Ver culturas`

---

## [PÁGINA 404]

> **Página não encontrada.**
> O endereço pode ter mudado quando o site foi renovado. Os caminhos mais procurados:
> `Ver produtos` · `Ver culturas` · `Falar com a Juma`

---

## [MENSAGENS DE SISTEMA]

- **Lead salvo (pré-redirect):** *Pronto, {nome}. Abrindo seu WhatsApp.*
- **Erro de envio:** *Falhou do nosso lado. Tente de novo ou chame direto: (19) 99964-8186.*
- (Aviso por e-mail de lead fora do escopo nesta versão; o lead aparece na aba Leads do painel.)

---

## Notas de implementação

1. O pop-up não usa a palavra "cadastro". O enquadramento é abrir a conversa.
2. As mensagens contextuais do WhatsApp dependem do campo `contexto` do lead, preenchido na origem do clique.
3. Monitorar 404 no Search Console após a migração: volume em URL antiga indica redirect faltando (conferir no inventário).
4. Banner LGPD com botão único `Entendi`, coerente com a política real: nada muda com aceite ou recusa.
