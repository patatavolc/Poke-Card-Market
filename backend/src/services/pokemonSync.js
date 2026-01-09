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

async function fetchAllSets() {
  let allSets = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    try {
      const response = await apiClient.get("/sets", {
        params: { page, pageSize: 250 }, // 250 es el maximo permitido
      });

      const { data, totalCount, count } = response.data;
      allSets = [...allSets, ...data];


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

async function fetchCardsForSet(setId) {
  let allCards = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    try {
      // Buscar cartas por set.id
      const response = await apiClient.get("/cards", {
        params: { q: `set.id:${setId}`, page, pageSize: 250 },
      });

      const { data, totalCount } = response.data;
      allCards = [...allCards, ...data];

      if (allCards.length >= totalCount) {
        hasMore = false;
      } else {
        page++;
      }
    } catch (error) {
      console.error(`Error obteniendo cartas del set ${setId}:`, error.message);
      hasMore = false;
    }
  }
  return allCards;
}


async function saveCardsToDb(cards, setId) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Consulta para insertar en lote
    const queryText = `
      INSERT INTO card (id, name, set_id, rarity, image_url)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (id) DO UPDATE
      SET image_url = EXLUDED.image_url,
          rarity = EXCLUDED.rarity;
    `;

    for (const carta of cards) {
      // Mapeo
      const values = [
        carta.id,
        carta.name,
        setId,
        carta.rarity || "Unkown",
        carta.images.large || carta.images.small,
      ];
      await client.query(queryText, values);
    }

    await client.query("COMMIT");
    console.log(`${cards.length} cartas guardadas del set ${setId}`);
  } catch (e) {
    await client.query("ROLLBACK");
    console.error(`Error guardando en DB el set ${setId}:`, e);
  } finally {
    client.release();
  }
}