import { chromium } from '@playwright/test'
import path from 'path'

const OUT = process.argv[2] || '.'
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
await page.goto('http://localhost:3000/pt-BR/sobre', { waitUntil: 'networkidle', timeout: 90000 })
await page.waitForTimeout(1500)
await page.evaluate(() => document.querySelector('[data-gp-globe]')?.scrollIntoView({ block: 'center' }))
await page.waitForTimeout(2500)
const rect = await page.evaluate(() => {
  const r = document.querySelector('[data-gp-globe]').getBoundingClientRect()
  return { x: r.x, y: r.y, width: r.width, height: r.height }
})
for (let i = 0; i < 3; i++) {
  await page.screenshot({ path: path.join(OUT, `idle2-t${i}.png`), clip: rect })
  await page.waitForTimeout(2800)
}
const sway = await page.evaluate(() =>
  getComputedStyle(document.querySelector('[data-gp-globe]')).getPropertyValue('--globe-sway-px'),
)
console.log('sway atual:', sway)
await browser.close()
console.log('done')
