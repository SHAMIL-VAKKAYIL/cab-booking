import { app } from './app';
import { config } from './config';
import { logger } from './config/logger';
import { pool } from './db/pool';

const PORT = config.port;



const start = async () => {
    try {
        await pool.connect();
        
        console.log("Database connected");

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (err) {
        logger.error({ err }, "Database connection failed");
        process.exit(1);
    }
}
start()
