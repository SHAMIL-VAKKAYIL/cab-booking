import express from 'express'
import { loginHandler, logoutHandler, refreshTokenHandler, registerHandler } from './auth.controller.js';

const authRouter:express.Router = express.Router()

authRouter.post('/v1/register', registerHandler);
authRouter.post('/v1/login', loginHandler);
authRouter.post('/v1/logout', logoutHandler);
authRouter.post('/v1/refresh-token', refreshTokenHandler)

// authRouter.get('/me', )

export { authRouter }