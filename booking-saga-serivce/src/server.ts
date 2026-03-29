import { app } from "./app";
import { logger } from "./config/logger";
import { config } from "./config";

const start =async()=>{
    try {
    

    app.listen(config.port,()=>{
        logger.info(`Booking saga service running on port ${config.port}`)
    })
        
    } catch (error) {
        logger.error({error},'Failed to start booking saga service')
        process.exit(1)
    }
}
start()

