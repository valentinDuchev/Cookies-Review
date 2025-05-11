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
        target: "http://172.20.10.13:5000", // Your IP and server port
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
