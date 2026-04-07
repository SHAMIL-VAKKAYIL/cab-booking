import { eq } from "drizzle-orm";
import { db } from "../../db";
import { payments } from "../../db/schema";
import { razorpay } from "../../config/razorpay";
import { CreatePaymentInput, RefundPaymentInput } from "../../types";
import { logger } from "../../config/logger";
import {
  publishPaymentFailed,
  publishPaymentSuccess,
} from "../../events/producers/payment.producer";

export class PaymentService {
  async processPayment(input: CreatePaymentInput) {
    const {
      amount,
      driverId,
      riderId,
      tripId,
      currency = "INR",
      riderEmail,
    } = input;

    const existing = await db
      .select()
      .from(payments)
      .where(eq(payments.tripId, tripId));

    if (existing.length > 0) {
      logger.warn({ tripId }, "Payment already exists for this trip");
      return existing[0];
    }

    const [payment] = await db
      .insert(payments)
      .values({
        amount: amount.toString(),
        driverId,
        riderId,
        tripId,
        currency,
        status: "PENDING",
        updatedAt: new Date(),
      })
      .returning();

    try {
      const order = await razorpay.orders.create({
        amount: amount * 100,
        currency,
        receipt: `receipt_${tripId}`,
        notes: {
          paymentId: payment.id,
          tripId,
          driverId,
          riderId,
        },
      });

      logger.info({ tripId, orderId: order.id }, "Razorpay order created");

      const [updated] = await db
        .update(payments)
        .set({
          status: "SUCCESS",
          transactionId: order.id,
          processedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(payments.id, payment.id))
        .returning();

      logger.info(
        { tripId, paymentId: payment.id },
        "Payment processed successfully",
      );

      await publishPaymentSuccess({
        paymentId: payment.id,
        tripId,
        riderId,
        riderEmail,
        driverId,
        amount,
        currency,
        transactionId: order.id,
      });

      return updated;
      // return payment;
    } catch (error) {
      logger.info({ tripId, paymentId: payment.id }, "Payment failed");
      const [updated] = await db
        .update(payments)
        .set({
          status: "FAILED",
          failureReason: (error as Error).message,
          updatedAt: new Date(),
        })
        .where(eq(payments.id, payment.id))
        .returning();

      // faildProducer
      await publishPaymentFailed({
        paymentId: payment.id,
        tripId,
        riderId,
        riderEmail,
        reason: (error as Error).message,
      });

      return updated;
    }
  }

  async refundPayment(input: RefundPaymentInput) {
    const { tripId, reason } = input;

    const existing = await db
      .select()
      .from(payments)
      .where(eq(payments.tripId, tripId));

    if (existing.length === 0) {
      throw new Error("Payment not found");
    }

    const payment = existing[0];
    if (payment.status !== "SUCCESS") {
      throw new Error("Only successful payments can be refunded");
    }

    try {
    
      await razorpay.payments.refund(payment.transactionId!, {
        amount: parseInt(payment.amount) * 100,
        notes: {
          tripId,
          reason,
        },
      });

      const [updated] = await db
        .update(payments)
        .set({
          status: "REFUNDED",
          updatedAt: new Date(),
        })
        .where(eq(payments.id, payment.id))
        .returning();

      logger.info({ tripId }, "Razorpay refund initiated");
      return updated;
    } catch (error) {
      logger.error({ tripId }, "Failed to initiate Razorpay refund");
      throw new Error("Failed to initiate refund");
    }
  }
}
