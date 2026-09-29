import * as migration_20260928_154008_inicial from './20260928_154008_inicial';
import * as migration_20260928_163241_materias_campos from './20260928_163241_materias_campos';
import * as migration_20260928_163302_materias_limpeza from './20260928_163302_materias_limpeza';
import * as migration_20260928_173058_produtos_campos from './20260928_173058_produtos_campos';
import * as migration_20260928_173128_produtos_limpeza from './20260928_173128_produtos_limpeza';
import * as migration_20260928_180201_culturas_campos from './20260928_180201_culturas_campos';
import * as migration_20260928_180341_culturas_limpeza from './20260928_180341_culturas_limpeza';
import * as migration_20260928_194610_sem_autosave from './20260928_194610_sem_autosave';
import * as migration_20260929_161247_configuracoes_contato from './20260929_161247_configuracoes_contato';
import * as migration_20260929_161325_sem_horario_antigo from './20260929_161325_sem_horario_antigo';
import * as migration_20260929_161521_paginas_rascunho from './20260929_161521_paginas_rascunho';
import * as migration_20260929_161549_paginas_sem_seo from './20260929_161549_paginas_sem_seo';

export const migrations = [
  {
    up: migration_20260928_154008_inicial.up,
    down: migration_20260928_154008_inicial.down,
    name: '20260928_154008_inicial',
  },
  {
    up: migration_20260928_163241_materias_campos.up,
    down: migration_20260928_163241_materias_campos.down,
    name: '20260928_163241_materias_campos',
  },
  {
    up: migration_20260928_163302_materias_limpeza.up,
    down: migration_20260928_163302_materias_limpeza.down,
    name: '20260928_163302_materias_limpeza',
  },
  {
    up: migration_20260928_173058_produtos_campos.up,
    down: migration_20260928_173058_produtos_campos.down,
    name: '20260928_173058_produtos_campos',
  },
  {
    up: migration_20260928_173128_produtos_limpeza.up,
    down: migration_20260928_173128_produtos_limpeza.down,
    name: '20260928_173128_produtos_limpeza',
  },
  {
    up: migration_20260928_180201_culturas_campos.up,
    down: migration_20260928_180201_culturas_campos.down,
    name: '20260928_180201_culturas_campos',
  },
  {
    up: migration_20260928_180341_culturas_limpeza.up,
    down: migration_20260928_180341_culturas_limpeza.down,
    name: '20260928_180341_culturas_limpeza',
  },
  {
    up: migration_20260928_194610_sem_autosave.up,
    down: migration_20260928_194610_sem_autosave.down,
    name: '20260928_194610_sem_autosave',
  },
  {
    up: migration_20260929_161247_configuracoes_contato.up,
    down: migration_20260929_161247_configuracoes_contato.down,
    name: '20260929_161247_configuracoes_contato',
  },
  {
    up: migration_20260929_161325_sem_horario_antigo.up,
    down: migration_20260929_161325_sem_horario_antigo.down,
    name: '20260929_161325_sem_horario_antigo',
  },
  {
    up: migration_20260929_161521_paginas_rascunho.up,
    down: migration_20260929_161521_paginas_rascunho.down,
    name: '20260929_161521_paginas_rascunho',
  },
  {
    up: migration_20260929_161549_paginas_sem_seo.up,
    down: migration_20260929_161549_paginas_sem_seo.down,
    name: '20260929_161549_paginas_sem_seo'
  },
];
