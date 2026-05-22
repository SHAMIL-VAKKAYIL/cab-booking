import express from 'express';
import { logger } from './config/logger';
import { errorHandler, metricsMiddleware, registry } from '@cab/observability';

import { tripRouter } from './modules/trip/trip.routes';

export const app: express.Application = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, _, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

app.use(metricsMiddleware)

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', registry.contentType)
  res.send(await registry.metrics())
})

app.use('/health', (req, res) => {
  res.send('OK');
})
app.use('/', tripRouter)

app.use(errorHandler);
