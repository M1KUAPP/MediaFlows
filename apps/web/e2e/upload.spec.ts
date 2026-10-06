import { test, expect } from './fixtures/auth.fixture'

test.describe('Upload', () => {
  // Note: upload tests that interact with S3 are skipped in CI.
  // They require a running API with valid AWS credentials.
  const skipInCI = process.env.CI ? test.skip : test

  test('upload page loads for creator', async ({ creatorPage }) => {
    await creatorPage.goto('/creator/upload')
    await expect(creatorPage.getByRole('heading', { name: /upload/i })).toBeVisible()

    await expect(creatorPage.getByText(/drag.*drop|click.*upload|browse/i)).toBeVisible()
  })

  test('upload page is not accessible to viewer', async ({ viewerPage }) => {
    await viewerPage.goto('/creator/upload')

    const url = viewerPage.url()
    expect(url).not.toContain('/creator/upload')
  })

  skipInCI('upload a file and verify it appears in asset library', async ({ creatorPage }) => {
    await creatorPage.goto('/creator/upload')

    const fileInput = creatorPage.locator('input[type="file"]')

    await fileInput.setInputFiles({
      name: 'test-image.png',
      mimeType: 'image/png',
      buffer: Buffer.alloc(100, 0) // Minimal PNG-like buffer for test
    })

    await expect(creatorPage.getByText(/uploading|processing|complete|uploaded/i)).toBeVisible({ timeout: 30_000 })

    await creatorPage.goto('/creator/assets')
    await creatorPage.waitForTimeout(2000) // Allow indexing

    await expect(creatorPage.getByText('test-image')).toBeVisible({ timeout: 10_000 })
  })

  test('creator can view asset library', async ({ creatorPage }) => {
    await creatorPage.goto('/creator/assets')
    await expect(creatorPage.getByRole('heading', { name: /assets|library|my.*assets/i })).toBeVisible()
  })
})
