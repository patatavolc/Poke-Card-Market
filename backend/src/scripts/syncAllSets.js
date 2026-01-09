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
