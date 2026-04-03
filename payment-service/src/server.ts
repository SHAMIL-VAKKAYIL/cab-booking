import { app } from "./app";
import { config } from "./config";
import { logger } from "./config/logger";

const PORT = config.port;
const start = () => {
  try {
    app.listen(PORT, () => {
      logger.info({}, `server is running on port ${PORT}`);
    });
  } catch (error) {
    logger.error({ error }, "faild to start server");
  }
};

start();
