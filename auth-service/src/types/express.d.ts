import { TokenPayload } from '../utils/token';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}