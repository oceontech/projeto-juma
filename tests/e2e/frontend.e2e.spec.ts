import { test, expect } from '@playwright/test'

test.describe('Frontend', () => {
  test('home abre em pt-BR com o título do site', async ({ page }) => {
    await page.goto('/pt-BR')

    await expect(page).toHaveTitle(/Juma-Agro/)
    await expect(page.locator('main')).toBeVisible()
  })

  test('páginas principais respondem sem erro', async ({ page }) => {
    for (const path of ['/pt-BR/produtos', '/pt-BR/culturas', '/pt-BR/materias', '/pt-BR/contato']) {
      const response = await page.goto(path)
      expect(response?.status(), path).toBeLessThan(400)
    }
  })
})
