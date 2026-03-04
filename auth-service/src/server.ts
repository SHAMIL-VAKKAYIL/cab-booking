import { app } from './app';
import { config } from './config';
import { logger } from './config/logger';
import { pool } from './db/pool';
import { connectProducer } from '@cab/messaging'

const PORT = config.port;

const start = async () => {
    try {
        await connectProducer()

        await pool.connect();
        logger.info({}, 'database Connected')
        app.listen(PORT, () => {
            logger.info(`Server running on port ${PORT}`);
        });
    } catch (err) {
        logger.error({ err }, "Database connection failed");
        process.exit(1);
    }
}
start()
