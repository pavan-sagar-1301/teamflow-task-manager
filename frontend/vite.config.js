import { defineConfig } from 'vite'

import react from '@vitejs/plugin-react'

import tailwindcss from '@tailwindcss/vite'



export default defineConfig({

  plugins: [react()],

  preview: {

    allowedHosts: ["teamflow-task-manager-production-03e2.up.railway.app"]

  }

})
