// import dotenv from "dotenv";
// dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "4008", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  mailer: {
    email: process.env.GMAIL_USER,
    password: process.env.GMAIL_APP_PASSWORD,
  },
};
