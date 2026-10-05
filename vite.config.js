import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // BACKEND_URL comes from the .env file (or .env.local, which overrides it).
  const { BACKEND_URL } = loadEnv(mode, '.', '')

  // Requests to /api are forwarded to the Django backend, so the browser only
  // ever talks to one address and no CORS setup is needed.
  const apiProxy = {
    '/api': {
      target: BACKEND_URL,
      // Send the backend's own host name, which Django checks against ALLOWED_HOSTS
      changeOrigin: true,
    },
  }

  return {
    plugins: [react()],
    server: { proxy: apiProxy },
    preview: { proxy: apiProxy },
  }
})
