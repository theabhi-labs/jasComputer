import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),        // Add React plugin
    tailwindcss(),  // Tailwind plugin
  ],
  server: {
    // This ensures all unknown routes fallback to index.html during dev
    historyApiFallback: true,
  },
  build: {
    // Ensures SPA works in production too
    rollupOptions: {
      input: '/index.html',
    },
  },
})