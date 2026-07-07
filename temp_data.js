module.exports = {
  aminosan: {
    name: 'Aminosan®',
    tag: 'Nutrição e Fisiologia Vegetal',
    labelColor: '#659357',
    description:
      'Fertilizante foliar à base de aminoácidos livres de origem vegetal. Há mais de 40 anos, referência em performance — atua no metabolismo da planta, dando vigor, raízes mais profundas e tolerância a estresses ambientais.',
    crops: ['Soja', 'Milho', 'Café', 'Algodão', 'Feijão', 'Citros', 'Tomate', 'Batata', 'Cana'],
    problems: [
      { title: 'Baixo desenvolvimento da planta', desc: 'Plantas pequenas, com pouco vigor, raízes superficiais e crescimento desigual no talhão.', icon: 'seed' },
      { title: 'Estresses no ciclo', desc: 'Veranicos, geadas, danos por manejo e clima adverso comprometendo a produção projetada.', icon: 'sun' },
      { title: 'Limitação na absorção', desc: 'Nutrientes aplicados que a planta não consegue absorver com eficiência por baixa atividade metabólica.', icon: 'drop' },
    ],
    benefits: [
      { title: 'Estimula o metabolismo', desc: 'Aminoácidos livres entram diretamente no ciclo, sem gasto energético da planta.' },
      { title: 'Aumenta o vigor vegetativo', desc: 'Folhas mais verdes, ramos mais firmes e plantas mais resistentes a fatores adversos.' },
      { title: 'Favorece raízes, folhas e ramos', desc: 'Desenvolvimento equilibrado da parte aérea e do sistema radicular.' },
      { title: 'Melhora a absorção de nutrientes', desc: 'Atua como complexante e potencializa a eficiência de fertilizantes aplicados na calda.' },
      { title: 'Mais resistência à seca', desc: 'Mantém a fisiologia da planta ativa em períodos de déficit hídrico e calor extremo.' },
      { title: 'Melhor pegamento e fixação', desc: 'Mais flores fixadas e grãos formados — diretamente refletido na produtividade.' },
    ],
    stages: [
      { num: '01', label: 'V1–V3', title: 'Estabelecimento', desc: 'Estimula o desenvolvimento inicial e enraizamento.' },
      { num: '02', label: 'V4–V6', title: 'Crescimento vegetativo', desc: 'Mais vigor e produção de massa foliar.' },
      { num: '03', label: 'Pré-florada', title: 'Pré-reprodutivo', desc: 'Prepara a planta para florescimento uniforme.' },
      { num: '04', label: 'Florada', title: 'Reprodutivo', desc: 'Favorece pegamento e fixação de flores.' },
      { num: '05', label: 'Enchimento', title: 'Granação', desc: 'Sustenta produtividade até a colheita.' },
    ],
    results: [
      { value: '+14', unit: 'sc/ha', desc: 'Soja em Taquarivaí/SP, em ensaio de safra completa com Aminosan no manejo.' },
      { value: '+10', unit: 'sc/ha', desc: 'Soja em Lavras/MG, em parcela testemunha vs Aminosan em pulverização foliar.' },
      { value: '+38', unit: '%', desc: 'Mais resistência à seca, medida pela manutenção da área foliar em déficit hídrico.' },
    ],
    related: [
      { slug: 'fitofert', name: 'Fitofert', tag: 'Nutrição e Fisiologia', desc: 'Mais pegamento, enchimento de grãos e produtividade.', labelColor: '#659357' },
      { slug: 'linha-revigo', name: 'Linha Revigo', tag: 'Nutrição e Fisiologia', desc: 'Foliares para corrigir deficiências em cada cultura.', labelColor: '#302783' },
      { slug: 'revigophos-amino', name: 'RevigoPhos Amino', tag: 'Nutrição e Fisiologia', desc: 'Energia rápida e recuperação após estresses.', labelColor: '#302783' },
    ],
  },
  fitofert: {
    name: 'Fitofert',
    tag: 'Nutrição e Fisiologia Vegetal',
    labelColor: '#659357',
    description: 'Fertilizante foliar desenvolvido para maximizar pegamento, enchimento de grãos e produtividade na fase reprodutiva das culturas.',
    crops: ['Soja', 'Milho', 'Café', 'Citros', 'Tomate'],
    problems: [
      { title: 'Baixo pegamento de flores', desc: 'Flores que não fixam, reduzindo diretamente o potencial produtivo da lavoura.', icon: 'leaf' },
      { title: 'Grãos chochos e leves', desc: 'Enchimento insuficiente dos grãos por falta de nutrição na fase reprodutiva.', icon: 'chart' },
      { title: 'Queda de produtividade', desc: 'Resultado abaixo do potencial mesmo com boa nutrição vegetativa.', icon: 'sun' },
    ],
    benefits: [
      { title: 'Mais pegamento de flores', desc: 'Nutrição adequada nos estágios reprodutivos para maior fixação.' },
      { title: 'Enchimento uniforme', desc: 'Grãos mais pesados e uniformes, com melhor aproveitamento da fotossíntese.' },
      { title: 'Produtividade consistente', desc: 'Resultado mensurável em campo, safra após safra.' },
    ],
    stages: [
      { num: '01', label: 'Florada', title: 'Reprodutivo', desc: 'Aplicação foliar para suporte ao pegamento.' },
      { num: '02', label: 'Enchimento', title: 'Granação', desc: 'Segunda aplicação para maximizar o peso de grãos.' },
    ],
    results: [],
    related: [
      { slug: 'aminosan', name: 'Aminosan®', tag: 'Nutrição e Fisiologia', desc: 'Vigor e resistência em todas as fases.', labelColor: '#659357' },
      { slug: 'revigophos-amino', name: 'RevigoPhos Amino', tag: 'Nutrição e Fisiologia', desc: 'Energia e recuperação rápida.', labelColor: '#302783' },
    ],
  },
  'linha-revigo': {
    name: 'Linha Revigo',
    tag: 'Nutrição e Fisiologia Vegetal',
    labelColor: '#302783',
    description: 'Linha completa de fertilizantes foliares para correção de deficiências nutricionais em cada cultura, nas diferentes fases do ciclo.',
    crops: ['Soja', 'Milho', 'Café', 'Algodão', 'Feijão', 'Citros', 'Tomate', 'Batata'],
    problems: [
      { title: 'Deficiências nutricionais', desc: 'Carências de micro e macronutrientes que limitam o crescimento e a produtividade.', icon: 'leaf' },
      { title: 'Sintomas visuais de deficiência', desc: 'Clorose, necrose e deformações que indicam nutrição inadequada.', icon: 'sun' },
      { title: 'Baixa eficiência de absorção', desc: 'Nutrientes no solo que a planta não consegue acessar de forma eficiente.', icon: 'drop' },
    ],
    benefits: [
      { title: 'Correção rápida de deficiências', desc: 'Absorção foliar imediata para resposta em menos de 72 horas.' },
      { title: 'Fórmulas por cultura', desc: 'Cada produto da linha é formulado para as exigências específicas de cada cultura.' },
      { title: 'Compatibilidade com outros insumos', desc: 'Pode ser aplicado em calda junto com defensivos e outros foliares.' },
    ],
    stages: [],
    results: [],
    related: [
      { slug: 'aminosan', name: 'Aminosan®', tag: 'Nutrição e Fisiologia', desc: 'Vigor e resistência para todo o ciclo.', labelColor: '#659357' },
      { slug: 'fitofert', name: 'Fitofert', tag: 'Nutrição e Fisiologia', desc: 'Pegamento e enchimento na fase reprodutiva.', labelColor: '#659357' },
    ],
  },
  'revigophos-amino': {
    name: 'RevigoPhos Amino',
    tag: 'Nutrição e Fisiologia Vegetal',
    labelColor: '#302783',
    description: 'Fertilizante foliar com fósforo e aminoácidos para energia rápida e recuperação acelerada após estresses. Ideal para janelas críticas do ciclo.',
    crops: ['Soja', 'Milho', 'Café', 'Algodão', 'Feijão', 'Cana'],
    problems: [
      { title: 'Plantas estressadas', desc: 'Lavouras que sofreram com clima adverso, pragas ou déficit hídrico e precisam de recuperação rápida.', icon: 'sun' },
      { title: 'Fósforo indisponível', desc: 'Solos com alta fixação de fósforo ou condições que limitam a absorção radicular.', icon: 'drop' },
      { title: 'Baixa energia metabólica', desc: 'Plantas com metabolismo lento que não respondem bem aos insumos aplicados.', icon: 'seed' },
    ],
    benefits: [
      { title: 'Fornece energia imediata', desc: 'Fósforo foliar de alta solubilidade para energia rápida ao metabolismo.' },
      { title: 'Recuperação acelerada', desc: 'Aminoácidos potencializam a resposta da planta após períodos de estresse.' },
      { title: 'Ideal para janelas críticas', desc: 'Aplicação precisa em momentos decisivos do ciclo produtivo.' },
    ],
    stages: [],
    results: [],
    related: [
      { slug: 'aminosan', name: 'Aminosan®', tag: 'Nutrição e Fisiologia', desc: 'Vigor e resistência em todas as fases.', labelColor: '#659357' },
      { slug: 'fitofert', name: 'Fitofert', tag: 'Nutrição e Fisiologia', desc: 'Mais pegamento e enchimento.', labelColor: '#659357' },
    ],
  },
  'revigo-cobre-ultra': {
    name: 'Revigo Cobre Ultra',
    tag: 'Nutrição e Fisiologia Vegetal',
    labelColor: '#302783',
    description: 'Cobre complexado para força fisiológica e resistência da planta. Formulação de alta eficiência para correção e prevenção de deficiências.',
    crops: ['Soja', 'Café', 'Citros', 'Tomate', 'Batata'],
    problems: [
      { title: 'Deficiência de cobre', desc: 'Lavouras com sintomas de deficiência que afetam o desenvolvimento e a resistência.', icon: 'leaf' },
      { title: 'Baixa resistência a doenças', desc: 'Plantas com menor resistência fisiológica a patógenos fúngicos e bacterianos.', icon: 'shield' },
    ],
    benefits: [
      { title: 'Correção de deficiência de cobre', desc: 'Absorção foliar rápida com cobre complexado de alta biodisponibilidade.' },
      { title: 'Fortalecimento fisiológico', desc: 'Cobre ativa enzimas essenciais para resistência e fotossíntese.' },
    ],
    stages: [],
    results: [],
    related: [
      { slug: 'linha-revigo', name: 'Linha Revigo', tag: 'Nutrição e Fisiologia', desc: 'Linha completa de foliares.', labelColor: '#302783' },
      { slug: 'aminosan', name: 'Aminosan®', tag: 'Nutrição e Fisiologia', desc: 'Vigor e resistência para todo o ciclo.', labelColor: '#659357' },
    ],
  },
  'acorda-cana': {
    name: 'Acorda Cana',
    tag: 'Tratamento de Sementes',
    labelColor: '#79ab34',
    description: 'Enraizamento, vigor e mais produtividade na cana-de-açúcar, desde o plantio. Formulado para estimular o desenvolvimento inicial da cultura.',
    crops: ['Cana-de-açúcar'],
    problems: [
      { title: 'Arranque lento', desc: 'Mudas com desenvolvimento inicial lento, perdendo janelas produtivas essenciais.', icon: 'seed' },
      { title: 'Enraizamento insuficiente', desc: 'Sistema radicular raso que limita a absorção de água e nutrientes ao longo do ciclo.', icon: 'drop' },
    ],
    benefits: [
      { title: 'Enraizamento acelerado', desc: 'Estimula o desenvolvimento do sistema radicular desde os primeiros dias após o plantio.' },
      { title: 'Arranque mais forte', desc: 'Plantas com maior vigor inicial respondem melhor à adubação de base.' },
    ],
    stages: [
      { num: '01', label: 'Plantio', title: 'Tratamento de muda', desc: 'Aplicação antes ou durante o plantio para arranque imediato.' },
    ],
    results: [],
    related: [
      { slug: 'aminosan', name: 'Aminosan®', tag: 'Nutrição e Fisiologia', desc: 'Vigor durante o crescimento.', labelColor: '#659357' },
      { slug: 'linha-redutan', name: 'Linha Redutan', tag: 'Tecnologia de Aplicação', desc: 'Qualidade de calda para aplicações em cana.', labelColor: '#7d252a' },
    ],
  },
  'acorda-ultra': {
    name: 'Acorda Ultra',
    tag: 'Tratamento de Sementes',
    labelColor: '#008dc2',
    description: 'Arranque forte e enraizamento profundo desde o primeiro dia no solo. Para soja, milho, algodão e feijão.',
    crops: ['Soja', 'Milho', 'Algodão', 'Feijão'],
    problems: [
      { title: 'Stand desuniforme', desc: 'Emergência irregular que compromete o aproveitamento da área e o manejo.', icon: 'chart' },
      { title: 'Raízes superficiais', desc: 'Sistema radicular raso que limita a resistência à seca e absorção de nutrientes.', icon: 'drop' },
    ],
    benefits: [
      { title: 'Stand mais uniforme', desc: 'Emergência homogênea para um talhão mais produtivo e fácil de manejar.' },
      { title: 'Raízes mais profundas', desc: 'Sistema radicular robusto para melhor aproveitamento de água e nutrientes.' },
    ],
    stages: [
      { num: '01', label: 'Semente', title: 'Tratamento', desc: 'Aplicado diretamente na semente antes do plantio.' },
    ],
    results: [],
    related: [
      { slug: 'aminosan', name: 'Aminosan®', tag: 'Nutrição e Fisiologia', desc: 'Vigor contínuo durante o crescimento.', labelColor: '#659357' },
      { slug: 'aduban', name: 'Aduban', tag: 'Tratamento de Sementes', desc: 'Solo equilibrado para planta jovem.', labelColor: '#ad1115' },
    ],
  },
  aduban: {
    name: 'Aduban',
    tag: 'Tratamento de Sementes',
    labelColor: '#ad1115',
    description: 'Solo equilibrado e mais absorção de nutrientes pela planta jovem. Para soja, milho, café e feijão.',
    crops: ['Soja', 'Milho', 'Café', 'Feijão'],
    problems: [
      { title: 'Baixa disponibilidade de nutrientes', desc: 'Solo com nutrientes bloqueados por pH inadequado ou competição biológica.', icon: 'drop' },
      { title: 'Planta jovem fragilizada', desc: 'Plântulas com desenvolvimento lento por ambiente de solo desequilibrado.', icon: 'seed' },
    ],
    benefits: [
      { title: 'Melhora o ambiente radicular', desc: 'Estimula microrganismos benéficos para maior disponibilidade de nutrientes.' },
      { title: 'Absorção mais eficiente', desc: 'Planta jovem com melhor acesso aos nutrientes desde a germinação.' },
    ],
    stages: [
      { num: '01', label: 'Semente', title: 'Tratamento', desc: 'Aplicado na semente para ação imediata no solo.' },
    ],
    results: [],
    related: [
      { slug: 'acorda-ultra', name: 'Acorda Ultra', tag: 'Tratamento de Sementes', desc: 'Arranque forte e enraizamento profundo.', labelColor: '#008dc2' },
      { slug: 'aminosan', name: 'Aminosan®', tag: 'Nutrição e Fisiologia', desc: 'Vigor durante o crescimento.', labelColor: '#659357' },
    ],
  },
  'kmep-ultra': {
    name: 'Kmep Ultra',
    tag: 'Proteção de Cultivos',
    labelColor: '#ad1115',
    description: 'Potencializa inseticidas e melhora a eficiência no controle de pragas. Adjuvante especializado para maximizar o resultado das aplicações.',
    crops: ['Soja', 'Milho', 'Café', 'Algodão', 'Feijão', 'Tomate', 'Batata', 'Cana'],
    problems: [
      { title: 'Controle ineficiente de pragas', desc: 'Inseticidas com baixa performance por dificuldades de deposição e absorção.', icon: 'shield' },
      { title: 'Resistência de pragas', desc: 'Necessidade de doses cada vez maiores para o mesmo resultado.', icon: 'chart' },
    ],
    benefits: [
      { title: 'Maior eficiência do inseticida', desc: 'Potencializa a ação do princípio ativo, melhorando cobertura e absorção.' },
      { title: 'Melhor deposição', desc: 'Reduz a tensão superficial para melhor espalhamento sobre a folha e a praga.' },
    ],
    stages: [],
    results: [],
    related: [
      { slug: 'linha-redutan', name: 'Linha Redutan', tag: 'Tecnologia de Aplicação', desc: 'Qualidade de calda para cada pulverização.', labelColor: '#7d252a' },
      { slug: 'supermix', name: 'Supermix', tag: 'Tecnologia de Aplicação', desc: 'Calda uniforme, sem entupimentos.', labelColor: '#388123' },
    ],
  },
  'linha-redutan': {
    name: 'Linha Redutan',
    tag: 'Tecnologia de Aplicação',
    labelColor: '#7d252a',
    description: 'Qualidade de calda, menos deriva e mais eficiência operacional. A linha completa para otimizar cada pulverização no campo.',
    crops: ['Soja', 'Milho', 'Café', 'Algodão', 'Feijão', 'Citros', 'Tomate', 'Batata', 'Cana', 'Pastagem'],
    problems: [
      { title: 'Deriva excessiva', desc: 'Perda de produto por deriva, contaminando áreas vizinhas e reduzindo a eficiência.', icon: 'sun' },
      { title: 'Calda instável', desc: 'Misturas incompatíveis que cristalizam ou entopem bicos e filtros.', icon: 'drop' },
    ],
    benefits: [
      { title: 'Menos deriva', desc: 'Reduz a formação de gotas finas que derivam com o vento durante a pulverização.' },
      { title: 'Calda mais estável', desc: 'Melhora a compatibilidade entre produtos na calda para aplicações seguras.' },
    ],
    stages: [],
    results: [],
    related: [
      { slug: 'supermix', name: 'Supermix', tag: 'Tecnologia de Aplicação', desc: 'Adjuvante para calda uniforme.', labelColor: '#388123' },
      { slug: 'kmep-ultra', name: 'Kmep Ultra', tag: 'Proteção de Cultivos', desc: 'Potencializa inseticidas.', labelColor: '#ad1115' },
    ],
  },
  supermix: {
    name: 'Supermix',
    tag: 'Tecnologia de Aplicação',
    labelColor: '#388123',
    description: 'Adjuvante para calda uniforme, sem entupimentos e maior compatibilidade entre produtos na pulverização.',
    crops: ['Soja', 'Milho', 'Café', 'Algodão', 'Feijão', 'Citros', 'Tomate', 'Batata', 'Cana', 'Pastagem'],
    problems: [
      { title: 'Calda não homogênea', desc: 'Produtos que não se misturam bem gerando aplicação desuniforme.', icon: 'drop' },
      { title: 'Entupimento de bicos', desc: 'Precipitação de produtos na calda causando falhas operacionais em campo.', icon: 'chart' },
    ],
    benefits: [
      { title: 'Calda homogênea', desc: 'Melhora a mistura entre produtos para aplicação uniforme em todo o talhão.' },
      { title: 'Sem entupimentos', desc: 'Evita a precipitação de produtos na calda, protegendo o equipamento.' },
    ],
    stages: [],
    results: [],
    related: [
      { slug: 'linha-redutan', name: 'Linha Redutan', tag: 'Tecnologia de Aplicação', desc: 'Menos deriva e mais eficiência.', labelColor: '#7d252a' },
      { slug: 'kmep-ultra', name: 'Kmep Ultra', tag: 'Proteção de Cultivos', desc: 'Potencializa inseticidas.', labelColor: '#ad1115' },
    ],
  },
  'revigo-milho': {
    name: 'Revigo + Milho',
    tag: 'Manejo Completo',
    labelColor: '#302783',
    description: 'Nutrição estratégica para o milho safrinha — ganho real por hectare com programa nutricional integrado.',
    crops: ['Milho'],
    problems: [
      { title: 'Milho safrinha com baixo potencial', desc: 'Cultura com janela curta que precisa de nutrição precisa para atingir o teto produtivo.', icon: 'chart' },
      { title: 'Estresse hídrico no safrão', desc: 'Período mais seco que exige da planta maior eficiência metabólica.', icon: 'sun' },
    ],
    benefits: [
      { title: 'Programa nutricional completo', desc: 'Combinação de produtos montada para cada fase crítica do milho safrinha.' },
      { title: 'Resultado comprovado em campo', desc: 'Ganhos medidos em ensaios conduzidos em parceria com produtores.' },
    ],
    stages: [
      { num: '01', label: 'V3–V5', title: 'Estabelecimento', desc: 'Aplicação precoce para arranque sólido.' },
      { num: '02', label: 'V8–V10', title: 'Crescimento', desc: 'Nutrição foliar para vigor e massa foliar.' },
      { num: '03', label: 'Pendoamento', title: 'Pré-reprodutivo', desc: 'Preparação para o florescimento.' },
    ],
    results: [],
    related: [
      { slug: 'aminosan', name: 'Aminosan®', tag: 'Nutrição e Fisiologia', desc: 'Vigor e resistência para todo o ciclo.', labelColor: '#659357' },
      { slug: 'fitofert', name: 'Fitofert', tag: 'Nutrição e Fisiologia', desc: 'Pegamento e enchimento.', labelColor: '#659357' },
    ],
  },
  'revigo-pasto': {
    name: 'Revigo + Pasto',
    tag: 'Manejo Completo',
    labelColor: '#302783',
    description: 'Recuperação da pastagem, ganho de peso e mais lotação por hectare com nutrição estratégica para forrageiras.',
    crops: ['Pastagem'],
    problems: [
      { title: 'Pastagem degradada', desc: 'Forrageiras com baixa densidade, invasoras e capacidade de suporte reduzida.', icon: 'leaf' },
      { title: 'Baixo ganho de peso', desc: 'Animal com forragem de baixa qualidade nutricional, impactando o resultado zootécnico.', icon: 'chart' },
    ],
    benefits: [
      { title: 'Recuperação da forrageira', desc: 'Nutrição foliar que estimula o rebrote e melhora a densidade do pasto.' },
      { title: 'Maior lotação', desc: 'Pastagem mais produtiva com maior capacidade de suporte por hectare.' },
    ],
    stages: [],
    results: [],
    related: [
      { slug: 'aminosan', name: 'Aminosan®', tag: 'Nutrição e Fisiologia', desc: 'Vigor e resistência para todo o ciclo.', labelColor: '#659357' },
      { slug: 'linha-redutan', name: 'Linha Redutan', tag: 'Tecnologia de Aplicação', desc: 'Eficiência nas aplicações.', labelColor: '#7d252a' },
    ],
  },
}

