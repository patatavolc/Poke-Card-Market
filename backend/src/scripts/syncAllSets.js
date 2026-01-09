import { syncSetsAndCards } from '../services/pokemonSync.js';
import pool from '../config/db.js'; 

async function ejecutarManualmente() {
  console.log("--- INICIO DE EJECUCIÓN MANUAL ---");
  
  const inicio = Date.now();

  // Llamamos a la lógica compartida
  await syncSetsAndCards();
  
  const fin = Date.now();
  const duracion = ((fin - inicio) / 1000).toFixed(2);

  console.log(`--- FIN DE EJECUCIÓN MANUAL (${duracion}s) ---`);
  
  // Cerramos la conexión a la DB para que el script termine
  await pool.end();
}

ejecutarManualmente();