import { Request, Response } from 'express';
import { WebhookService } from './webhook.service';
import {PaymentService} from './payment.service';
import { logger } from '../../config/logger';

const webhookService = new WebhookService();
const paymentService = new PaymentService();

export const handleRazorpay = async (req: Request, res: Response) => {
    try {
      const signature = req.headers['x-razorpay-signature'] as string;
      await webhookService.handleRazorpayEvent(req.body, signature);
      return res.status(200).json({ received: true });
    } catch (error) {
      logger.error({ error }, 'Webhook handling failed');
      return res.status(400).json({ message: 'Webhook failed' });
    }
  };

export const getPaymentByTrip = async (req: Request, res: Response) => {
    try {
      const tripId = req.params.tripId as string;
      const payment = await paymentService.getPaymentByTrip(tripId);
      return res.status(200).json(payment);
    } catch (error) {
      logger.error({ error }, 'Failed to get payment');
      return res.status(404).json({ message: 'Payment not found' });
    }
  };