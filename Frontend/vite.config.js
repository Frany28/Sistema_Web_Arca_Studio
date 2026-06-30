import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const base = process.env.DEPLOY_BASE_PATH || '/'

// https://vite.dev/config/
export default defineConfig({
  base,
  build: {
    cssMinify: "esbuild",
    chunkSizeWarningLimit: 1100,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: "model-viewer",
              test: /[\\/]node_modules[\\/]@google[\\/]model-viewer[\\/]/,
            },
            {
              name: "react-vendor",
              test: /[\\/]node_modules[\\/](react|react-dom|react-router-dom)[\\/]/,
            },
          ],
        },
      },
    },
  },
  plugins: [react(), tailwindcss()],
})
