// defineConfig: helps create the Vite configuration 
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Activates the React plugin
  plugins: [react()],

  server: {
    port: 5173,
    proxy: {
      // Any request starting with (/api) will be sent to the backend 
      '/api': {
        target: "http://localhost:3000",
        /**Changes the request's origin header so it appears to come from the 
        target backend address 

        Without it, the backend may see the request as coming from: http://localhost:5173*/
        changeOrigin: true,
      }
    }
  }
})