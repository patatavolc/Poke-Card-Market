import axios from "axios";
import pool from "../config/db";

const API_URL = "https://api.pokemontcg.io/v2";
const API_KEY = process.env.POKEMON_API_KEY;

const apiClient = axios.create({
  baseURL: API_URL,
  headers: { "X-Api-Key": API_KEY },
  timeout: 10000,
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Funcion para orquestar la descarga y guardado
export async function syncSetsAndCards() {
  console.log("[SYNC] Iniciando ciclo de recoleccion de datos...");
  let client;

  try {
    const sets = await fetchAllSets();
    console.log(`[SYNC Se econtraron ${sets.length} sets. Procesando...`);

    // Procesar cada set
    for (const set of sets) {
      const cards = await fetchCardsForSet(set.id);

      if (cards.lenth > 0) {
        await saveCardsToDb(cards, set.id);
      }

      await sleep(200);
    }

    console.log("[SYNC Ciclo de sincronizacion completado");
  } catch (error) {
    console.error("[SYNC Error durante la sincronizacion", error.message);
  }
}
