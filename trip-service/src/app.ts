import express from 'express';
import { logger } from './config/logger';
import { errorHandler } from '@cab/observability';

import { tripRouter } from './modules/trip/trip.routes';

export const app: express.Application = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, _, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});
app.use('/api/trip', tripRouter)

app.use(errorHandler);
