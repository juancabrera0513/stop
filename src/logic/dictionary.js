// src/logic/dictionary.js

// Importa el JSON con tu diccionario en español
// (Nombre, Apellido, País, Ciudad, Animal, Fruta/Comida, Color, etc.)
import rawDictionary from "../data/dictionary.es.json";

// Diccionario completo por categoría
// {
//   "Nombre": [...],
//   "Apellido": [...],
//   ...
// }
const DICTIONARY = rawDictionary;

/**
 * Normalizar texto:
 * - trim()
 * - minúsculas
 * - sin tildes (á -> a, ñ se mantiene como ñ)
 */
export function normalize(str) {
  if (!str) return "";
  return String(str)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // quita acentos/diacríticos
}

/**
 * Devuelve la lista de palabras de una categoría.
 * Si no hay lista o no es un array, devuelve [] para evitar errores.
 */
export function getCategoryList(category) {
  const list = DICTIONARY[category];
  if (!list || !Array.isArray(list)) return [];
  return list;
}

/**
 * Devuelve la primera letra "real" (normalizada) de un string.
 * Ej.: "  México" -> "m"
 */
function firstLetter(str) {
  const norm = normalize(str);
  return norm.charAt(0) || "";
}

/**
 * 🚨 IMPORTANTE: mantenemos la firma original
 * getRandomWord(category, letter, _difficulty)
 *
 * Obtiene una palabra aleatoria del diccionario
 * que empiece por la letra indicada y pertenezca a la categoría.
 *
 * - category: ej. "País"
 * - letter: ej. "M"
 * - _difficulty: se ignora aquí, pero se deja para no romper aiBot.js
 */
export function getRandomWord(category, letter, _difficulty = "easy") {
  const normLetter = firstLetter(letter);
  if (!normLetter) return "";

  const list = getCategoryList(category);

  // Filtramos solo palabras que empiecen por la letra
  const candidates = list.filter(
    (word) => firstLetter(word) === normLetter
  );

  if (candidates.length === 0) {
    // No hay palabras para esa letra/categoría
    return "";
  }

  const idx = Math.floor(Math.random() * candidates.length);
  return candidates[idx];
}

/**
 * 🚨 IMPORTANTE: mantenemos la firma original
 * isWordAllowedForCategory(letter, category, rawAnswer)
 *
 * Verifica si una palabra es válida para:
 * - la categoría dada
 * - la letra de la ronda
 *
 * Reglas:
 * 1) La palabra debe empezar por la letra de la ronda (normalizada).
 * 2) Si existe diccionario para la categoría, la palabra debe estar en él (normalizada).
 * 3) Si NO hay lista para esa categoría, con que cumpla la letra se considera válida.
 *
 * @param {string} letter      - letra de la ronda (ej.: "M")
 * @param {string} category    - categoría (ej.: "País")
 * @param {string} rawAnswer   - respuesta del jugador
 */
export function isWordAllowedForCategory(letter, category, rawAnswer) {
  const normWord = normalize(rawAnswer);
  const normLetter = firstLetter(letter);

  if (!normWord || !normLetter) return false;

  // Debe empezar por la letra de la ronda
  if (!normWord.startsWith(normLetter)) return false;

  const list = getCategoryList(category);

  // Si no hay diccionario para esa categoría, nos conformamos con la letra
  if (!list.length) return true;

  // ¿La palabra (normalizada) está en la lista (normalizada)?
  const exists = list.some((w) => normalize(w) === normWord);
  return exists;
}

// Export opcional del diccionario por si quieres debuggear/inspeccionar
export { DICTIONARY };
