import * as migration_20260928_154008_inicial from './20260928_154008_inicial';
import * as migration_20260928_163241_materias_campos from './20260928_163241_materias_campos';
import * as migration_20260928_163302_materias_limpeza from './20260928_163302_materias_limpeza';

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
    name: '20260928_163302_materias_limpeza'
  },
];
