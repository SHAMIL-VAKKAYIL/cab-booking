import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import cors from "cors";
import { errorHandler } from "@cab/observability";
import proxyRouter from "./routes/proxy";
import { logger } from "./middleware/logger";
import { config } from "./config";

const app: express.Application = express();

app.use(helmet());

app.use(morgan("combined"));

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
      message:
        "Too many requests from this IP, please try again after 15 minutes",
    },
  }),
);

app.use(cors());
app.use(proxyRouter);

app.use(errorHandler);

app.listen(config.port, () => {
  logger.info(`Gateway running on PORT ${config.port}`);
}); 

export default app;
