import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

function fridayPlugin() {
  return {
    name: 'friday-api',
    configureServer(server) {
      server.middlewares.use('/api/friday', (req, res, next) => {
        if (req.method === 'OPTIONS') {
          res.statusCode = 204
          res.end()
          return
        }
        if (req.method !== 'POST') {
          next()
          return
        }
        const chunks = []
        req.on('data', (c) => chunks.push(c))
        req.on('end', async () => {
          try {
            const { runFriday } = await import('./api/friday.js')
            const body = JSON.parse(Buffer.concat(chunks).toString() || '{}')
            const { status, json } = await runFriday(body)
            res.statusCode = status
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(json))
          } catch (err) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: err?.message || 'F.R.I.D.A.Y. is offline.' }))
          }
        })
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), fridayPlugin()],
})
