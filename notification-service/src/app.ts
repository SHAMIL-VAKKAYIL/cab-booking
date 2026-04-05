import { errorHandler } from "@cab/observability";
import express from "express";
import { logger } from "./config/logger";

export const app: express.Application = express();

app.use((req, res, next) => {
  logger.info({ url: req.url }, "request received");
  next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(errorHandler);
