import { app } from "./app";
import { config } from "./config";
import { logger } from "./config/logger";
import { pool } from "./db/pool";



const PORT =config.port;
const start =async()=>{
    try {
        
        await pool.connect()
        logger.info({},'database connected')
        
        app.listen(PORT, () => {
            logger.info({},`Server is running on port ${PORT}`)
        })
    } catch (error) {
        logger.error({error},'Failed to start server')
        process.exit(1)
    }
}

start()