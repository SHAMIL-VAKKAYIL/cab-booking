import 'dotenv/config'
import { app } from './app'
import { config } from './config'
import { logger } from './config/logger'
import { pool } from './db/pool'
import { connectRedis } from './lib/redis'
import { connectProducer } from '@cab/messaging'
import { startUserCreatedSubscriber } from './events/consumer/user-created.consumer'
import { startDriverRatedConsumer }   from './events/consumer/driver-rated.consumer'

const start = async () => {
  try {
    await pool.connect()
    logger.info('Database connected')

    await connectRedis()
    logger.info('Redis connected')

    await connectProducer()
    logger.info('Kafka producer connected')

    await startUserCreatedSubscriber()
    await startDriverRatedConsumer()
    logger.info('Kafka consumers started')

    app.listen(config.port, () => {
      logger.info(`Driver service running on port ${config.port}`)
    })
  } catch (error) {
    logger.error({ error }, 'Failed to start driver service')
    process.exit(1)
  }
}

start()