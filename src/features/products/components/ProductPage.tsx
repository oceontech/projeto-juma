'use client'

import React, { useRef } from 'react'
import { Link } from '@/i18n/navigation'
import { Container } from '@/components/layout/Container'
import { gsap, ScrollTrigger, useGSAP, SplitText } from '@/features/animation/gsap'
import { DUR, EASE, STAGGER } from '@/features/animation/motion'
import { useReducedMotion } from '@/features/animation/useReducedMotion'
import { AlertTriangle, Star, Activity, BarChart3, Clock, LayoutGrid, Camera, Package, Rocket, ListChecks } from 'lucide-react'

const WHATSAPP = 'https://wa.me/5519999648186'

type Problem = { title: string; desc: string; icon: 'seed' | 'sun' | 'drop' | 'leaf' | 'shield' | 'chart' }
type Benefit = { title: string; desc: string }
type Stage = { num: string; label: string; title: string; desc: string }
type Result = { value: string; unit: string; desc: string }
type Related = { slug: string; name: string; tag: string; desc: string; labelColor: string }

type ProductData = {
  name: string
  tag: string
  labelColor: string
  description: string
  crops: string[]
  problems: Problem[]
  benefits: Benefit[]
  stages: Stage[]
  results: Result[]
  related: Related[]
}

const DATA: Record<string, ProductData> = {
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

/* ─── Icons ─── */
function ProblemIcon({ type }: { type: Problem['icon'] }) {
  const cls = 'w-[22px] h-[22px]'
  if (type === 'seed') return (
    <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 22V12M12 12C12 7 7 4 3 4c0 4.5 2.5 8 9 8zM12 12c0-5 5-8 9-8-0 4.5-2.5 8-9 8z" />
    </svg>
  )
  if (type === 'sun') return (
    <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  )
  if (type === 'drop') return (
    <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
    </svg>
  )
  if (type === 'leaf') return (
    <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M11 20A7 7 0 0 1 4 13c0-7 7-11 7-11s7 4 7 11a7 7 0 0 1-7 7z" /><line x1="11" y1="20" x2="11" y2="13" />
    </svg>
  )
  if (type === 'shield') return (
    <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
  return (
    <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="w-[14px] h-[14px]">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="w-[14px] h-[14px]">
      <path d="M7 17 17 7M9 7h8v8" />
    </svg>
  )
}

/* ─── Eyebrow badge ─── */
function Eyebrow({ dark, icon: Icon, children }: { dark?: boolean; icon?: React.ElementType; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-2 px-3.5 py-[7px] rounded-full text-[11px] font-semibold uppercase tracking-[0.16em] border ${
        dark
          ? 'border-white/35 text-white'
          : 'border-black/[0.18] text-[#1A1A1A]'
      }`}
    >
      {Icon ? (
        <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${dark ? 'text-[#F0E27A]' : 'text-[#004B26]'}`} />
      ) : (
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dark ? 'bg-[#F0E27A]' : 'bg-[#004B26]'}`} />
      )}
      {children}
    </span>
  )
}

/* ─── Section header (eyebrow + title left, lede right) ─── */
function SectionHead({ eyebrow, icon, title, lede }: { eyebrow: string; icon?: React.ElementType; title: React.ReactNode; lede?: string }) {
  return (
    <div className="flex flex-col gap-[18px] mb-14 w-full">
      <div data-section-kicker><Eyebrow icon={icon}>{eyebrow}</Eyebrow></div>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 md:gap-12">
        <h2 data-section-title className="m-0 flex-1 font-black uppercase leading-[1.05] tracking-tight text-[#1A1A1A]" style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', fontWeight: 720 }}>
          {title}
        </h2>
        {lede && (
          <p data-section-lede className="text-[#5A5A57] leading-[1.55] w-full md:w-auto md:max-w-[40ch] shrink-0 text-[clamp(17px,1.25vw,20px)] m-0">
            {lede}
          </p>
        )}
      </div>
    </div>
  )
}

export function ProductPage({ slug }: { slug: string }) {
  const product = DATA[slug]
  const reduced = useReducedMotion()
  const heroRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (reduced || !heroRef.current) return
      const title = heroRef.current.querySelector('[data-hero-title]')
      const els = heroRef.current.querySelectorAll('[data-hero-el]')
      
      let split: SplitText | null = null
      if (title) {
        split = new SplitText(title, { type: 'chars,words' })
        gsap.set(split.chars, { x: 20, opacity: 0, filter: 'blur(10px)' })
      }
      
      gsap.set(els, { y: 24, opacity: 0 })
      
      const tl = gsap.timeline({ delay: 0.15 })
      tl.to(els, { y: 0, opacity: 1, duration: DUR.sub, stagger: 0.09, ease: EASE.reveal })
      if (split) {
        tl.to(split.chars, { x: 0, opacity: 1, filter: 'blur(0px)', duration: DUR.title, stagger: STAGGER.char, ease: EASE.reveal }, '-=0.4')
      }

      return () => split?.revert()
    },
    { scope: heroRef, dependencies: [reduced] },
  )

  useGSAP(
    () => {
      if (reduced || !bodyRef.current) return
      const sections = bodyRef.current.querySelectorAll('[data-section]')
      
      const splits: SplitText[] = []
      
      sections.forEach((section) => {
        const title = section.querySelector('[data-section-title]')
        const kicker = section.querySelector('[data-section-kicker]')
        const lede = section.querySelector('[data-section-lede]')
        const contentEls = section.querySelectorAll('[data-animate-content]')
        
        let split: SplitText | null = null
        if (title) {
          split = new SplitText(title, { type: 'chars,words' })
          splits.push(split)
          gsap.set(split.chars, { x: 20, opacity: 0, filter: 'blur(10px)' })
        }
        
        if (kicker) gsap.set(kicker, { y: 14, opacity: 0 })
        if (lede) gsap.set(lede, { y: 14, opacity: 0 })
        if (contentEls.length > 0) gsap.set(contentEls, { y: 24, opacity: 0 })
        gsap.set(section, { y: 32, opacity: 0 })
        
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top 85%',
            end: 'bottom 15%',
            toggleActions: 'play reverse play reverse',
          },
          defaults: { ease: EASE.reveal }
        })
        
        tl.to(section, { y: 0, opacity: 1, duration: 0.8 })
        if (kicker) tl.to(kicker, { y: 0, opacity: 1, duration: DUR.sub }, '-=0.6')
        if (split) {
          tl.to(split.chars, { x: 0, opacity: 1, filter: 'blur(0px)', duration: DUR.title, stagger: STAGGER.char }, '-=0.4')
        }
        if (lede) tl.to(lede, { y: 0, opacity: 1, duration: DUR.sub }, '-=0.4')
        if (contentEls.length > 0) {
          tl.to(contentEls, { y: 0, opacity: 1, duration: 0.45, stagger: 0.04 }, '-=0.6')
        }
      })
      
      return () => splits.forEach(s => s.revert())
    },
    { scope: bodyRef, dependencies: [reduced] },
  )

  if (!product) return null

  const nameShort = product.name.replace('®', '').replace('+', '').trim()

  return (
    <div className="bg-[#F2F6F2]">
      <Container>

        {/* ══ HERO (PDP TOP) ══ */}
        <div ref={heroRef} className="pt-8 pb-16 md:pb-24">
          {/* Breadcrumb */}
          <nav data-hero-el className="flex items-center gap-2 mb-8 text-[12.5px] font-medium uppercase tracking-[0.04em] text-[#5A5A57]">
            <Link href="/produtos" className="hover:text-[#1A1A1A] border-b border-transparent hover:border-[#1A1A1A] transition-colors pb-px">
              Produtos
            </Link>
            <span className="text-[#7C7C78]">·</span>
            <span className="text-[#1A1A1A]">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-10 lg:gap-20 items-start">

            {/* Visual — CSS bottle */}
            <div
              data-hero-el
              className="relative aspect-[4/5] rounded-[24px] overflow-hidden grid place-items-center"
              style={{
                background: 'radial-gradient(80% 60% at 50% 70%, rgba(0,0,0,.10), transparent 70%), linear-gradient(160deg, #E8EFE2, #E4ECEA)',
                boxShadow: '0 1px 2px rgba(20,30,20,.04), 0 24px 60px -32px rgba(20,30,20,.25)',
              }}
            >
              {/* Seal badge */}
              <div
                className="absolute top-[22px] left-[22px] z-10 w-[116px] h-[116px] rounded-full bg-[#F0E27A] text-[#1A1A1A] grid place-items-center text-center text-[11px] font-bold uppercase tracking-[0.06em] leading-[1.1] p-[10px] select-none"
                style={{ animation: 'pdp-seal-spin 22s linear infinite' }}
                aria-hidden
              >
                <span>
                  <span style={{ fontSize: 10 }}>40+ anos</span><br />
                  <span style={{ fontSize: 24, letterSpacing: '-0.02em', fontWeight: 750, textTransform: 'none' }}>no campo</span><br />
                  <span style={{ fontSize: 10 }}>referência br</span>
                </span>
              </div>

              {/* Bottle body */}
              <div
                className="relative flex flex-col items-center"
                style={{ width: '38%', height: '78%' }}
              >
                {/* Cap */}
                <div
                  className="absolute rounded-t-[6px] rounded-b-[8px]"
                  style={{
                    top: -16,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '28%',
                    height: 24,
                    backgroundColor: product.labelColor,
                  }}
                />
                {/* Body */}
                <div
                  className="w-full h-full rounded-[20px_20px_10px_10px] flex flex-col items-center"
                  style={{
                    background: 'linear-gradient(180deg, #fff 0%, #f4f4f0 100%)',
                    boxShadow: '0 60px 80px -40px rgba(0,0,0,.30), inset -16px 0 36px -14px rgba(0,0,0,.10)',
                    paddingTop: '7%',
                  }}
                >
                  {/* Label */}
                  <div
                    className="flex flex-col items-center gap-1 rounded-[6px] text-center text-white px-[6px] py-[14px]"
                    style={{
                      backgroundColor: product.labelColor,
                      width: '82%',
                      marginTop: '14%',
                    }}
                  >
                    <small style={{ fontSize: '9.5px', letterSpacing: '0.08em', color: 'rgba(255,255,255,.85)', textTransform: 'uppercase' }}>Juma Agro</small>
                    <b style={{ fontSize: 22, letterSpacing: '-0.01em', fontWeight: 750 }}>{nameShort}</b>
                    <small style={{ fontSize: '9.5px', letterSpacing: '0.08em', color: 'rgba(255,255,255,.85)', textTransform: 'uppercase' }}>{product.tag.split(' ')[0]}</small>
                  </div>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="flex flex-col lg:pt-4">
              {/* Category tag */}
              <span
                data-hero-el
                className="inline-flex self-start rounded-full text-[11px] font-bold uppercase tracking-[0.14em] px-3.5 py-[7px] text-[#004B26] bg-[#DDE6C8] whitespace-nowrap mb-4"
              >
                {product.tag}
              </span>

              <h1
                data-hero-title
                className="text-[#1A1A1A] m-0 mb-[22px] uppercase leading-[1.05] tracking-tight"
                style={{ fontSize: 'clamp(48px,5.6vw,88px)', fontWeight: 740 }}
              >
                {product.name}
              </h1>

              <p
                data-hero-el
                className="text-[#2A2A28] leading-[1.55] mb-8 max-w-[50ch] m-0"
                style={{ fontSize: 17 }}
              >
                {product.description}
              </p>

              {/* Crops */}
              <div data-hero-el className="mb-8">
                <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-[#1A1A1A] block mb-3">
                  Culturas indicadas
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.crops.map((crop) => (
                    <span
                      key={crop}
                      className="inline-flex items-center gap-[7px] text-[13px] font-medium px-3.5 py-[7px] rounded-full bg-white border border-black/10 text-[#1A1A1A]"
                    >
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: product.labelColor }} />
                      {crop}
                    </span>
                  ))}
                </div>
              </div>

              {/* CTAs */}
              <div data-hero-el className="flex flex-wrap gap-3">
                <a
                  href={WHATSAPP}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 h-[54px] px-[26px] rounded-full text-[15px] font-semibold text-white bg-[#004B26] hover:bg-[#003A1D] transition-all hover:-translate-y-px"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="w-4 h-4">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                  </svg>
                  Falar no WhatsApp
                </a>
                <Link
                  href="/contato"
                  className="inline-flex items-center gap-2.5 h-[54px] px-[26px] rounded-full text-[15px] font-semibold text-[#1A1A1A] border border-black/[0.18] hover:border-black transition-all hover:-translate-y-px"
                >
                  Tenho interesse
                  <ArrowIcon />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* ══ SEÇÕES DINÂMICAS ══ */}
      <div ref={bodyRef}>

        {/* Problemas */}
        {product.problems.length > 0 && (
          <section data-section className="py-[clamp(80px,9vw,140px)]">
            <Container>
              <SectionHead
                icon={AlertTriangle}
                eyebrow="Problemas que resolve"
                title={<>Quando o {nameShort}<br />faz a diferença.</>}
                lede="Em três situações que limitam a produtividade da lavoura, entrega resposta rápida e mensurável."
              />
              <div
                className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              >
                {product.problems.map((p, i) => (
                  <article
                    key={i}
                    data-animate-content
                    className="group relative overflow-hidden bg-[#1A1A1A] border border-white/10 rounded-[24px] p-8 flex flex-col gap-6 transition-all duration-300 hover:-translate-y-2 hover:border-[#004B26]/60 hover:shadow-[0_0_30px_rgba(0,75,38,0.25)]"
                  >
                    <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#F0E27A] rounded-full blur-[60px] opacity-10 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none" />
                    
                    <span className="text-[#F0E27A]/20 font-black leading-none pointer-events-none" style={{ fontSize: 'clamp(48px, 4vw, 64px)' }}>
                      {(i + 1).toString().padStart(2, '0')}
                    </span>

                    <div className="flex flex-col gap-3 relative z-10 mt-auto">
                      <h3 className="m-0 text-[20px] font-bold tracking-tight text-white leading-snug">{p.title}</h3>
                      <p className="m-0 text-[15px] text-white/70 leading-[1.6]">{p.desc}</p>
                    </div>
                  </article>
                ))}
              </div>
            </Container>
          </section>
        )}

        {/* Benefícios */}
        {product.benefits.length > 0 && (
          <section data-section className="pt-0 pb-[clamp(80px,9vw,140px)]">
            <Container>
              <SectionHead
                icon={Star}
                eyebrow="Benefícios"
                title={<>O que o {nameShort}<br />entrega na lavoura.</>}
                lede="Efeitos comprovados no metabolismo da planta — todos com resposta visível em campo."
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {product.benefits.map((b, i) => (
                  <div
                    key={i}
                    data-animate-content
                    className="flex items-start gap-3.5 p-[22px_24px] bg-white border border-black/10 rounded-[14px]"
                  >
                    <span className="flex-shrink-0 w-[30px] h-[30px] rounded-full bg-[#004B26] text-[#F0E27A] grid place-items-center">
                      <CheckIcon />
                    </span>
                    <div>
                      <b className="block text-[15.5px] font-semibold tracking-[-0.01em] text-[#1A1A1A] mb-1 leading-tight">{b.title}</b>
                      <span className="text-[14px] text-[#5A5A57] leading-[1.5]">{b.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Container>
          </section>
        )}

        {/* Modo de uso */}
        {product.stages.length > 0 && (
          <section data-section className="pt-0 pb-[clamp(80px,9vw,140px)]">
            <Container>
              <SectionHead
                icon={ListChecks}
                eyebrow="Modo de uso"
                title={<>Aplicação foliar<br />ao longo do ciclo.</>}
                lede="Use nos estágios iniciais para arranque forte e nas fases reprodutivas para sustentar a produtividade."
              />
              <div
                className="grid gap-[2px] mt-8 rounded-[14px] overflow-hidden"
                style={{ gridTemplateColumns: `repeat(${product.stages.length}, 1fr)` }}
              >
                {product.stages.map((s, i) => (
                  <div
                    key={i}
                    data-animate-content
                    className="flex flex-col gap-2.5 p-[24px_20px] min-h-[140px]"
                    style={{ backgroundColor: i % 2 === 0 ? '#DDE6C8' : '#E2EAD3' }}
                  >
                    <span className="text-[11.5px] font-semibold uppercase tracking-[0.08em] text-[#004B26] opacity-60">
                      {s.num} · {s.label}
                    </span>
                    <h4 className="m-0 text-[17px] font-[650] tracking-[-0.01em] text-[#1A1A1A] leading-[1.15]">{s.title}</h4>
                    <p className="m-0 text-[13.5px] text-[#5A5A57] leading-[1.45]">{s.desc}</p>
                  </div>
                ))}
              </div>
            </Container>
          </section>
        )}

        {/* Resultados */}
        {product.results.length > 0 && (
          <section data-section className="pt-0 pb-[clamp(80px,9vw,140px)]">
            <Container>
              <SectionHead
                icon={Activity}
                eyebrow="Resultados em campo"
                title={<>Sacas a mais por hectare —<br />medidas pelo produtor.</>}
              />
              <div
                className="grid gap-[18px]"
                style={{ gridTemplateColumns: `repeat(${product.results.length}, 1fr)` }}
              >
                {product.results.map((r, i) => (
                  <div
                    key={i}
                    data-animate-content
                    className="relative overflow-hidden rounded-[24px] flex flex-col gap-3.5 p-[36px_30px_32px] min-h-[240px]"
                    style={{ backgroundColor: i === product.results.length - 1 ? '#659357' : '#004B26' }}
                  >
                    <div
                      className="absolute pointer-events-none"
                      style={{
                        inset: '-50% -20% auto auto',
                        width: '80%',
                        height: '80%',
                        background: 'radial-gradient(circle, rgba(240,226,122,.16), transparent 70%)',
                      }}
                    />
                    <span className="relative text-[11.5px] font-semibold uppercase tracking-[0.16em] text-white/60">
                      Resultado
                    </span>
                    <div
                      className="relative text-[#F0E27A] leading-[0.95] font-[740] tracking-[-0.035em]"
                      style={{ fontSize: 'clamp(48px,5.4vw,80px)', fontFeatureSettings: '"tnum"' }}
                    >
                      {r.value}<small className="text-[0.42em] align-super font-semibold text-white/78 ml-1">{r.unit}</small>
                    </div>
                    <p className="relative m-0 mt-auto text-[14.5px] text-white/78 leading-[1.5]">{r.desc}</p>
                  </div>
                ))}
              </div>
            </Container>
          </section>
        )}

        {/* Galeria */}
        <section data-section className="pt-0 pb-[clamp(80px,9vw,140px)]">
          <Container>
            <SectionHead
              icon={Camera}
              eyebrow="No campo"
              title={<>{nameShort} em ação.</>}
              lede="Fotos de talhões e ensaios reais conduzidos com produtores parceiros."
            />
            <div
              className="grid gap-3.5"
              style={{
                gridTemplateColumns: '2fr 1fr 1fr',
                gridTemplateRows: '220px 220px',
              }}
            >
              {[
                'linear-gradient(160deg, #5d7a3a, #2c3a18)',
                'linear-gradient(160deg, #7fa356, #364a1f)',
                'linear-gradient(160deg, #6c4226, #2a1a10)',
                'linear-gradient(160deg, #b3a268, #5e4910)',
                'linear-gradient(160deg, #80a558, #2c3e1d)',
              ].map((grad, i) => (
                <div
                  key={i}
                  data-animate-content
                  className="rounded-[18px] overflow-hidden"
                  style={{
                    backgroundImage: grad,
                    gridRow: i === 0 ? 'span 2' : undefined,
                  }}
                />
              ))}
            </div>
          </Container>
        </section>

        {/* Relacionados */}
        {product.related.length > 0 && (
          <section data-section className="pt-0 pb-[clamp(80px,9vw,140px)]">
            <Container>
              <SectionHead
                icon={Package}
                eyebrow="Produtos relacionados"
                title="Outros da mesma família."
                lede="Combinações que potencializam o resultado em manejo completo."
              />
              <div
                className="grid gap-[18px]"
                style={{ gridTemplateColumns: `repeat(1, 1fr) md:repeat(${Math.min(product.related.length, 3)}, 1fr)` }}
              >
                {product.related.map((rel) => (
                  <Link
                    key={rel.slug}
                    data-animate-content
                    href={`/produtos/${rel.slug}`}
                    className="group flex flex-col rounded-[24px] overflow-hidden border border-black/10 hover:-translate-y-1 hover:shadow-[0_1px_2px_rgba(20,30,20,.04),0_24px_60px_-32px_rgba(20,30,20,.25)] transition-all duration-300"
                  >
                    {/* Pack visual */}
                    <div
                      className="relative flex items-center justify-center overflow-hidden"
                      style={{
                        aspectRatio: '4/3',
                        background: `radial-gradient(80% 60% at 50% 70%, rgba(0,0,0,.10), transparent 70%), linear-gradient(160deg, #E8EFE2, #E4ECEA)`,
                      }}
                    >
                      <span
                        className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-[0.12em] px-3 py-1.5 rounded-full text-[#004B26] bg-[#DDE6C8]"
                      >
                        {rel.tag}
                      </span>
                      <div
                        className="flex flex-col items-center gap-1 rounded-[6px] text-center text-white px-2 py-3 w-[6rem]"
                        style={{ backgroundColor: rel.labelColor }}
                      >
                        <small style={{ fontSize: 8, letterSpacing: '0.08em', textTransform: 'uppercase', opacity: 0.8 }}>Juma Agro</small>
                        <b style={{ fontSize: 14, fontWeight: 750, letterSpacing: '-0.01em' }}>{rel.name.replace('®', '').replace('+', '').trim()}</b>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-5 flex flex-col flex-1 bg-white">
                      <h3 className="m-0 mb-2 text-[19px] font-[650] tracking-[-0.01em] text-[#1A1A1A] leading-snug">{rel.name}</h3>
                      <p className="m-0 text-[14.5px] text-[#5A5A57] leading-[1.5] flex-1 mb-4">{rel.desc}</p>
                      <div className="self-end flex items-center justify-center h-[42px] w-[42px] rounded-full border border-black/[0.18] text-[#1A1A1A]/60 group-hover:bg-[#004B26] group-hover:border-[#004B26] group-hover:text-white transition-all">
                        <ArrowIcon />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </Container>
          </section>
        )}

        {/* CTA Final */}
        <section
          data-section
          className="relative overflow-hidden text-white text-center"
          style={{ backgroundColor: '#004B26', paddingBlock: 'clamp(100px,10vw,160px)' }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(70% 80% at 50% 50%, rgba(240,226,122,.18), transparent 70%)' }}
          />
          <Container>
            <div className="relative flex flex-col items-center gap-6">
              <div data-section-kicker><Eyebrow dark icon={Rocket}>Próximo passo</Eyebrow></div>
              <h2
                data-section-title
                className="text-white m-0 leading-[0.95] tracking-[-0.035em] text-balance"
                style={{ fontSize: 'clamp(56px,8vw,140px)', fontWeight: 750 }}
              >
                Quer {nameShort} na{' '}
                <em style={{ fontStyle: 'italic', fontWeight: 400, color: '#F0E27A', fontFamily: 'Georgia, serif' }}>sua lavoura?</em>
              </h2>
              <p data-section-lede className="text-white/78 max-w-[50ch] leading-[1.5] text-[19px] m-0">
                Fale com o time agronômico e monte o manejo certo para sua cultura e fase.
              </p>
              <a
                data-animate-content
                href={WHATSAPP}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 h-[54px] px-[26px] rounded-full text-[15px] font-semibold text-[#1A1A1A] bg-[#F0E27A] hover:bg-[#e8d96a] transition-all hover:-translate-y-px"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="w-4 h-4">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
                Falar no WhatsApp · (19) 99964-8186
              </a>
            </div>
          </Container>
        </section>
      </div>

      {/* Global animation for the seal */}
      <style>{`@keyframes pdp-seal-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
