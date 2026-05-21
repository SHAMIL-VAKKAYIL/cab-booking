import express from "express";
import { logger } from "./config/logger";
import { errorHandler, metricsMiddleware, registry } from "@cab/observability";
//import cors from 'cors';

const app: express.Application = express();

//app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, _, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

app.use(metricsMiddleware)

// metrics endpoint — Prometheus scrapes this
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', registry.contentType)
  res.send(await registry.metrics())
})

app.use('/health', (req, res) => {
  res.send('OK');
})

app.use(errorHandler);
export { app };
