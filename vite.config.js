import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Remove flowbiteReact plugin
export default defineConfig({
  plugins: [react()],
})
