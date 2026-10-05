import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Requests to /api are forwarded to the Django backend, so the browser only
// ever talks to one address and no CORS setup is needed.
const apiProxy = {
  '/api': 'http://127.0.0.1:8000',
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: { proxy: apiProxy },
  preview: { proxy: apiProxy },
})
