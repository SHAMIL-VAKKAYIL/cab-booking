import { Request, Response } from 'express';
import { WebhookService } from '../services/webhook.service';
import { logger } from '../config/logger';

const webhookService = new WebhookService();

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
