import 'dotenv/config'
import { app } from './app'
import { config } from './config'
import { logger } from './config/logger'
import { connectRedis } from './lib/redis'
import { connectProducer } from '@cab/messaging'
import { startDriverFindConsumer }    from './events/consumers/driver-find.consumer'
import { startDriverOnlineConsumer }  from './events/consumers/driver-online.consumer'
import { startDriverOfflineConsumer } from './events/consumers/driver-offline.consumer'
import { startDriverReleaseConsumer } from './events/consumers/driver-release.consumer'
import { startTripCancelledConsumer } from './events/consumers/trip-cancelled.consumer'

const start = async () => {
  try {
    await connectRedis()
    logger.info('Redis connected')

    await connectProducer()
    logger.info('Kafka producer connected')

    await startDriverFindConsumer()
    await startDriverOnlineConsumer()
    await startDriverOfflineConsumer()
    await startDriverReleaseConsumer()
    await startTripCancelledConsumer()
    logger.info('All Kafka consumers started')

    app.listen(config.port, () => {
      logger.info(`Matching service running on port ${config.port}`)
    })
  } catch (error) {
    logger.error({ error }, 'Failed to start matching service')
    process.exit(1)
  }
}

start()
