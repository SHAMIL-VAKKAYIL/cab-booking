import express from 'express'
import { loginHandler, logoutHandler, refreshTokenHandler, registerHandler } from './auth.controller';

const authRouter = express.Router()


authRouter.post('/register', registerHandler);
authRouter.post('/login', loginHandler);
authRouter.post('/logout', logoutHandler);
authRouter.post('/refresh-token', refreshTokenHandler)

// authRouter.get('/me', )

export { authRouter }