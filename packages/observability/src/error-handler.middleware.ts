import { Request, Response, NextFunction } from 'express';
import { createLogger } from './logger';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    const logger = createLogger('error-handler');
    logger.error(
        {
            err,
            url: req.url,
            method: req.method
        }, 'An error occurred');

    res.status(500).json({ message: 'Internal Server Error' });
};