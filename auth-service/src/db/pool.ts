import { Pool } from "pg";
console.log(process.env.DATABASE_URL);


export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
