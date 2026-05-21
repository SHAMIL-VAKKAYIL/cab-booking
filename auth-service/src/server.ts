import { app } from "./app.js";
import { config } from "./config/index.js";
import { logger } from "./config/logger.js";
import { pool } from "./db/pool.js";
import { connectProducer } from "@cab/messaging";

const PORT = config.port;

export const start = async () => {
  try {
    await connectProducer();
    await pool.query("SELECT 1");
    logger.info({}, "database connected");
    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });
  } catch (err) {
    logger.error({ err }, "startup failed");
    process.exit(1);
  }
};

start();