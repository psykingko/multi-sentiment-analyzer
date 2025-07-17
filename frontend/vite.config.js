import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import viteCompression from 'vite-plugin-compression'; // Add this import

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), viteCompression()], // Enable Brotli/gzip compression for production
})
// If deploying with a custom server (e.g., Express), also enable compression middleware server-side.
