import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// No computador, o front roda em http://localhost:5173 e repassa tudo o que começa
// com /api para o back. Em homologação e produção, quem faz esse repasse é o nginx
// do app do front, no CapRover.
//
// Variáveis lidas só aqui (não vão para o navegador):
// - API_ALVO: endereço do back. Padrão localhost:8000; no docker-compose, http://backend:8000.
// - USAR_POLLING=true: no Docker com Windows, o aviso de "arquivo salvo" não atravessa
//   para o contêiner; com polling o Vite confere os arquivos de tempos em tempos.
const alvoApi = process.env.API_ALVO || 'http://localhost:8000'
const usarPolling = process.env.USAR_POLLING === 'true'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': alvoApi,
    },
    watch: usarPolling ? { usePolling: true, interval: 300 } : undefined,
  },
})
