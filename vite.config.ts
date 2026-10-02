import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  if (process.env.VERCEL === '1') {
    const relay = env.VITE_REMOTE_WS_URL?.trim()
    let valid = false
    try {
      const url = new URL(relay ?? '')
      valid = url.protocol === 'wss:' && !url.username && !url.password && !url.hash
    } catch {
      /* Missing or malformed relay configuration. */
    }
    if (!valid)
      throw new Error(
        'Set VITE_REMOTE_WS_URL to the persistent relay wss:// address before deploying to Vercel.',
      )
  }
  return {
    server: {
      proxy: {
        '/remote-ws': { target: 'http://127.0.0.1:8787', ws: true },
      },
    },
    plugins: [vue(), vueJsx(), vueDevTools()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
  }
})
