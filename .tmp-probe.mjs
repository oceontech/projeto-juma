import { chromium } from '@playwright/test'
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
const errors = []
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 200)) })
await page.goto('http://localhost:3000/pt-BR/sobre', { waitUntil: 'networkidle', timeout: 90000 })
await page.evaluate(() => document.querySelector('[data-gp-globe]')?.scrollIntoView({ block: 'center' }))
await page.waitForTimeout(3000)
const info = await page.evaluate(() => {
  const wrap = document.querySelector('[data-gp-globe]')
  const canvas = wrap?.querySelector('canvas')
  return {
    wrapStyleAttr: wrap?.getAttribute('style'),
    canvasParentIsWrap: canvas?.parentElement === wrap,
    canvasParentTag: canvas?.parentElement?.tagName + '.' + (canvas?.parentElement?.getAttribute('style') || ''),
    swayVar: wrap ? getComputedStyle(wrap).getPropertyValue('--globe-sway-px') : null,
  }
})
console.log(JSON.stringify(info, null, 2))
console.log('console errors:', errors.slice(0, 5))
await browser.close()
