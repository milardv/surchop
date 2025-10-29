import { test, expect } from '@playwright/test';

test('la page d’accueil affiche Surchope 💘', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Surchope')).toBeVisible();
});
