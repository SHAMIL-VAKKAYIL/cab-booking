import { errorHandler, metricsMiddleware, registry } from "@cab/observability";
import express from "express";
import { logger } from "./config/logger";

export const app: express.Application = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  logger.info({ url: req.url }, "request received");
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
app.use(errorHandler);
