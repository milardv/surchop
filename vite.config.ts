import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    base: '/surchop.github.io/', // 👈 important pour GitHub Pages
})
