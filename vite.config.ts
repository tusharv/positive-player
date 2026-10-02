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
      const websiteHosts = [
        env.VERCEL_URL,
        env.VERCEL_BRANCH_URL,
        env.VERCEL_PROJECT_PRODUCTION_URL,
      ]
      const retiredRoute =
        websiteHosts.includes(url.host) && ['/remote-ws', '/api/remote-ws'].includes(url.pathname)
      valid =
        url.protocol === 'wss:' && !url.username && !url.password && !url.hash && !retiredRoute
    } catch {
      /* Missing or malformed relay configuration. */
    }
    if (!valid)
      throw new Error(
        'Set VITE_REMOTE_WS_URL to the separate persistent relay wss:// address, not this Vercel website, before deploying.',
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
