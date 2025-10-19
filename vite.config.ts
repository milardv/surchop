import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate', // met à jour le service worker automatiquement
            includeAssets: ['favicon.svg', 'favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
            manifest: {
                name: 'Surchope 💘',
                short_name: 'Surchope',
                description: 'Vote qui surchope qui 😏',
                theme_color: '#ec4899',
                background_color: '#ffffff',
                display: 'standalone',
                start_url: '/surchop/', // ou '/' selon ta config GitHub Pages
                scope: '/surchop/',
                icons: [
                    {
                        src: 'web-app-manifest-192x192',
                        sizes: '192x192',
                        type: 'image/png',
                    },
                    {
                        src: 'web-app-manifest-512x512',
                        sizes: '512x512',
                        type: 'image/png',
                    },
                    {
                        src: 'web-app-manifest-512x512',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any maskable',
                    },
                ],
            },
        }),
    ],
    base: '/surchop/', // important pour GitHub Pages
});
