import { app } from "./app";
import { config } from "./config";
import { logger } from "./config/logger";

const PORT = config.port;
const start = async () => {
  try {
    app.listen(PORT, () => {
    logger.info(`server runnig on ${PORT}` )
    });
  } catch (error) {
    logger.error({ error }, "faild to start server");
    process.exit(1);
  }
};

start();
