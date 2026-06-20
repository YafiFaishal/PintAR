import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/PintAR/',
  build: {
    outDir: 'docs',
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg', 'targets/**/*.mind', 'models/**/*.glb', 'marker.png'],
      manifest: {
        name: 'PintAR v2 - Lab Sains Virtual',
        short_name: 'PintAR',
        description: 'Aplikasi lab sains virtual dengan WebAR untuk siswa',
        theme_color: '#0066FF',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 5000000, // 5MB
        navigateFallbackDenylist: [/^\/.*\.(png|jpg|jpeg|svg|mind|glb|gltf)$/]
      }
    })
  ],
})
