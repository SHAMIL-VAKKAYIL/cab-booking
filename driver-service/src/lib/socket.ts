import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { logger } from '../config/logger';

let io: Server;

export const initSocket = (httpServer: HttpServer) => {
    io = new Server(httpServer, {
        cors: { origin: '*' }  // change into client url
    });

    io.use((socket, next) => {
        const { driverId, token } = socket.handshake.auth
        if (!driverId || !token) return next(new Error('Unauthorized'));
        socket.data.driverId = driverId;
        next();
    })



    io.on('connection', (socket) => {
        const driverId = socket.data.driverId;

        socket.join(driverId); // room = driverId, this is what broadcast targets
        logger.info({ driverId }, 'Driver socket connected');

        socket.on('disconnect', () => {
            logger.info({ driverId }, 'Driver socket disconnected');
            // optionally trigger going offline logic here
        });
    });


};

export const getIO = (): Server => {
    if (!io) throw new Error('Socket not initialized');
    return io;
};