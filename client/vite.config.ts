import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import 'dotenv/config'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Use this for setting a proxy when doing LOCAL Deployment in vite in contrast to p.json in CRA
  // server: {
  //   proxy: {
  //     '/api': {
  //       target: `http://localhost:${process.env.PORT}`,
  //       changeOrigin: true,
  //       // secure: false,
  //     },
  //   },
  // },
})
