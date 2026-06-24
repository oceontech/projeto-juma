# Conteúdo das Páginas — Matéria-Prima Factual

> Este documento traz o conteúdo factual de cada página: textos de referência, dados de produto, números com fonte, manejo por cultura, contatos. **Não é copy final pronta para publicar** (exceto o Hero da home, já aprovado) — é a matéria-prima a partir da qual a copy deve ser reescrita seguindo a arquitetura narrativa de `PRD.md` seção 7 e as regras de `fundamentos-narrativos.md`. Números, nomes de produto, fontes de ensaio e dados de contato aqui **não podem ser alterados**; frases de abertura, transições e tom **devem** ser revisados antes de publicar.

Navbar: Início · Produtos · Culturas · Calculadora · Juma Experience · Sobre · Matérias · Contato · Vagas ↗ (link externo). Logo à esquerda. Pílula flutuante com leve vidro fosco (glassmorphism sutil), encolhe no scroll.

---

## 1) HOME — o filme contínuo

**Hero — declaração** (copy já aprovada, não reescrever). Foto de campo full-bleed, leve movimento. Título gigante em caixa alta: **"JUNTOS ALIMENTAMOS O MUNDO."** com "MUNDO" na cor de destaque. Subtítulo: *"Nutrição que constrói produtividade fase a fase na soja, no milho, no café, na cana e em mais seis culturas. Com resultado medido em ensaio de campo."* Botão: **"Quero esse resultado na minha lavoura"** + linha de apoio *"Quem responde é o time técnico, em horário comercial. Sem compromisso."*

**Faixa de prova social** (logo abaixo do hero): números de ensaio, cada um clicável, levando à página do produto correspondente: **+6,87 t/ha** em cana (Acorda Cana) · **+13,4 sc/ha** em milho (Acorda Ultra) · **+14 sc/ha** em soja (Aminosan, ensaio DETEC) · **74%** de controle de bicho-mineiro no café (KMEP Ultra, Rehagro). Números em destaque, com a fonte do ensaio em corpo menor logo abaixo — número e fonte nunca se separam.

**Jornada agronômica + herança (sequência cinematográfica contínua).** Quadros que se sucedem conforme o scroll (mecânica: autoplay travado por `pin`, ver `PRD.md` seção 2.1 — vídeos já produzidos), texto em HTML real sobre o fundo (máx. 2 linhas por quadro):
1. Campo (trator ao entardecer): *"Produtividade se constrói fase a fase. Cada decisão da lavoura, do plantio à colheita, define o que entra no caminhão."*
2. Folha (macro com gota): *"A planta bem nutrida na fase certa aproveita melhor a água, o adubo e o defensivo que você já paga."*
3. Solo (raiz emergindo): *"O arranque decide muito antes da colheita: raiz funda e estande uniforme são o teto da produtividade."*
4. **Água (momento visual mais tecnológico do site, sob avaliação de performance — ver PRD seção 4):** fundo branco com ondulação sutil. Texto: *"Mais de 40 anos ajudando o campo a colher mais. Veja onde tudo começou."*
5. Fundador: foto da família. *"A família que começou a empresa e ainda a conduz."*
6. Frasco antigo do produto histórico (Aminosan): *"O primeiro frasco do Aminosan."*
7. Transição (morph do frasco antigo para o atual): *"Mais de 40 anos depois, o mesmo aminoácido. Hoje, de 10 a 14 sacas a mais por hectare em soja."*
8. Frasco atual em foco, hand-off para o catálogo: *"E hoje, uma linha inteira: treze produtos, do plantio à colheita."* CTA: **"Conhecer o Aminosan"**.

**Problema.** A conta que passa despercebida entre o que a lavoura entrega e o que poderia entregar — estande desuniforme, veranico, florada que aborta, aplicação que o vento carrega. Direção de tom (não copy final): nomear a perda específica, nunca "baixa produtividade" genérica.

**Solução — o programa fase a fase**, em 3 passos: 1. Escolha sua cultura. 2. Veja o programa fase a fase. 3. Converse com o time técnico. CTA: **"Quero o programa da minha cultura"**.

**Linhas de produto — scroll horizontal.** Cinco cards, scroll horizontal no desktop e carrossel de arrastar no mobile. A cor de fundo muda a cada card (ver `cores-por-produto.md`):
- **Para a safra começar na frente** — Arranque inicial: Acorda Ultra, Acorda Cana, Aduban.
- **Para a planta produzir no potencial** — Nutrição e fisiologia: Aminosan, FitoFert, Linha Revigo, RevigoPhos Amino, Revigo Cobre Ultra.
- **Para o inseticida render mais** — Proteção: KMEP Ultra.
- **Para a calda chegar no alvo** — Tecnologia de aplicação: Linha Redutan e Supermix.
- **Programas prontos de milho e pasto** — Manejos integrados: Revigo + Milho e Revigo + Pasto.

**Culturas — grid.** Título: **"SUA CULTURA TEM UM PROGRAMA"**. Grid com foto das 10 culturas: Soja, Milho, Café, Cana, Algodão, Feijão, Citros, Batata, Tomate, Pastagem.

**Números — prova profunda.** Cards com os dados de ensaio (soja, milho, cana, café — ver `briefing.md` seção 2) e a ressalva de que o número varia com clima, solo e manejo.

**Juma Experience — teaser.** *"Visite a Juma por dentro. Fábrica, laboratório e a história contada por quem a construiu."* CTA: **"Conhecer a Juma Experience"**.

**Vídeo.** "A Juma em 2 minutos" — embed com facade (thumbnail, player só no clique, protege LCP/INP). Link de referência em `briefing.md` seção 7.

**Depoimentos.** Três cards (citação curta com resultado, nome, cultura, cidade/UF) — `[DEPOIMENTO REAL — aguardando cliente]` até receber os reais. Nunca inventar.

**CTA final.** Faixa de cor primária: headline + *"Converse com o time técnico, receba o programa fase a fase da sua cultura e compare na colheita."* Botão: **"Quero esse resultado na minha lavoura"**. Esta é a única frase de efeito permitida na home inteira.

**Footer.** Coluna de marca (logo + "Juntos, alimentamos o mundo" + redes sociais), coluna de navegação, coluna de contato (ver `briefing.md` seção 6), linha legal.

---

## 2) PRODUTOS

**Listagem (/produtos).** Hero: headline de posicionamento ("treze produtos, cinco linhas, um critério: resultado medido em ensaio" — direção, não texto final). Filtro por cultura. Grade de cards, cada card na cor do próprio rótulo (ver `cores-por-produto.md`); produtos vizinhos nunca da mesma família de cor.

**Estrutura de cada página de produto:** hero (cor cheia do rótulo + headline de resultado) → **Problema** (a dor, em prosa) → **Mecanismo** (como o produto atua) → culturas atendidas (badges) → **Benefícios** → **Modo de uso** → **Resultados com dados de campo** (número grande colado à fonte do ensaio) → galeria → CTA WhatsApp → produtos relacionados. Nas seções de leitura, a cor do produto entra diluída a 8–10% sobre branco. A troca de produto faz transição suave de cor.

**Conteúdo completo dos 13 produtos** (headline, mecanismo, culturas, benefícios, modo de uso, resultado com fonte): ver `briefing.md` seção 2 para o resumo tabular; o detalhamento por produto (parágrafos de problema/mecanismo/benefícios) precisa ser obtido do material de briefing original do cliente antes da redação final de cada página — não inventar esse conteúdo qualitativo, só os dados numéricos e nomes estão fixados.

CTA padrão das páginas de produto: **"Quero esse resultado na minha lavoura"** + linha de redução de ansiedade (ver `fundamentos-narrativos.md`).

---

## 3) CULTURAS

**Listagem (/culturas).** Hero: headline sobre cada cultura decidir a safra em fases diferentes + apoio convidando a escolher a cultura e ver o programa completo. Grid com foto das 10 culturas.

**Estrutura de cada página de cultura:** hero com foto → o problema da cultura em prosa → **tabela de manejo fase a fase** (linha do tempo horizontal por fase, cada produto linkado) → prova (só onde há ensaio) → bloco de fechamento padrão (calculadora + WhatsApp).

**Manejo fase a fase por cultura (10):**

- **SOJA** — Plantio/emergência (V0–V3): Acorda Ultra + Aminosan · Vegetativo (V4+): Aminosan + FitoFert · Pré-florada (R1–R2): RevigoPhos + Aminosan · Vagens (R3–R5): FitoFert + Aminosan · Enchimento (R5–R6): Revigo Nitrogênio Plus + FitoFert · Todas as fases: Redutan + Supermix. Prova: Acorda Ultra +5,8 sc/ha, Aminosan +10 a +14 (DETEC, Terras Gerais), FitoFert +4,6 (JP Agrícola).

- **MILHO** — Plantio (V0–V2): Acorda Ultra + Aminosan · Vegetativa (V3–V6): Aminosan + FitoFert · Desenvolvimento (V6–V8): Revigo Nitrogênio Plus + Aminosan · Pré-pendoamento: RevigoPhos + FitoFert · Enchimento: FitoFert + RevigoPhos · Todas: Redutan. Prova: Acorda Ultra +13,4 sc/ha, KMEP Ultra +9,33 (Rehagro); programa Revigo + Milho.

- **CAFÉ** — Pré-florada: FitoFert + Aminosan · Pós-florada: Aminosan + Revigo CaB · Chumbinho: Revigo + Revigo Zn-Plus + Aminosan · Granação: Revigo Nitrogênio Plus + RevigoPhos Amino + FitoFert · Maturação: RevigoPhos Amino + Aminosan + Revigo K. Prova: KMEP Ultra até 74% de controle de bicho-mineiro (Rehagro); Aduban.

- **CANA-DE-AÇÚCAR** — Plantio/brotação: Acorda Cana + Aminosan · Perfilhamento: Aminosan + Revigo Nitrogênio Plus · Crescimento intenso: Revigo Nitrogênio Plus + FitoFert · Todas: Redutan. Prova: Acorda Cana +6,87 t/ha de colmos.

- **ALGODÃO** — Plantio (V0–V3): Acorda Ultra + Aminosan · Desenvolvimento (V4+): Aminosan + FitoFert + Revigo · Reprodutivo (R1+): FitoFert + Aminosan + KMEP Ultra · Todas: Redutan + Supermix.

- **FEIJÃO** — Plantio (V0–V2): Acorda Ultra + Aminosan · Vegetativa (V3–V4): Aminosan + FitoFert · Florescimento (R5–R6): Aminosan + RevigoPhos · Vagens (R7–R8): FitoFert + Revigo Nitrogênio Plus · Enchimento: RevigoPhos + FitoFert · Todas: Redutan.

- **CITROS** — Vegetativo: Aminosan + FitoFert · Pré-florada/florada: Aminosan + RevigoPhos · Frutificação/fixação: FitoFert + Aminosan · Enchimento: RevigoPhos + FitoFert · Todas: Redutan.

- **BATATA** — Plantio/arranque: Acorda Ultra + Aminosan · Vegetativo: Aminosan + FitoFert + Revigo · Tuberização/enchimento: FitoFert + Aminosan + RevigoPhos · Todas: Redutan + Supermix.

- **TOMATE** — Pós-transplante: Acorda Ultra + Aminosan · Vegetativo: Aminosan + Aduban · Pré-florada/florescimento: RevigoPhos + Aminosan · Frutificação/enchimento: FitoFert + Revigo Boro-10 · Manutenção: FitoFert + Aminosan · Todas: Redutan + Supermix.

- **PASTAGEM** — Implantação: Acorda Ultra + Aminosan · Desenvolvimento inicial: Aminosan + FitoFert · Crescimento/perfilhamento: Revigo + Pasto + Aminosan · Manutenção/recuperação: Revigo + Pasto + FitoFert · Todas: Redutan. Assinatura aprovada: *"Mais pasto. Mais arroba. Mais resultado."*

**Bloco de fechamento (igual em todas as culturas):** convite para calcular o ganho na área do visitante + CTA secundário "Calcular meu ganho em {cultura}" e CTA primário "Quero o programa para minha {cultura}".

---

## 4) CALCULADORA (/calculadora)

Hero: convite a ver o que o ganho dos ensaios representa na área do visitante.

**Formulário:** Cultura (select) → Produto (filtrado pela cultura escolhida) → Área de plantio em ha → Preço da saca em R$ → Produtividade atual em sc/ha. Botão: **"Calcular meu ganho"**.

**Resultado:** sacas a mais primeiro, reais a mais abaixo, com a ressalva de que o ganho médio vem de um ensaio com fonte citada e que o resultado em campo varia com clima, solo e manejo. CTA pós-resultado: **"Quero esse resultado na minha lavoura"**.

**Fórmula:** `sacas extras = ganho médio do ensaio × área informada` e `receita extra = sacas extras × preço da saca informado`. Fontes possíveis: DETEC, Rehagro, NITEC/UNESP, JP Agrícola, ensaios internos. **A tabela oficial de referência (produto × cultura × dosagem × ganho médio × fonte) precisa ser validada com o cliente antes do go-live** — ver lacuna em `briefing.md` seção 9.

---

## 5) JUMA EXPERIENCE (/juma-experience)

Hero: convite a uma visita da fábrica à conversa com o fundador. **Para quem é:** clientes/produtores, representantes/revendas, parceiros/fornecedores; instituições de ensino mediante agendamento. **Antes (o problema):** a relação padrão com fornecedor se resume a catálogo, pedido, entrega e boleto. **A experiência em 4 passos** (ver `briefing.md` seção 5). **Depois (o resultado):** o visitante volta sabendo de onde vem o que aplica. **CTA final:** tagline aprovada *"Quem vive, entende. Quem entende, produz mais."* + **"Quero agendar minha visita"**.

---

## 6) SOBRE (/sobre)

Abertura/crença: o campo é quem aprova os produtos — todo resultado passou por ensaio comparado com testemunha antes de qualquer rótulo ir para a embalagem. Essa é a regra da casa desde 1988.

**História de origem:** Julio Matino, fim dos anos 80, o problema no metabolismo da planta, o nascimento do produto histórico (Aminosan) e da empresa em 1988, em Mogi Guaçu/SP. Hoje: laboratório próprio, departamento técnico, pesquisa acadêmica (Projeto DESATA), filial nos EUA; o fundador recebe pessoalmente os visitantes da Juma Experience. Usar foto real do fundador.

**Marcos (linha do tempo, 1988 até hoje):** fundação em 1988 · produto histórico com mais de 40 anos · laboratório próprio · parceria acadêmica (Projeto DESATA) · filial nos EUA · ensaios com fonte nomeada (DETEC, Rehagro, NITEC/UNESP, JP Agrícola).

**Propósito:** "Juntos, alimentamos o mundo" — você produz o alimento, a empresa cuida para que cada fase da lavoura renda o que pode render. Ponte para a Juma Experience + CTA final "Falar com um especialista".

---

## 7) MATÉRIAS / BLOG (/materias)

Hero da listagem: convite a conteúdo técnico do time, baseado em resultado de ensaio, manejo por cultura e tecnologia de aplicação. Grid de cards (categoria, título, resumo de uma linha, data). Estado vazio: aviso de que as primeiras matérias estão a caminho + link para as páginas de cultura, que já estão no ar. Conteúdo inicial: criar matérias plausíveis baseadas nos fatos reais do briefing (nunca inventar dado técnico), claramente datadas.

---

## 8) CONTATO (/contato)

Hero: convite a falar direto com o time técnico, sem fila de atendimento e sem robô. Canais, horário e endereços: ver `briefing.md` seção 6. Página informativa, **sem formulário próprio** (a captura é só pelo pop-up do WhatsApp). Incluir um mapa.

---

## Componentes globais

**Pop-up de lead (WhatsApp).** Aparece ao clicar em qualquer CTA de WhatsApp. Convite a dizer como chamar a pessoa antes de abrir a conversa + aviso de que os dados vão só para o time de atendimento. Três campos: nome · e-mail · WhatsApp. Botão: "Abrir conversa no WhatsApp" + nota de que leva poucos segundos. Mensagem de erro de validação: pedir para confirmar o campo, garantindo o retorno.

**Botão flutuante de WhatsApp** persistente no canto da tela. **Banner de cookies** minimalista, não bloqueante, avisando sobre uso de cookies funcionais. **Página 404:** aviso de que o endereço pode ter mudado na renovação do site + atalhos para produtos, culturas e contato.
