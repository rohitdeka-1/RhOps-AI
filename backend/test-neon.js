import { Pool } from '@neondatabase/serverless';
const connectionString = "postgresql://neondb_owner:npg_zq4oBer8wEOb@ep-proud-boat-azfijsu0-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
console.log("Creating pool with connectionString...");
try {
  const pool = new Pool({ connectionString });
  pool.connect().then(client => {
    console.log("Connected!");
    client.release();
  }).catch(err => {
    console.error("Connect error:", err);
  });
} catch(e) {
  console.error("Init error:", e);
}
