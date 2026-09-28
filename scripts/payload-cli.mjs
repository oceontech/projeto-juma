/**
 * CLI do Payload carregado pelo tsx em modo global.
 *
 * O `payload` padrão usa `tsImport` com namespace, que no Windows com Node 24
 * falha ao resolver `node:crypto` (ENOENT em "node:crypto?tsx-namespace=…")
 * dentro do migrate:create. Rodar o mesmo bin com `tsx` global evita isso.
 * Uso: npx tsx scripts/payload-cli.mjs <comando> (ver scripts migrate* no package.json).
 */
// Caminho do arquivo, não do pacote: `payload/dist/bin` não está nos "exports".
const { bin } = await import(new URL('../node_modules/payload/dist/bin/index.js', import.meta.url).href)
await bin()
