# Copy — Calculadora de Produtividade (/calculadora)

> A página onde o programa vira número de fazenda. Revisada na passada de humanidade.
> Dependência: tabela produto × cultura × ganho ainda não entregue pelo cliente (pendência #2).

---

## [HERO]

**Variação A (recomendada):**
> **Veja o que o ganho dos ensaios representa na sua área.**
> Escolha a cultura e o produto, informe seus hectares e o preço da saca. A calculadora mostra a estimativa em sacas e em reais.

*Ângulo: descreve a ferramenta com exatidão. A utilidade é o apelo.*

**Variação B:**
> **O ensaio mediu o ganho por hectare. A sua área faz o resto da conta.**
> Estimativa em sacas e em reais, com a fonte de cada número à vista.

*Ângulo: liga o número do ensaio ao tamanho da fazenda do leitor.*

---

## [FORMULÁRIO — labels e microcopy]

| Campo | Label | Placeholder / apoio |
|---|---|---|
| Cultura | Qual é a sua cultura? | Selecione |
| Produto | Qual produto quer simular? | Mostramos só os indicados para a cultura escolhida |
| Área | Área de plantio (ha) | Ex.: 250 |
| Preço | Preço da saca (R$) | Ex.: 130,00. Use o valor da sua região |
| Produtividade | Sua produtividade atual (sc/ha) | Ex.: 60 |

**Botão:** `Calcular meu ganho`

---

## [RESULTADO]

> **Com {produto} em {cultura}, sua área de {X} ha pode render:**
>
> **+{sacas_extras} sacas** por safra
> **cerca de R$ {receita_extra}** a mais na colheita
>
> *Base: ganho médio de {ganho_medio} sc/ha registrado em {fonte_do_ensaio}. O resultado em campo varia com clima, solo e manejo. Quem confirma o número da sua fazenda é a colheita.*

**[CTA pós-resultado]** `Quero esse resultado na minha lavoura`
*Um especialista monta o programa completo da sua cultura. Resposta em horário comercial, sem compromisso.*

---

## [COMO CALCULAMOS]

**De onde vêm os números**

Cada ganho médio usado aqui sai de ensaio de campo comparado com testemunha, com a fonte identificada: DETEC, Rehagro, NITEC/UNESP, JP Agrícola e pesquisas internas da Juma. A conta é simples e está à vista:

`sacas extras = ganho médio do ensaio × sua área`
`receita extra = sacas extras × seu preço de saca`

A calculadora entrega uma estimativa para orientar a decisão, e a ressalva vale sempre: ensaio é referência, não garantia.

---

## [ESTADOS VAZIOS E ERROS — microcopy]

- Sem cultura selecionada: *Escolha a cultura para ver os produtos indicados.*
- Campo numérico vazio: *Falta esse número para fechar a conta.*
- Valor inválido: *Confira o valor. Aqui vão só números.*

---

## [SEO]

- **Meta title:** Calculadora de produtividade Juma Agro: estimativa em sacas e em reais
- **Meta description:** Aplique o ganho médio dos ensaios de campo à sua área e ao seu preço de saca. Estimativa gratuita, com a fonte de cada número.

## Notas de implementação

1. A ressalva de variabilidade fica junto do resultado, no mesmo bloco visual. É parte do argumento de credibilidade.
2. Resultado em destaque máximo (Montserrat Black): sacas primeiro, reais logo abaixo.
3. O CTA pós-resultado herda cultura e produto simulados no campo `contexto` do lead.
4. Evento Umami a cada cálculo concluído, com cultura e produto. Vira inteligência comercial para o time da Juma.
