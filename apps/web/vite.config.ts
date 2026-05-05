import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import { resolve } from 'node:path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, resolve(import.meta.dirname, '../..'), '')
  for (const [key, value] of Object.entries(env)) {
    if (process.env[key] === undefined) {
      process.env[key] = value
    }
  }

  return {
    server: {
      port: 3001
    },
    plugins: [react(), svgr()],
    resolve: {
      alias: {
        '@app': resolve(import.meta.dirname, 'app'),
        '@components': resolve(import.meta.dirname, 'components'),
        '@hooks': resolve(import.meta.dirname, 'hooks'),
        '@constants': resolve(import.meta.dirname, 'constants'),
        '@assets': resolve(import.meta.dirname, 'assets'),
        '@api': resolve(import.meta.dirname, 'api'),
        '@lib': resolve(import.meta.dirname, 'lib'),
        '@types': resolve(import.meta.dirname, 'types')
      }
    }
  }
})
