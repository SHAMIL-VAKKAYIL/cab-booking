import { Server } from "socket.io";
import http from "http";
import { app } from "./app";
import { config } from "./config";
import { logger } from "./config/logger";
import { pool } from "./db/pool";
import { connectProducer } from "@cab/messaging";
import { startRideCancelledConsumer } from "./events/consumer/trip-cancelled.consumer";
import { startTripCreateConsumer } from "./events/consumer/trip-create.consumer";
import { connectRedis } from "./lib/redis";

const PORT = config.port;

const httpServer = http.createServer(app);

export const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  logger.info({ socketId: socket.id }, "a user connected");

  socket.on("join_trip", ({ tripId }: { tripId: string }) => {
    socket.join(tripId);
    logger.info({ tripId, socketId: socket.id }, "user joined trip");
  });

  socket.on("leave_trip", (tripId: string) => {
    socket.leave(tripId);
    logger.info({ tripId, socketId: socket.id }, "user left trip");
  });

  socket.on("disconnect", () => {
  logger.info({ socketId: socket.id }, "user disconnected");
  });
});


const start = async () => {
  try {
    await pool.connect();
    logger.info({}, "Database connected");

    await connectRedis();
    logger.info({}, "Redis connected");

    await connectProducer();
    logger.info({}, "Kafka producer connected");

    await startTripCreateConsumer();
    await startRideCancelledConsumer();
    logger.info({}, "Kafka consumers started");

   httpServer.listen(PORT,()=>{
    logger.info({},`Server is running on port ${PORT}`)
   })
  } catch (error) {
    logger.error({ error }, "Failed to start server");
    process.exit(1);
  }
};

start();
