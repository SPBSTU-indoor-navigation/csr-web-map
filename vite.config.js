import { fileURLToPath, URL } from 'node:url'

// const path = require('path');
import path from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// console.log(new URL('./node_modules/three/build/three.module.js', import.meta.url));
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  optimizeDeps: {
    exclude: [
      'three'
    ],
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      'three': fileURLToPath(new URL('./node_modules/three', import.meta.url))
    }
  }
})
