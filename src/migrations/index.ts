import * as migration_20260928_154008_inicial from './20260928_154008_inicial';

export const migrations = [
  {
    up: migration_20260928_154008_inicial.up,
    down: migration_20260928_154008_inicial.down,
    name: '20260928_154008_inicial'
  },
];
