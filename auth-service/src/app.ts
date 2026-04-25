import express from "express";
import { authRouter } from "./modules/auth/auth.routes.js";
import { errorHandler } from "@cab/observability";
import { logger } from "./config/logger.js";

export const app:express.Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req:any, _, next:any) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});
app.use('/health', (req, res) => {
  res.send('OK');
})
app.use("/", authRouter);

app.use(errorHandler);
