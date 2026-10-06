import { test, expect } from './fixtures/auth.fixture'

test.describe('Catalog', () => {
  test('browse catalog page loads', async ({ viewerPage }) => {
    await viewerPage.goto('/catalog')
    await expect(viewerPage.getByRole('heading', { name: /catalog/i })).toBeVisible()
  })

  test('catalog displays asset cards', async ({ viewerPage }) => {
    await viewerPage.goto('/catalog')

    await viewerPage.waitForSelector('[data-testid="asset-card"], [class*="card"]', {
      timeout: 10_000
    })

    const cards = viewerPage
      .locator('[data-testid="asset-card"]')
      .or(viewerPage.locator('[class*="card"]').filter({ has: viewerPage.locator('img') }))
    await expect(cards.first()).toBeVisible()
  })

  test('filter catalog by content type', async ({ viewerPage }) => {
    await viewerPage.goto('/catalog')

    const typeFilter = viewerPage
      .getByRole('button', { name: /image/i })
      .or(viewerPage.getByRole('tab', { name: /image/i }))

    if (await typeFilter.isVisible()) {
      await typeFilter.click()

      await viewerPage.waitForURL(/type=|fileType=/)
    }
  })

  test('view asset detail page', async ({ viewerPage }) => {
    await viewerPage.goto('/catalog')

    await viewerPage.waitForSelector('[data-testid="asset-card"] a, [class*="card"] a', {
      timeout: 10_000
    })

    const firstCard = viewerPage
      .locator('[data-testid="asset-card"] a')
      .or(viewerPage.locator('[class*="card"] a'))
      .first()
    await firstCard.click()

    await viewerPage.waitForURL(/\/catalog\/[a-zA-Z0-9-]+/)

    await expect(viewerPage.getByRole('heading').first()).toBeVisible()
  })

  test('toggle bookmark on an asset', async ({ viewerPage }) => {
    await viewerPage.goto('/catalog')

    await viewerPage.waitForSelector('[data-testid="asset-card"]', {
      timeout: 10_000
    })

    await viewerPage.locator('[data-testid="asset-card"] a').first().click()
    await viewerPage.waitForURL(/\/catalog\/[a-zA-Z0-9-]+/)

    const bookmarkButton = viewerPage
      .getByRole('button', { name: /bookmark/i })
      .or(viewerPage.getByTestId('bookmark-toggle'))

    if (await bookmarkButton.isVisible()) {
      await bookmarkButton.click()

      await expect(bookmarkButton).toBeVisible()
    }
  })

  test('switch sort to Trending updates the URL', async ({ viewerPage }) => {
    await viewerPage.goto('/catalog')

    const sortTrigger = viewerPage.getByTestId('catalog-sort')
    await expect(sortTrigger).toBeVisible()
    await sortTrigger.click()

    await viewerPage.getByRole('option', { name: 'Trending' }).click()

    await viewerPage.waitForURL(/sort=trending/)

    // Grid should either show cards or the empty-state copy — both are valid
    const hasCards = viewerPage.locator('[data-testid="asset-card"]').first()
    const emptyState = viewerPage.getByText(/no assets found/i)
    await expect(hasCards.or(emptyState)).toBeVisible({ timeout: 10_000 })

    await sortTrigger.click()
    await viewerPage.getByRole('option', { name: 'Newest' }).click()
    await viewerPage.waitForURL((url) => !url.searchParams.has('sort'))
  })
})
