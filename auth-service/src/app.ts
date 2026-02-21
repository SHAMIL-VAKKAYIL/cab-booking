import express from "express";
import { authRouter } from "./modules/auth/auth.routes";
import { errorHandler } from "@cab/observability";
import { logger } from "./config/logger";

export const app = express()



app.use(express.json());
app.use(express.urlencoded({ extended: true }));



app.use((req,_, next) => {
    logger.info(`${req.method} ${req.path}`);
    next()
})
app.use('/api/v1/auth', authRouter)

app.use(errorHandler)

