// src/logic/dictionary.js

// Importa el JSON con tu diccionario en español
// Ajusta la ruta si lo guardaste en otro sitio.
import rawDictionary from "../data/dictionary.es.json";

// Tu diccionario completo (por categoría)
const DICTIONARY = rawDictionary;

// Normalizar: sin espacios extremos, minúsculas, sin tildes
function normalize(str) {
  if (!str) return "";
  return String(str)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // quita acentos
}

/**
 * Devuelve una palabra aleatoria del diccionario para una
 * categoría/letra.
 *
 * REGLA IMPORTANTE:
 * - SOLO devuelve palabras que empiezan con la letra de la ronda.
 * - Si no hay ninguna palabra real para esa letra → devuelve "",
 *   para que el bot pueda entrar en "modo fallo" y generar
 *   una palabra inventada pero con la letra correcta.
 *
 * El parámetro `difficulty` se mantiene en la firma para no romper
 * el código del bot, pero aquí lo ignoramos.
 */
export function getRandomWord(category, letter, _difficulty = "easy") {
  const list = DICTIONARY[category];
  if (!list || !Array.isArray(list) || list.length === 0) return "";

  const normLetter = normalize(letter).charAt(0);
  if (!normLetter) return "";

  // Filtrar SOLO palabras reales que empiezan con la letra
  const filtered = list.filter((w) =>
    normalize(w).startsWith(normLetter)
  );

  if (filtered.length > 0) {
    const idx = Math.floor(Math.random() * filtered.length);
    return filtered[idx];
  }

  // Si no hay palabras reales para esa letra en esta categoría,
  // devolvemos "" para que la IA genere un fallo "humano"
  // (palabra inventada pero con la letra correcta).
  return "";
}

/**
 * Valida si una palabra es aceptada para:
 * - esta letra
 * - esta categoría
 *
 * Reglas:
 * - Debe empezar con la letra (después de normalizar).
 * - Si existe diccionario para la categoría, SOLO es válida
 *   si está en la lista.
 * - Si NO hay diccionario para esa categoría, aceptamos
 *   cualquier palabra que empiece por la letra.
 */
export function isWordAllowedForCategory(
  letter,
  category,
  rawAnswer
) {
  const normWord = normalize(rawAnswer);
  const normLetter = normalize(letter).charAt(0);

  if (!normWord || !normLetter) return false;
  if (!normWord.startsWith(normLetter)) return false;

  const list = DICTIONARY[category];

  if (!list || !Array.isArray(list)) {
    // Sin diccionario para esa categoría → con que empiece por la letra, vale.
    return true;
  }

  // ¿La palabra (normalizada) está en la lista (normalizada)?
  const exists = list.some((w) => normalize(w) === normWord);
  return exists;
}
