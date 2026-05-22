import express from 'express'
import { metricsMiddleware, registry } from '@cab/observability'

const app: express.Application = express()

app.use(express.json())
app.use(metricsMiddleware)

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', registry.contentType)
  res.send(await registry.metrics())
})

app.use('/health', (req, res) => {
  res.send('OK');
})



export { app }