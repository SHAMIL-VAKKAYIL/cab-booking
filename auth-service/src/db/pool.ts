import { Pool } from "pg";
import { config } from "../config/index.js";

export const pool = new Pool(config.db);
