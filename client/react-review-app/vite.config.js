import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0", // Allow connections from all network interfaces
    port: 5173, // Default Vite port
    proxy: {
      "/api": {
        target: 'https://cookies-review-server.vercel.app', 
        changeOrigin: true,
        secure: false,
      },
    },
  },
})


//https://cookies-review-server.vercel.app/api/products