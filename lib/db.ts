// lib/db.ts
import { Pool } from "pg";

const connectionString = process.env.POSTGRES_URL!;
export const pool = new Pool({
  connectionString,
  max: 3, // small pool is fine on serverless
});
