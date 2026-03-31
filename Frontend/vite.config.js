import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const base = process.env.DEPLOY_BASE_PATH || '/'

// https://vite.dev/config/
export default defineConfig({
  base,
  build: {
    cssMinify: "esbuild",
  },
  plugins: [react(), tailwindcss()],
})
