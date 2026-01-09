import pg from "pg";
import "dotenv/config";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

pool.on("connect", () => {
  console.log("✅ Conectado a la base de datos");
});

pool.on("error", (err) => {
  console.error("❌ Error en el cliente de pg", err);
  process.exit(-1);
});

export default pool;
