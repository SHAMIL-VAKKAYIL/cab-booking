import express,{Router} from 'express'
import { handleRazorpay } from './webhook.controller';

const paymentRouter = Router()

paymentRouter.post('/v1/webhook/razorpay', express.raw({ type: 'application/json' }), handleRazorpay);

export default paymentRouter;
