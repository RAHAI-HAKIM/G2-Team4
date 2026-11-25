import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Django backend (python manage.py runserver) — same origin for the browser, no CORS
    proxy: {
      '/api': 'http://127.0.0.1:8000',
    },
  },
})
