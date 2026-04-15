import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { logger } from "./logger";
import { config } from ".";
dotenv.config();

if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
  throw new Error("GMAIL_USER and GMAIL_APP_PASSWORD must be set");
}

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: config.mailer.email,
    pass: config.mailer.password,
  },
});

export const verifyMailer = async () => {
  try {
    await transporter.verify();
    logger.info("Mailer is working");
  } catch (error) {
    logger.error({ error }, "Mailer is not working");
  }
};
