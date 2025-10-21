import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: [
                'icons/favicon.ico',
                'icons/apple-touch-icon.png',
                'icons/apple-touch-icon-180x180.png',
                'icons/pwa-192x192.png',
                'icons/pwa-512x512.png',
                'icons/*',
            ],
            srcDir: 'src',
            filename: 'sw.ts',
            strategies: 'injectManifest',
            manifest: {
                name: 'Surchope 💘',
                short_name: 'Surchope',
                description: 'Vote qui surchope qui 😏',
                theme_color: '#ec4899',
                background_color: '#fff0f6',
                display: 'standalone',
                orientation: 'portrait',
                scope: '/',
                start_url: '/',
                icons: [
                    {
                        src: 'icons/pwa-192x192.png',
                        sizes: '192x192',
                        type: 'image/png',
                    },
                    {
                        src: 'icons/pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                    },
                    {
                        src: 'icons/apple-touch-icon-180x180.png',
                        sizes: '180x180',
                        type: 'image/png',
                    },
                    {
                        src: 'icons/pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'maskable',
                    },
                ],
            },
        }),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    base: '/', // important pour GitHub Pages
});
