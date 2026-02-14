import { Request, Response, NextFunction } from 'express';
import { logger } from './logger';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    logger.error(
        {
            err,
            url: req.url,
            method: req.method
        }, 'An error occurred');

    res.status(500).json({ message: 'Internal Server Error' });
};