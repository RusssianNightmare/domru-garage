import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // Импортируем плагин

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Добавляем плагин сюда
  ],
})