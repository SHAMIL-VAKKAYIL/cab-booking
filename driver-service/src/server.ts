import { app } from "./app";
import { config } from "./config";
import { logger } from "./config/logger";
import { pool } from "./db/pool";
import { startUserCreatedSubscriber } from "./events/subscribers/user-created.subscriber";




const PORT = config.port;
const start = async () => {
    try {
        await startUserCreatedSubscriber()

        await pool.connect()
        logger.info({}, 'database connected')

        app.listen(PORT, () => {
            logger.info({}, `server running on port ${PORT}`)
        })
    } catch (error) {
        logger.error({ error }, 'connection faild')
    }
}

start()