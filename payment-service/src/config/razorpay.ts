import Razorpay from "razorpay";
import { config } from "./index";

if (!config.razorpay.keyId || !config.razorpay.keySecret) {
  throw new Error("RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be set");
}
    
export const razorpay = new Razorpay({
  key_id: config.razorpay.keyId,
  key_secret: config.razorpay.keySecret,
});
