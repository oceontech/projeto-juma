/**
 * Roda as migrations do Payload antes do build, só no deploy de produção da
 * Vercel. Previews e builds locais pulam: o banco do preview é o mesmo de
 * produção, e uma migration de branch em teste não deve alterá-lo.
 */
import { spawnSync } from 'node:child_process'

if (process.env.VERCEL_ENV !== 'production') {
  console.log('[migrate] pulado: não é deploy de produção na Vercel')
  process.exit(0)
}

const result = spawnSync('npx', ['tsx', 'scripts/payload-cli.mjs', 'migrate'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, NODE_OPTIONS: '--no-deprecation' },
})
process.exit(result.status ?? 1)
