import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,         // 🟢 Allows access via localhost and IP both
    port: 3003,         // (optional) Fixes the port if needed
    strictPort: true,   // (optional) Avoids automatic port switching
  },
})