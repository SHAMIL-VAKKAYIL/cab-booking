import express from 'express';
import { logger } from './config/logger';
import { errorHandler } from '@cab/observability';
import { riderRouter } from './modules/rider/rider.routes';

export const app: express.Application = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, _, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});
app.use('/health', (req, res) => {
  res.send('OK');
})

app.use('/', riderRouter);

app.use(errorHandler);
