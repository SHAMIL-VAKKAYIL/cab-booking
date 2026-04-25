// import 'dotenv/config'
import { app } from './app'
import { config } from './config'
import { logger } from './config/logger'
import { connectProducer } from '@cab/messaging'
import { startFareCalculateConsumer } from './events/consumer/fare-calculate.consumer'

const start = async () => {
  try {
    await connectProducer()
    logger.info('Kafka producer connected')

    await startFareCalculateConsumer()
    logger.info('Kafka consumer started')

    app.listen(config.port, () => {
      logger.info(`Pricing service running on port ${config.port}`)
    })
  } catch (error) {
    logger.error({ error }, 'Failed to start pricing service')
    process.exit(1)
  }
}

start()