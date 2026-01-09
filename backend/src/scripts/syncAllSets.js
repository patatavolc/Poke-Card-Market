import axios, { all } from "axios";
import pool from "../config/db";
import "dotenv/config";

const API_URL = "https://api.pokemontcg.io/v2";
const API_KEY = process.env.POKEMON_API_KEY;

// Configuracion de axios
const apiClient = axios.create({
  baseURL: API_URL,
  headers: { "X-Api-Key": API_KEY },
});

// Funcion para pausar las peticiones
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchAllSets() {
  let allSets = [];
  let page = 1;
  let hasMore = true;

  console.log("Obteniendo la lista de todos los sets...");

  while (hasMore) {
    try {
      const response = await apiClient.get("/sets", {
        params: { page, pageSize: 250 }, // 250 es el maximo permitido
      });

      const { data, totalCount, count } = response.data;
      allSets = [...allSets, ...data];

      console.log(`Pagona ${page}: ${data.length} sets encontrados`);

      // Comrpobar si se ha descargado todo
      if (allSets.length >= totalCount) {
        hasMore = false;
      } else {
        page++;
      }
    } catch (error) {
      console.error("Error obteniendo sets:", error.message);
      hasMore = false;
    }
  }
  return allSets;
}
