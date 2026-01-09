import express from "express";
import "dotenv/config";
import pool from "./config/db.js";
import { iniciarOrquestador } from "./daemon.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    uptime: process.uptime(),
    timestamp: new Date(),
  });
});

app.get("/api/cards", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM cards ORDER BY id LIMIT 20");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
  iniciarOrquestador();
});
