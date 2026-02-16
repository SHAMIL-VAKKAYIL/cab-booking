import pinoHttp from "pino-http";
import { createLogger } from "./logger";


export const requestLogger = pinoHttp({logger: createLogger('request-logger')});