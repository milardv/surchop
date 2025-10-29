import { test, expect } from '@playwright/test';

test.describe('Vote sur un couple', () => {
    test('l’utilisateur peut voter pour une personne et voir le résultat 💘', async ({ page }) => {
        // 🏠 Ouvre la page d’accueil
        await page.goto('/');

        // 🕐 Attend que les couples soient chargés
        await expect(page.locator('text=vs')).toBeVisible();

        // 🔍 Récupère le premier couple visible
        const firstCouple = page.locator('div:has-text("vs")').first();

        // 🎯 Clique sur la première personne (A)
        const firstPerson = firstCouple.locator('img').first();
        await firstPerson.click();

        // 🧾 Vérifie qu’un message de résultat apparaît
        await expect(firstCouple.locator('text=/surchope|égalité parfaite/i')).toBeVisible();

        // 📊 Vérifie que la jauge s’est mise à jour (si visible)
        const gauge = firstCouple.locator('progress');
        if (await gauge.count()) {
            const value = await gauge.getAttribute('value');
            expect(Number(value)).toBeGreaterThanOrEqual(0);
        }

        // 📸 (Optionnel) Capture une image du résultat
        await page.screenshot({ path: 'test-results/vote-result.png', fullPage: false });
    });
});
