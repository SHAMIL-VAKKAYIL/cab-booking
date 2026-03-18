import { app } from './app';
import { config } from './config';
import { logger } from './config/logger';
import { pool } from './db/pool';
import { connectProducer } from '@cab/messaging'
import { startRideCancelledConsumer } from './events/consumer/trip-cancelled.consumer';
import { startTripCreateConsumer } from './events/consumer/trip-create.consumer';
import { connectRedis } from './redis';


const PORT = config.port;
const start = async () => {
  try {

    await pool.connect()
    logger.info({}, 'Database connected')

    await connectRedis()
    logger.info({}, 'Redis connected')

    await connectProducer()
    logger.info({}, 'Kafka producer connected')

    await startTripCreateConsumer()
    await startRideCancelledConsumer()
    logger.info({}, 'Kafka consumers started')

    app.listen(PORT, () => {
      logger.info({}, `Server is running on port ${PORT}`);
    });
  } catch (error) {
    logger.error({ error }, 'Failed to start server');
    process.exit(1);
  }
};

start();
