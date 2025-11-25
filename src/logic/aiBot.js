// src/logic/aiBot.js
import { getRandomWord } from "./dictionary";

/**
 * Utilidad simple para número entero aleatorio [min, max]
 */
function randomInt(min, max) {
  const lo = Math.ceil(min);
  const hi = Math.floor(max);
  return Math.floor(Math.random() * (hi - lo + 1)) + lo;
}

/**
 * Devuelve un “factor de velocidad base” según dificultad.
 * Esto no es tiempo real, solo una forma de que:
 * - hard → contesta más categorías
 * - easy → menos
 */
function getDifficultySpeedMultiplier(difficulty = "easy") {
  if (difficulty === "hard") return 1.15;
  if (difficulty === "medium") return 1.0;
  return 0.85; // easy
}

/**
 * Probabilidad base de que un bot intente contestar una categoría
 * según dificultad (antes de aplicar velocidad).
 */
function getBaseAnswerChance(difficulty = "easy") {
  if (difficulty === "hard") return 0.9;
  if (difficulty === "medium") return 0.75;
  return 0.6; // easy
}

/**
 * Genera todas las respuestas de UN bot para una ronda.
 *
 * letter: letra de la ronda
 * categories: array de categorías
 * difficulty: "easy" | "medium" | "hard"
 * speedFactor: factor 0–>∞ (normalmente entre 0.2 y 1.3) que simula
 *              qué tanto le dio tiempo a este bot antes del STOP.
 *
 * Cuanto mayor sea speedFactor → más categorías contestará.
 */
export function generateBotAnswers(
  letter,
  categories,
  difficulty = "easy",
  speedFactor = 1
) {
  const answers = {};
  const baseChance = getBaseAnswerChance(difficulty);
  const difficultySpeed = getDifficultySpeedMultiplier(difficulty);

  // Chance global de este bot para la ronda
  let globalChance = baseChance * difficultySpeed * speedFactor;

  // Clamp razonable
  if (globalChance < 0.1) globalChance = 0.1;
  if (globalChance > 1.0) globalChance = 1.0;

  categories.forEach((category) => {
    // Cada categoría tiene un poco de ruido aleatorio
    const jitter = 0.9 + Math.random() * 0.3; // 0.9–1.2
    const chance = Math.min(1, Math.max(0, globalChance * jitter));

    const roll = Math.random();

    if (roll < chance) {
      // Intenta responder con una palabra real
      const word = getRandomWord(category, letter, difficulty);
      // Si por alguna razón no hay palabra, lo dejamos vacío
      answers[category] = word || "";
    } else {
      // ✨ Realismo: a veces simplemente NO contesta esa categoría
      answers[category] = "";
    }
  });

  // Pequeña probabilidad de que el bot “tiltee” y conteste casi nada
  if (Math.random() < 0.05) {
    Object.keys(answers).forEach((cat, idx) => {
      if (idx > 0) answers[cat] = "";
    });
  }

  return answers;
}

/**
 * Calcula en cuántos segundos (aprox) un bot "rápido" intentaría decir STOP.
 *
 * Esto no se usa para calcular respuestas directas, solo para que la
 * UI sepa cuándo el bot hará STOP automáticamente.
 *
 * letter y categories no se usan mucho ahora, pero se dejan por si
 * en el futuro quieres hacer lógica más compleja.
 */
export function getBotStopDelay(
  letter,
  categories,
  difficulty = "easy",
  roundTimeLimit = 45
) {
  const total = typeof roundTimeLimit === "number" ? roundTimeLimit : 45;

  let minRatio;
  let maxRatio;

  if (difficulty === "hard") {
    // hard → suele decir STOP antes (más rápido)
    minRatio = 0.35;
    maxRatio = 0.55;
  } else if (difficulty === "medium") {
    minRatio = 0.45;
    maxRatio = 0.75;
  } else {
    // easy → suele tardar más
    minRatio = 0.6;
    maxRatio = 0.9;
  }

  let min = Math.floor(total * minRatio);
  let max = Math.floor(total * maxRatio);

  if (min < 3) min = 3;
  if (max <= min) max = min + 2;
  if (max > total - 1) max = total - 1;

  return randomInt(min, max);
}
