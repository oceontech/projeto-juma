export interface ArticleSection {
  title?: string;
  content: string[];
}

export interface ArticleTranslation {
  title: string;
  subtitle: string;
  author: string;
  introduction: string;
  sections: ArticleSection[];
  quote?: string;
}

export interface Article {
  id: string;
  category: 'manejo' | 'nutricao' | 'pecuaria' | 'pesquisa' | 'sustentabilidade';
  date: string;
  readTime: string;
  image: string;
  color: string;
  translations: Record<'pt-BR' | 'en' | 'es', ArticleTranslation>;
}

export const ARTICLES_DATA: Article[] = [
  {
    id: 'como-reduzir-o-estresse',
    category: 'manejo',
    date: '22 ABR 2026',
    readTime: '10 MIN',
    image: '/materias/capa-destaque.png',
    color: 'from-green-700 to-emerald-950',
    translations: {
      'pt-BR': {
        title: 'Como reduzir o estresse da lavoura na seca — sem perder produtividade.',
        subtitle: 'Três decisões de manejo nutricional que mantêm sua lavoura ativa quando o céu fecha. Um guia prático com base em ensaios reais conduzidos com produtores em MT, GO e BA.',
        author: 'Eng. Agrônomo Marcos Silva',
        introduction: 'O estresse hídrico é um dos principais fatores que limitam a produtividade nas lavouras brasileiras. No entanto, o uso estratégico de bioestimulantes e aminoácidos pode preparar a fisiologia da planta para tolerar períodos prolongados de seca.',
        sections: [
          {
            title: '1. O papel dos osmoprotetores no metabolismo vegetal',
            content: [
              'Quando a planta entra em estresse hídrico, sua primeira reação é fechar os estômatos para evitar a perda de água por transpiração. Embora essa seja uma medida de sobrevivência eficaz, ela interrompe a fotossíntese e a absorção de nutrientes, travando o crescimento.',
              'A aplicação foliar de aminoácidos específicos atua como osmoprotetor celular. Eles mantêm a pressão interna das células e o fluxo metabólico ativo, permitindo que a planta continue seu ciclo mesmo sob condições adversas de umidade.'
            ]
          },
          {
            title: '2. Estimulando o desenvolvimento radicular profundo',
            content: [
              'Uma planta só resiste à seca se conseguir buscar água nas camadas mais profundas do solo. Nutrientes que estimulam a divisão celular inicial e o enraizamento vigoroso são fundamentais nas primeiras fases da lavoura.',
              'Tratamentos que combinam fósforo de alta absorção e indutores de enraizamento criam um sistema radicular robusto, garantindo acesso à umidade subsuperficial nos períodos críticos de estiagem.'
            ]
          },
          {
            title: '3. Ação antioxidante e manutenção da clorofila',
            content: [
              'A seca gera estresse oxidativo, acumulando radicais livres que danificam as células foliares e causam o amarelamento. Nutrientes e aminoácidos com ação antioxidante combatem esse desgaste, mantendo as folhas verdes e produtivas por mais tempo.',
              'Nos ensaios conduzidos pela nossa equipe técnica em fazendas parceiras, lavouras tratadas com nossa tecnologia de bioestimulação apresentaram menor queda de folhas e mantiveram o potencial produtivo acima da média regional.'
            ]
          }
        ],
        quote: 'A produtividade na seca não é definida apenas pela quantidade de chuva, mas pela resiliência e preparo fisiológico que a planta possui quando o estresse começa.'
      },
      'en': {
        title: 'How to reduce crop stress during drought — without losing productivity.',
        subtitle: 'Three nutritional management decisions that keep your crops active when the weather turns. A practical guide based on real trials with growers in MT, GO, and BA.',
        author: 'Marcos Silva, Agronomist',
        introduction: 'Water stress is one of the main factors limiting productivity in Brazilian crops. However, the strategic use of biostimulants and amino acids can prime plant physiology to tolerate prolonged dry spells.',
        sections: [
          {
            title: '1. The role of osmoprotectants in plant metabolism',
            content: [
              'When a plant enters water stress, its initial response is stomatal closure to prevent water loss through transpiration. While effective for survival, this halts photosynthesis and nutrient uptake, stopping growth.',
              'Foliar application of specific amino acids acts as a cellular osmoprotectant. They maintain cell turgor and metabolic flow, allowing the plant to continue its cycle even under adverse moisture conditions.'
            ]
          },
          {
            title: '2. Stimulating deep root development',
            content: [
              'A plant can only withstand drought if it can tap water from deep soil layers. Nutrients that stimulate initial cell division and vigorous rooting are fundamental during the early stages of the crop.',
              'Treatments combining highly available phosphorus and rooting inductors create a robust root system, ensuring access to subsurface moisture during critical dry spells.'
            ]
          },
          {
            title: '3. Antioxidant action and chlorophyll maintenance',
            content: [
              'Drought generates oxidative stress, accumulating free radicals that damage leaf cells and cause yellowing. Nutrients and amino acids with antioxidant action combat this wear, keeping leaves green and productive longer.',
              'In trials conducted by our technical team on partner farms, crops treated with our biostimulation technology showed less leaf drop and maintained yield potential above regional averages.'
            ]
          }
        ],
        quote: 'Productivity during drought is not defined only by rainfall, but by the physiological resilience and preparation the plant has before the stress begins.'
      },
      'es': {
        title: 'Cómo reducir el estrés del cultivo en la sequía — sin perder productividad.',
        subtitle: 'Tres decisiones de manejo nutricional que mantienen su cultivo activo cuando el cielo se cierra. Una guía práctica basada en ensayos reales con productores en MT, GO y BA.',
        author: 'Marcos Silva, Ing. Agrónomo',
        introduction: 'El estrés hídrico es uno de los principales factores que limitan la productividad en los cultivos brasileños. Sin embargo, el uso estratégico de bioestimulantes y aminoácidos puede preparar la fisiología de la planta para tolerar períodos prolongados de sequía.',
        sections: [
          {
            title: '1. El papel de los osmoprotectores en el metabolismo vegetal',
            content: [
              'Cuando la planta entra en estrés hídrico, su primera reacción es cerrar los estomas para evitar la pérdida de agua por transpiración. Aunque esta es una medida de supervivencia eficaz, detiene la fotosíntesis y la absorción de nutrientes, deteniendo el crecimiento.',
              'La aplicación foliar de aminoácidos específicos actúa como osmoprotector celular. Mantienen la presión celular interna y el flujo metabólico activo, permitiendo que la planta continúe su ciclo incluso en condiciones adversas de humedad.'
            ]
          },
          {
            title: '2. Estimulando el desarrollo radicular profundo',
            content: [
              'Una planta solo resiste la sequía si logra buscar agua en las capas más profundas del suelo. Los nutrientes que estimulan la división celular inicial y el enraizamento vigoroso son fundamentales en las primeras fases del cultivo.',
              'Los tratamientos que combinan fósforo de alta absorción e inductores de enraizamiento crean un sistema radicular robusto, asegurando el acceso a la humedad subsuperficial en los períodos críticos de sequía.'
            ]
          },
          {
            title: '3. Acción antioxidante y mantenimiento de la clorofila',
            content: [
              'La sequía genera estrés oxidativo, acumulando radicales libres que dañan las células foliares y causan amarillamiento. Los nutrientes y aminoácidos con acción antioxidante combaten este desgaste, manteniendo las hojas verdes y productivas por más tiempo.',
              'En los ensayos realizados por nuestro equipo técnico en fincas asociadas, los cultivos tratados con nuestra tecnología de bioestimulación presentaron menor caída de hojas y mantuvieron el potencial productivo por encima del promedio regional.'
            ]
          }
        ],
        quote: 'La productividad en la sequía no se define solo por la cantidad de lluvia, sino por la resiliencia y preparación fisiológica que posee la planta cuando comienza el estrés.'
      }
    }
  },
  {
    id: 'nutricao-fase-certa',
    category: 'nutricao',
    date: '15 ABR 2026',
    readTime: '6 MIN',
    image: '/materias/nutricao-fase-certa.png',
    color: 'from-green-600 to-green-800',
    translations: {
      'pt-BR': {
        title: 'Nutrição na fase certa: o que muda na produtividade da soja',
        subtitle: 'Como o cronograma exato de fornecimento de macros e micronutrientes determina o sucesso do enchimento de grãos na oleaginosa.',
        author: 'Dr. Lucas Mendes',
        introduction: 'Para alcançar altos patamares de produtividade na cultura da soja, não basta aplicar a quantidade correta de fertilizantes. O momento da aplicação é o verdadeiro diferencial para o melhor aproveitamento pela planta.',
        sections: [
          {
            title: 'O timing ideal na divisão de nutrientes',
            content: [
              'A planta da soja passa por diferentes fases fenológicas, cada uma com exigências nutricionais específicas. Durante o estágio vegetativo (V4 a V6), o foco deve ser no desenvolvimento do sistema radicular e na estruturação do caule.',
              'Já no período reprodutivo, especialmente no início do florescimento (R1 a R2) e no enchimento de grãos (R5), a demanda por micronutrientes como Boro, Zinco e Manganês atinge o pico, impactando diretamente o peso final dos grãos.'
            ]
          }
        ],
        quote: 'Nutrir a soja na fase certa é garantir que o investimento em fertilização retorne em sacas adicionais colhidas.'
      },
      'en': {
        title: 'Nutrition at the right stage: what changes in soy productivity',
        subtitle: 'How the exact schedule of macro and micronutrient supply determines the success of grain filling in soybeans.',
        author: 'Dr. Lucas Mendes',
        introduction: 'To achieve high productivity in soybean crops, applying the correct amount of fertilizers is not enough. The timing of application is the real key to plant utilization.',
        sections: [
          {
            title: 'The ideal timing in nutrient splitting',
            content: [
              'The soybean plant goes through different phenological stages, each with specific nutritional requirements. During the vegetative stage (V4 to V6), the focus must be on root system development and stem structure.',
              'In the reproductive period, especially at the start of flowering (R1 to R2) and pod filling (R5), the demand for micronutrients like Boron, Zinc, and Manganese peaks, directly impacting final grain weight.'
            ]
          }
        ],
        quote: 'Nourishing soy at the right stage is ensuring that the investment in fertilization returns in additional bags harvested.'
      },
      'es': {
        title: 'Nutrición en la etapa correcta: qué cambia en la productividad de la soja',
        subtitle: 'Cómo el cronograma exacto de suministro de macro y micronutrientes determina el éxito del llenado de granos en la soja.',
        author: 'Dr. Lucas Mendes',
        introduction: 'Para lograr altos niveles de productividad en el cultivo de soja, no basta con aplicar la cantidad correcta de fertilizantes. El momento de la aplicación es la verdadera diferencia para el mejor aprovechamiento de la planta.',
        sections: [
          {
            title: 'El momento ideal en la división de nutrientes',
            content: [
              'La planta de soja pasa por diferentes etapas fenológicas, cada una con exigencias nutricionales específicas. Durante la etapa vegetativa (V4 a V6), el foco debe estar en el desarrollo del sistema radicular y la estructuración del tallo.',
              'En el período reproductivo, especialmente al inicio de la floración (R1 a R2) y en el llenado de granos (R5), la demanda de micronutrientes como Boro, Zinc y Manganeso alcanza su punto máximo, afectando directamente el peso final de los granos.'
            ]
          }
        ],
        quote: 'Nutrir la soja en la etapa correcta es garantizar que la inversión en fertilización regrese en sacos adicionales cosechados.'
      }
    }
  },
  {
    id: 'manejo-pastagem',
    category: 'pecuaria',
    date: '02 ABR 2026',
    readTime: '8 MIN',
    image: '/materias/manejo-pastagem.png',
    color: 'from-amber-600 to-orange-850',
    translations: {
      'pt-BR': {
        title: 'Manejo de pastagem: recuperação e ganho de peso',
        subtitle: 'Como a adubação foliar e o manejo rotacionado elevam a capacidade de suporte da fazenda e aceleram o abate do rebanho.',
        author: 'Zootecnista Roberto Ramos',
        introduction: 'A pastagem é a base da pecuária de corte eficiente. Recuperar pastos degradados através de fertilização estratégica melhora a qualidade da forragem e otimiza o ganho médio diário (GMD) do rebanho.',
        sections: [
          {
            title: 'Fertilização foliar em pastos estabelecidos',
            content: [
              'Muitas vezes negligenciada, a nutrição foliar do capim acelera a rebrota após a saída dos animais, encurtando o período de descanso do piquete e melhorando os teores de proteína bruta na folha verde.',
              'Com pastos nutridos, o produtor aumenta a taxa de lotação por hectare e garante uma engorda consistente dos animais mesmo nos meses de transição.'
            ]
          }
        ],
        quote: 'O boi engorda pelo capim que come. Um pasto bem nutrido é o segredo para encurtar o ciclo de produção animal.'
      },
      'en': {
        title: 'Pasture management: recovery and weight gain',
        subtitle: 'How foliar fertilization and rotational grazing raise farm stocking rates and accelerate cattle finishing.',
        author: 'Roberto Ramos, Animal Scientist',
        introduction: 'Pasture is the foundation of efficient beef cattle production. Recovering degraded pastures through strategic fertilization improves forage quality and optimizes average daily gain (ADG) of the herd.',
        sections: [
          {
            title: 'Foliar fertilization in established pastures',
            content: [
              'Often overlooked, foliar nutrition of the grass accelerates regrowth after cattle leave, shortening paddock rest periods and improving crude protein content in the green leaf.',
              'With nourished pastures, growers increase stocking rates per hectare and ensure consistent cattle finishing even in transition months.'
            ]
          }
        ],
        quote: 'Cattle fatten through the grass they eat. A well-nourished pasture is the secret to shortening the animal production cycle.'
      },
      'es': {
        title: 'Manejo de pasturas: recuperación y ganancia de peso',
        subtitle: 'Cómo la fertilización foliar y el pastoreo rotativo elevan la capacidad de carga del campo y aceleran el engorde del ganado.',
        author: 'Roberto Ramos, Zootecnista',
        introduction: 'La pastura es la base de la ganadería de carne eficiente. Recuperar pasturas degradadas mediante fertilización estratégica mejora la calidad del forraje y optimiza la ganancia diaria promedio (GDP) del ganado.',
        sections: [
          {
            title: 'Fertilización foliar en pasturas establecidas',
            content: [
              'A menudo descuidada, la nutrición foliar del pasto acelera el rebrote después de la salida de los animales, acortando el período de descanso del potrero y mejorando los niveles de proteína bruta en la hoja verde.',
              'Con pasturas nutridas, el productor aumenta la carga animal por hectárea y garantiza un engorde constante de los animales incluso en los meses de transición.'
            ]
          }
        ],
        quote: 'El ganado engorda por el pasto que come. Una pastura bien nutrida es el secreto para acortar el ciclo de producción animal.'
      }
    }
  },
  {
    id: 'tratamento-sementes',
    category: 'manejo',
    date: '25 MAR 2026',
    readTime: '5 MIN',
    image: '/materias/tratamento-sementes.png',
    color: 'from-blue-600 to-indigo-850',
    translations: {
      'pt-BR': {
        title: 'Tratamento de sementes: o que esperar de um arranque vigoroso',
        subtitle: 'A base da produtividade começa na germinação. Entenda os benefícios dos micronutrientes e aminoácidos aplicados diretamente nas sementes.',
        author: 'Eng. Agrônomo Gabriel Santos',
        introduction: 'O tratamento de sementes (TS) deixou de ser apenas uma medida de proteção contra pragas e doenças para se tornar um veículo fundamental de nutrição inicial.',
        sections: [
          {
            title: 'Estimulando as primeiras raízes',
            content: [
              'O fornecimento de Cobalto, Molibdênio e Zinco junto com aminoácidos ativa as enzimas de germinação, acelerando a emergência das plantas e garantindo um stand uniforme no campo.',
              'O enraizamento profundo logo nos primeiros dias protege a plântula de pequenos veranicos, garantindo a absorção de nutrientes vitais nas camadas iniciais.'
            ]
          }
        ],
        quote: 'Uma semente bem tratada e nutrida define a uniformidade e o potencial de produtividade de todo o talhão.'
      },
      'en': {
        title: 'Seed treatment: what to expect from a vigorous start',
        subtitle: 'The foundation of yield begins at germination. Understand the benefits of micronutrients and amino acids applied directly to seeds.',
        author: 'Gabriel Santos, Agronomist',
        introduction: 'Seed treatment (ST) has evolved from a simple pest and disease protection measure into an essential vehicle for early-stage nutrition.',
        sections: [
          {
            title: 'Stimulating the first roots',
            content: [
              'Supplying Cobalt, Molybdenum, and Zinc alongside amino acids activates germination enzymes, accelerating plant emergence and securing a uniform stand in the field.',
              'Deep rooting in the first few days protects the seedling from dry spells, ensuring uptake of vital nutrients in initial soil layers.'
            ]
          }
        ],
        quote: 'A well-treated and nourished seed defines the uniformity and yield potential of the entire field.'
      },
      'es': {
        title: 'Tratamiento de semillas: qué esperar de un inicio vigoroso',
        subtitle: 'La base de la productividad comienza en la germinación. Entenda los beneficios de los micronutrientes y aminoácidos aplicados directamente en las semillas.',
        author: 'Gabriel Santos, Ing. Agrónomo',
        introduction: 'El tratamiento de semillas (TS) ha dejado de ser solo una medida de protección contra plagas y enfermedades para convertirse en un vehículo fundamental de nutrición inicial.',
        sections: [
          {
            title: 'Estimulando las primeras raíces',
            content: [
              'El suministro de Cobalto, Molibdeno y Zinc junto con aminoácidos activa las enzimas de germinación, acelerando la emergencia de las plantas y garantizando un stand uniforme en el campo.',
              'El enraizamiento profundo en los primeros días protege a la plântula de pequeñas sequías, asegurando la absorción de nutrientes vitais en las capas iniciales.'
            ]
          }
        ],
        quote: 'Una semilla bien tratada y nutrida define la uniformidad y el potencial de rendimiento de todo el lote.'
      }
    }
  },
  {
    id: 'aminoacidos-foliares',
    category: 'pesquisa',
    date: '18 MAR 2026',
    readTime: '7 MIN',
    image: '/materias/aminoacidos-foliares.png',
    color: 'from-purple-600 to-purple-950',
    translations: {
      'pt-BR': {
        title: 'Aminoácidos foliares: como funciona a absorção na planta',
        subtitle: 'A ciência por trás da nutrição foliar avançada e o impacto celular da aplicação direta de aminoácidos livres.',
        author: 'Dra. Fernanda Costa',
        introduction: 'O uso de aminoácidos foliares tem crescido rapidamente no manejo agrícola. Diferente dos fertilizantes convencionais, os aminoácidos livres entram diretamente nas vias metabólicas da planta sem gastar energia extra.',
        sections: [
          {
            title: 'Absorção cuticular e estomática',
            content: [
              'Os aminoácidos aplicados via folha conseguem penetrar na planta tanto através da cutícula quanto das aberturas estomáticas. Por terem tamanho molecular reduzido, sua absorção ocorre de forma rápida e eficiente.',
              'Uma vez dentro das células vegetais, eles são direcionados para a síntese de proteínas específicas que ajudam a planta a tolerar estresses climáticos, fitotoxicidade de defensivos e a impulsionar o crescimento geral.'
            ]
          }
        ],
        quote: 'Ao aplicar aminoácidos foliares livres, poupamos a energia metabólica da planta, permitindo que ela expresse seu potencial produtivo máximo.'
      },
      'en': {
        title: 'Foliar amino acids: how plant absorption works',
        subtitle: 'The science behind advanced foliar nutrition and the cellular impact of directly applying free amino acids.',
        author: 'Dr. Fernanda Costa',
        introduction: 'The use of foliar amino acids has grown rapidly in agricultural management. Unlike conventional fertilizers, free amino acids directly enter plant metabolic pathways without requiring extra energy expenditure.',
        sections: [
          {
            title: 'Cuticular and stomatal uptake',
            content: [
              'Foliar-applied amino acids penetrate the plant through both the cuticle and stomatal openings. Due to their small molecular size, absorption occurs quickly and efficiently.',
              'Once inside plant cells, they are targeted to the synthesis of specific proteins that help the plant withstand environmental stresses, herbicide phytotoxicity, and boost overall growth.'
            ]
          }
        ],
        quote: 'By applying free foliar amino acids, we spare the plant metabolic energy, allowing it to express its maximum yield potential.'
      },
      'es': {
        title: 'Aminoácidos foliares: cómo funciona la absorción en la planta',
        subtitle: 'La ciencia detrás de la nutrición foliar avanzada y el impacto celular de la aplicación directa de aminoácidos libres.',
        author: 'Dra. Fernanda Costa',
        introduction: 'El uso de aminoácidos foliares ha crecido rápidamente en el manejo agrícola. A diferencia de los fertilizantes convencionales, los aminoácidos libres entran directamente en las vías metabólicas de la planta sin gastar energía adicional.',
        sections: [
          {
            title: 'Absorción cuticular y estomática',
            content: [
              'Los aminoácidos aplicados vía foliar logran penetrar en la planta tanto a través de la cutícula como de las aberturas estomáticas. Al tener un tamaño molecular reducido, su absorción ocurre de forma rápida y eficiente.',
              'Una vez dentro de las células vegetales, son dirigidos a la síntese de proteínas específicas que ayudan a la planta a tolerar estreses climáticos, fitotoxicidade de defensivos e a impulsionar o crescimento geral.'
            ]
          }
        ],
        quote: 'Al aplicar aminoácidos foliares libres, ahorramos la energía metabólica de la planta, permitiendo que exprese su máximo potencial productivo.'
      }
    }
  },
  {
    id: 'calda-eficiente',
    category: 'sustentabilidade',
    date: '11 MAR 2026',
    readTime: '4 MIN',
    image: '/materias/calda-eficiente.png',
    color: 'from-teal-600 to-emerald-950',
    translations: {
      'pt-BR': {
        title: 'Calda eficiente, menos deriva: a contribuição da tecnologia de aplicação',
        subtitle: 'Como a escolha correta de adjuvantes e o preparo da calda evitam perdas de pulverização por evaporação e vento.',
        author: 'Eng. Agrônomo Daniel Barbosa',
        introduction: 'A eficiência de um tratamento fitossanitário ou nutricional depende diretamente da qualidade da aplicação. Adjuvantes especializados otimizam a viscosidade e o tamanho das gotas, reduzindo perdas e deriva.',
        sections: [
          {
            title: 'Minimizando perdas e aumentando a cobertura',
            content: [
              'O vento excessivo e a umidade relativa baixa são os principais inimigos da pulverização. O uso de adjuvantes que estabilizam o pH da calda e reduzem as gotas finas evita o desvio das gotas pelo vento (deriva) e a evaporação precoce no trajeto até o alvo.',
              'Dessa forma, garante-se uma cobertura homogênea nas folhas centrais e baixeiras, otimizando a eficiência operacional e reduzindo o desperdício.'
            ]
          }
        ],
        quote: 'Aplicar com tecnologia de ponta é garantir que o defensivo ou nutriente chegue exatamente onde deve atuar: no alvo.'
      },
      'en': {
        title: 'Efficient spray mix, less drift: the contribution of application technology',
        subtitle: 'How correct adjuvant selection and spray mix preparation prevent application losses from evaporation and wind.',
        author: 'Daniel Barbosa, Agronomist',
        introduction: 'The efficacy of any crop protection or nutritional treatment depends directly on application quality. Specialized adjuvants optimize viscosity and droplet size, reducing losses and drift.',
        sections: [
          {
            title: 'Minimizing losses and increasing coverage',
            content: [
              'Excessive wind and low relative humidity are the primary enemies of spraying. Using adjuvants that stabilize spray mix pH and reduce fine droplets prevents wind drift and early evaporation on the way to the target.',
              'This guarantees uniform coverage on middle and lower leaves, optimizing operational efficiency and reducing waste.'
            ]
          }
        ],
        quote: 'Spraying with advanced technology is ensuring that crop protection or nutrients reach exactly where they should act: the target.'
      },
      'es': {
        title: 'Mezcla eficiente, menos deriva: la contribución de la tecnología de aplicación',
        subtitle: 'Cómo la selección correcta de coadyuvantes y la preparación de la mezcla evitan pérdidas de aplicación por evaporación y viento.',
        author: 'Daniel Barbosa, Ing. Agrónomo',
        introduction: 'La eficiencia de un tratamiento fitosanitario o nutricional depende directamente de la calidad de la aplicación. Coadyuvantes especializados optimizan la viscosidad y el tamaño de gota, reduciendo pérdidas y deriva.',
        sections: [
          {
            title: 'Minimizando pérdidas y aumentando el mojado',
            content: [
              'El viento excesivo y la baja humedad relativa son los principales enemigos de la pulverización. El uso de coadyuvantes que estabilizan el pH de la mezcla y reducen las gotas finas evita la deriva por viento y la evaporación temprana en el trayecto al objetivo.',
              'De esta forma, se garantiza un mojado homogéneo en las hojas medias e inferiores, optimizando la eficiencia operativa y reduciendo el desperdicio.'
            ]
          }
        ],
        quote: 'Aplicar con tecnología avanzada es asegurar que el fitosanitario o nutriente llegue exactamente a donde debe actuar: el objetivo.'
      }
    }
  },
  {
    id: 'floracao-cafe',
    category: 'nutricao',
    date: '04 MAR 2026',
    readTime: '6 MIN',
    image: '/materias/floracao-cafe.png',
    color: 'from-green-600 to-green-950',
    translations: {
      'pt-BR': {
        title: 'Floração do café: por que ela define metade da sua safra',
        subtitle: 'Como a indução floral e a retenção de chumbinhos impactam diretamente o rendimento de sacas na cultura do café.',
        author: 'Eng. Agrônoma Patricia Lima',
        introduction: 'A florada do café é um dos eventos mais belos e críticos da cultura. Nela, define-se o número de nós produtivos e, consequentemente, a carga de frutos da safra.',
        sections: [
          {
            title: 'Nutrição estratégica pré e pós-florada',
            content: [
              'Fornecer Boro, Cálcio e aminoácidos no período de pré-florada favorece a formação de flores férteis e a polinização vigorosa. Após a queda das pétalas, o foco passa a ser a retenção dos chumbinhos (pequenos frutos recém-formados).',
              'Essa nutrição reduz o abortamento natural de frutos, assegurando que o maior número possível de flores se converta em grãos maduros de café de alta qualidade.'
            ]
          }
        ],
        quote: 'Uma florada uniforme e bem protegida é o primeiro e mais importante degrau para um café de alta produtividade e bebida superior.'
      },
      'en': {
        title: 'Coffee flowering: why it defines half of your harvest',
        subtitle: 'How floral induction and cherry retention directly impact the bag yield in coffee cultivation.',
        author: 'Patricia Lima, Agronomist',
        introduction: 'Coffee flowering is one of the most beautiful and critical events of the crop. It defines the number of productive nodes and, consequently, the fruit load for the harvest.',
        sections: [
          {
            title: 'Strategic pre and post-flowering nutrition',
            content: [
              'Supplying Boron, Calcium, and amino acids in the pre-flowering phase promotes the formation of fertile flowers and vigorous pollination. After petal fall, the focus shifts to retaining the newly formed cherries.',
              'This nutritional support reduces natural fruit abortion, ensuring that the highest possible number of flowers convert into high-quality mature coffee beans.'
            ]
          }
        ],
        quote: 'A uniform and well-protected flowering is the first and most important step toward high-yield coffee and superior cup quality.'
      },
      'es': {
        title: 'Floración del café: por qué define la mitad de su cosecha',
        subtitle: 'Cómo la inducción floral y la retención de cerezas impactan directamente el rendimiento de sacos en el cultivo de café.',
        author: 'Patricia Lima, Ing. Agrónoma',
        introduction: 'La floración del café es uno de los eventos más bellos y críticos del cultivo. En ella se define el número de nudos productivos y, en consecuencia, la carga de frutos de la zafra.',
        sections: [
          {
            title: 'Nutrición estratégica pre y post-floración',
            content: [
              'El suministro de Boro, Calcio y aminoácidos en la pre-floración favorece la formación de flores fértiles y una polinización vigorosa. Tras la caída de los pétalos, la atención se centra en la retención de las cerezas recién formadas.',
              'Esta nutrición reduce el aborto natural de frutos, asegurando que el mayor número posible de flores se convierta en granos maduros de café de alta qualidade.'
            ]
          }
        ],
        quote: 'Una floración uniforme y bien protegida es el primer y más importante paso hacia un café de alto rendimiento y taza superior.'
      }
    }
  }
];
