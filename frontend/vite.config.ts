import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    host: '127.0.0.1',
    proxy: {
      '/patients': 'http://127.0.0.1:8000',
      '/doctors': 'http://127.0.0.1:8000',
      '/doctor-schedules': 'http://127.0.0.1:8000',
      '/appointments': 'http://127.0.0.1:8000',
      '/auth': 'http://127.0.0.1:8000',
      '/notifications': 'http://127.0.0.1:8000',
      '/voice-calls': 'http://127.0.0.1:8000',
      '/dbcheck': 'http://127.0.0.1:8000',
    },
  },
})
