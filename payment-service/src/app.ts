import express, { urlencoded } from "express";
import cors from "cors";
import { errorHandler } from "@cab/observability";
import { logger } from "./config/logger";
import webhookRouter from "./modules/payments/webhook.routes";
export const app: express.Application = express();

//app.use(
//cors({
//origin: "*",
//}),
//);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, _, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});
app.use('/health', (req, res) => {
  res.send('OK');
})

app.use("/", webhookRouter);

app.use(errorHandler);
