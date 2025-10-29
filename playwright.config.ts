import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './tests', // 👈 le dossier que Playwright va scanner
    use: {
        baseURL: 'http://localhost:5173', // ton app locale
        headless: true,
    },
    projects: [
        { name: 'Desktop Chrome', use: { ...devices['Desktop Chrome'] } },
        { name: 'Mobile Safari', use: { ...devices['iPhone 13'] } },
    ],
});
