import { fileURLToPath, URL } from 'node:url'

import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import { googleTagManagerSnippets } from './src/lib/gtm.ts'

function googleTagManager(): Plugin {
  let containerId = ''

  return {
    name: 'google-tag-manager',
    configResolved(config) {
      containerId = config.env.VITE_GTM_ID ?? ''
    },
    transformIndexHtml(html) {
      const { head, body } = googleTagManagerSnippets(containerId)
      if (!head || !body) return html

      return html
        .replace('<meta charset="UTF-8" />', `<meta charset="UTF-8" />\n    ${head}`)
        .replace('<body>', `<body>\n    ${body}`)
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/remote-ws': { target: 'http://127.0.0.1:8787', ws: true },
    },
  },
  plugins: [
    googleTagManager(),
    vue(),
    vueJsx(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
