import { syncSetsAndCards } from "./services/pokemonSync.js";

// Configuracion
const INTERVALO_MINUTOS = 60; // Ejecutar cada hora (bajar a 5 para pruebas)
const TIEMPO_ESPERA = INTERVALO_MINUTOS * 60 * 1000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function iniciarOrquestador() {
  console.log("[DAEMON] SERVICIO en segundo plano iniciado.");

  while (true) {
    console.log(
      `[DAEMON] Ejecutando tarea programada: ${new Date().toISOString()}`
    );

    try {
      // Ejecutar la logica principal
      await syncSetsAndCards();
    } catch (error) {
      console.error("[DAEMON] Error en el ciclo:", error);
    }

    console.log(`zzz [DAEMON] Durmiendo por ${INTERVALO_MINUTOS} minutos`);

    // Esperar x tiempo antes de la siguiente vuelta
    await sleep(TIEMPO_ESPERA);
  }
}
