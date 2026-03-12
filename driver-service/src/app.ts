import express from 'express'
import { logger } from './config/logger'
import { errorHandler } from '@cab/observability'
import { driverRouter } from './modules/driver/driver.routes'
export const app: express.Application = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))


app.use((req, _, next) => {
    logger.info(`${req.method} ${req.path}`);
    next()
})

app.use('/api/v1/driver', driverRouter)

app.use(errorHandler)