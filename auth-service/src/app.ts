import express from "express";
import { authRouter } from "./modules/auth/auth.routes.js";
import { errorHandler, metricsMiddleware, registry } from "@cab/observability";
import { logger } from "./config/logger.js";

export const app:express.Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req:any, _, next:any) => {
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
  res.send('OK AUTH');
})
app.use("/", authRouter);

app.use(errorHandler);
