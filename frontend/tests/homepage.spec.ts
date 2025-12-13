import { test, expect } from '@playwright/test';

test.describe('Strona główna', () => {
  test('wyświetla listę kart aktów', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Co się dzieje w Polsce/);

    const actCards = page.locator('[data-testid="act-card"]');
    await expect(actCards.first()).toBeVisible();

    const firstCardTitle = actCards
      .first()
      .locator('[data-testid="act-title"]');
    await expect(firstCardTitle).toBeVisible();
    expect(await firstCardTitle.textContent()).toBeTruthy();
  });

  test('otwiera modal po kliknięciu na kartę', async ({ page }) => {
    await page.goto('/');

    const actCards = page.locator('[data-testid="act-card"]');
    await actCards.first().click();

    await expect(page.locator('[data-testid="act-modal"]')).toBeVisible();
  });

  test('zamyka modal po kliknięciu przycisku zamknij', async ({ page }) => {
    await page.goto('/');

    const actCards = page.locator('[data-testid="act-card"]');
    await actCards.first().click();

    await expect(page.locator('[data-testid="act-modal"]')).toBeVisible();

    await page.locator('[data-testid="modal-close"]').click();
    await expect(page.locator('[data-testid="act-modal"]')).not.toBeVisible();
  });
});

