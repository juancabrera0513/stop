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
 * Genera una "palabra mal escrita" que:
 * - SIEMPRE comienza con la letra de la ronda
 * - Se basa en una palabra real del diccionario cuando es posible
 *   para que se vea más humana (no puro random).
 */
function makeMisspelledWord(letter, baseWord, fallbackStem = "xxx") {
  const L = (letter || "A").toUpperCase();

  let base = (baseWord || "").toString().trim();

  // Si no tenemos base, usamos el fallback
  if (!base) {
    base = L + fallbackStem;
  }

  // Normalizamos que empiece por la letra de la ronda,
  // pero no nos importa si la original empezaba o no.
  const tail = base.slice(1); // quitamos primera letra original
  let chars = tail.split("");

  if (chars.length === 0) {
    // mínimo 2–3 letras de cola
    const vowels = ["a", "e", "i", "o", "u"];
    const len = randomInt(2, 3);
    const arr = [];
    for (let i = 0; i < len; i++) {
      arr.push(vowels[randomInt(0, vowels.length - 1)]);
    }
    chars = arr;
  } else {
    // Hacemos una ligera mutación: cambiar una letra por otra
    const idx = randomInt(0, chars.length - 1);
    const alphabet = "abcdefghijklmnopqrstuvwxyz";
    const current = chars[idx].toLowerCase();
    let replacement = current;
    let tries = 0;
    while (replacement === current && tries < 5) {
      replacement = alphabet.charAt(randomInt(0, alphabet.length - 1));
      tries++;
    }
    chars[idx] = replacement;
  }

  const mutatedTail = chars.join("");
  return L + mutatedTail;
}

/**
 * Genera todas las respuestas del bot para una ronda.
 *
 * Estrategia:
 * - Según la dificultad, hay distintas probabilidades de:
 *   - usar una palabra correcta de diccionario
 *   - usar una palabra "mal escrita" que igual empieza por la letra
 *
 * NOTA: la validación real de si es correcta o no la hace gameEngine
 * usando el diccionario. Aquí solo decidimos la intención del bot.
 */
export function generateBotAnswers(letter, categories, difficulty = "easy") {
  const cats = Array.isArray(categories) ? categories : [];
  const L = (letter || "A").toUpperCase();

  // Perfil de comportamiento por dificultad
  // correct = probabilidad de intentar usar palabra real del diccionario
  // wrong   = probabilidad de usar palabra mal escrita / inventada
  let profile;
  if (difficulty === "hard") {
    profile = { wrong: 0.1, correct: 0.9 };
  } else if (difficulty === "medium") {
    profile = { wrong: 0.35, correct: 0.65 };
  } else {
    // easy
    profile = { wrong: 0.6, correct: 0.4 };
  }

  const answers = {};

  cats.forEach((cat) => {
    const roll = Math.random();

    const safeCat = (cat || "").toString().trim();
    const stem = safeCat ? safeCat.toLowerCase().slice(0, 3) : "xxx";

    let answer = "";

    if (roll < profile.correct) {
      // Intenta ser correcto: buscar palabra real en el diccionario
      const word = getRandomWord(cat, letter, difficulty);
      if (word && word.trim()) {
        answer = word;
      } else {
        // Sin datos en diccionario → al menos algo que empiece por la letra
        answer = `${L}${stem}`;
      }
    } else {
      // Intenta fallar, pero de forma "humana": mal escrito
      const base = getRandomWord(cat, letter, difficulty);
      answer = makeMisspelledWord(letter, base, stem);
    }

    // Seguridad final: nunca devolver vacío
    if (!answer || !answer.trim()) {
      answer = `${L}${stem}`;
    }

    answers[cat] = answer;
  });

  return answers;
}

/**
 * Determina después de cuántos segundos el bot dirá STOP.
 *
 * Cuanto más difícil:
 * - tiende a decir STOP antes
 * - pero siempre dentro de un rango razonable del tiempo total
 */
export function getBotStopDelay(
  letter,
  categories,
  difficulty,
  roundTimeLimit
) {
  const total = typeof roundTimeLimit === "number" ? roundTimeLimit : 45;

  let minRatio;
  let maxRatio;

  if (difficulty === "hard") {
    // Más rápido
    minRatio = 0.3;
    maxRatio = 0.6;
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
