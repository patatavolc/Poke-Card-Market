import axios, { all } from "axios";
import pool from "../config/db";
import "dotenv/config";
import { createRef } from "react";

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
  if (cards.length === 0) return;

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Consulta para insertar en lote
    const queryText = `
      INSERT INTO card (id, name, set_id, rarity, image_url)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (id) DO NOTHING;
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

async function main() {
  try {
    // Obtener todos los sets
    const sets = await fetchAllSets();
    console.log(`Total de sets a procesar: ${sets.length}`);

    // Procesarlos
    for (const set of sets) {
      const card = await fetchCardsForSet(set.id);

      // Guardar en db
      await saveCardsToDb(cards, set.id);

      await sleep(500);
    }

    console.log("Sincronizacion completada con exito");
  } catch (error) {
    console.error(`Error:`, error);
  } finally {
    await pool.end();
  }
}

main();
