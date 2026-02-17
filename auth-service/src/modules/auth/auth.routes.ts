import express from 'express'
import { loginHandler, logoutHandler, refreshTokenHandler, registerHandler } from './auth.controller';

const authRouter = express.Router()

// TODO
//? Register


authRouter.post('/register', registerHandler);
authRouter.post('/login', loginHandler);
authRouter.post('/logout', logoutHandler);
authRouter.post('/refresh-token', refreshTokenHandler)

//? Refresh token
//? Get current user

export { authRouter }