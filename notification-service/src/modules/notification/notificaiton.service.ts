import { transporter } from "../../config/mailer";
import { logger } from "../../config/logger";
import { config } from "../../config";

const FROM = `"CabX" <${config.mailer.email}>`;

export class NotificationService {
  async sendBookingConfirmedRider(payload: {
    riderId: string;
    riderEmail: string;
    driverId: string;
    tripId: string;
    estimatedFare: number;
    pickupAddress: string;
    dropoffAddress: string;
    vehicleType: string;
  }) {
    try {
      await transporter.sendMail({
        from: FROM,
        to: payload.riderEmail,
        subject: "Your ride is confirmed!",
        html: `
          <h2>Ride Confirmed</h2>
          <p>Your driver has been assigned.</p>
          <table>
            <tr><td><b>Trip ID</b></td><td>${payload.tripId}</td></tr>
            <tr><td><b>Pickup</b></td><td>${payload.pickupAddress}</td></tr>
            <tr><td><b>Dropoff</b></td><td>${payload.dropoffAddress}</td></tr>
            <tr><td><b>Vehicle</b></td><td>${payload.vehicleType}</td></tr>
            <tr><td><b>Estimated Fare</b></td><td>₹${payload.estimatedFare}</td></tr>
          </table>
        `,
      });
      logger.info(
        { tripId: payload.tripId },
        "Booking confirmed email sent to rider",
      );
    } catch (error) {
      logger.error(
        { error, tripId: payload.tripId },
        "Failed to send booking confirmed email to rider",
      );
    }
  }

  async sendBookingFailed(payload: {
    riderEmail: string;
    rideId: string;
    reason: string;
  }) {
    try {
      await transporter.sendMail({
        from: FROM,
        to: payload.riderEmail,
        subject: "Booking failed",
        html: `
          <h2>Booking Failed</h2>
          <p>Unfortunately your ride request could not be completed.</p>
          <p><b>Reason:</b> ${payload.reason}</p>
          <p>Please try again.</p>
        `,
      });
      logger.info(
        { rideId: payload.rideId },
        "Booking failed email sent to rider",
      );
    } catch (error) {
      logger.error(
        { error, rideId: payload.rideId },
        "Failed to send booking failed email",
      );
    }
  }

  async sendTripStarted(payload: { riderEmail: string; tripId: string }) {
    try {
      await transporter.sendMail({
        from: FROM,
        to: payload.riderEmail,
        subject: "Your driver is on the way!",
        html: `
          <h2>Trip Started</h2>
          <p>Your driver has started the trip.</p>
          <p><b>Trip ID:</b> ${payload.tripId}</p>
        `,
      });
      logger.info(
        { tripId: payload.tripId },
        "Trip started email sent to rider",
      );
    } catch (error) {
      logger.error(
        { error, tripId: payload.tripId },
        "Failed to send trip started email",
      );
    }
  }

  async sendTripCompleted(payload: {
    riderEmail: string;
    tripId: string;
    fare: number;
    distanceKm: number;
    durationMins: number;
    pickupAddress: string;
    dropoffAddress: string;
  }) {
    try {
      await transporter.sendMail({
        from: FROM,
        to: payload.riderEmail,
        subject: "Trip completed — Payment receipt",
        html: `
          <h2>Trip Completed</h2>
          <p>Thank you for riding with CabX!</p>
          <table>
            <tr><td><b>Trip ID</b></td><td>${payload.tripId}</td></tr>
            <tr><td><b>Pickup</b></td><td>${payload.pickupAddress}</td></tr>
            <tr><td><b>Dropoff</b></td><td>${payload.dropoffAddress}</td></tr>
            <tr><td><b>Distance</b></td><td>${payload.distanceKm} km</td></tr>
            <tr><td><b>Duration</b></td><td>${payload.durationMins} mins</td></tr>
            <tr><td><b>Fare</b></td><td>₹${payload.fare}</td></tr>
          </table>
        `,
      });
      logger.info(
        { tripId: payload.tripId },
        "Trip completed email sent to rider",
      );
    } catch (error) {
      logger.error(
        { error, tripId: payload.tripId },
        "Failed to send trip completed email",
      );
    }
  }

  async sendTripCancelled(payload: {
    riderEmail: string;
    tripId: string;
    reason: string;
  }) {
    try {
      await transporter.sendMail({
        from: FROM,
        to: payload.riderEmail,
        subject: "Your trip has been cancelled",
        html: `
          <h2>Trip Cancelled</h2>
          <p>Your trip has been cancelled.</p>
          <p><b>Trip ID:</b> ${payload.tripId}</p>
          <p><b>Reason:</b> ${payload.reason}</p>
        `,
      });
      logger.info({ tripId: payload.tripId }, "Trip cancelled email sent");
    } catch (error) {
      logger.error(
        { error, tripId: payload.tripId },
        "Failed to send trip cancelled email",
      );
    }
  }

  async sendPaymentSuccess(payload: {
    riderEmail: string;
    tripId: string;
    amount: number;
    transactionId: string;
  }) {
    try {
      await transporter.sendMail({
        from: FROM,
        to: payload.riderEmail,
        subject: "Payment successful",
        html: `
          <h2>Payment Successful</h2>
          <p>Your payment has been processed.</p>
          <table>
            <tr><td><b>Trip ID</b></td><td>${payload.tripId}</td></tr>
            <tr><td><b>Amount</b></td><td>₹${payload.amount}</td></tr>
            <tr><td><b>Transaction ID</b></td><td>${payload.transactionId}</td></tr>
          </table>
        `,
      });
      logger.info({ tripId: payload.tripId }, "Payment success email sent");
    } catch (error) {
      logger.error(
        { error, tripId: payload.tripId },
        "Failed to send payment success email",
      );
    }
  }

  async sendPaymentFailed(payload: {
    riderEmail: string;
    tripId: string;
    reason: string;
  }) {
    try {
      await transporter.sendMail({
        from: FROM,
        to: payload.riderEmail,
        subject: "Payment failed",
        html: `
          <h2>Payment Failed</h2>
          <p>We were unable to process your payment.</p>
          <p><b>Trip ID:</b> ${payload.tripId}</p>
          <p><b>Reason:</b> ${payload.reason}</p>
          <p>Please contact support.</p>
        `,
      });
      logger.info({ tripId: payload.tripId }, "Payment failed email sent");
    } catch (error) {
      logger.error(
        { error, tripId: payload.tripId },
        "Failed to send payment failed email",
      );
    }
  }
}
