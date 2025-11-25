// src/logic/gameEngine.js

/**
 * Motor principal del juego:
 * - generar letras
 * - puntuar rondas
 */

import { isWordAllowedForCategory } from "./dictionary";

/**
 * Alfabeto que se usará para generar letras.
 * Incluye Ñ para soportar español.
 */
const ALPHABET = "ABCDEFGHIJKLMNÑOPQRSTUVWXYZ";

/**
 * Puntos por tipo de respuesta.
 */
const SCORE_CONFIG = {
  UNIQUE: 10,
  SHARED: 5,
  INVALID: 0,
};

/**
 * Genera una letra aleatoria del alfabeto definido.
 */
export function generateLetter() {
  const index = Math.floor(Math.random() * ALPHABET.length);
  return ALPHABET.charAt(index);
}

/**
 * Normaliza para COMPARAR entre jugadores:
 * - trim
 * - colapsa espacios
 * - minúsculas
 */
function normalizeForComparison(raw) {
  if (!raw && raw !== 0) return "";
  const trimmed = String(raw).trim();
  if (!trimmed) return "";
  return trimmed.replace(/\s+/g, " ").toLowerCase();
}

/**
 * Usa el diccionario para validar:
 * - mínimo 2 letras
 * - empieza con la letra
 * - está en el diccionario de la categoría (si existe)
 */
function isValidAnswer(raw, letter, category) {
  if (!letter) return false;
  if (!raw && raw !== 0) return false;

  const trimmed = String(raw).trim();
  if (trimmed.length < 2) return false;

  // Aquí delegamos al diccionario
  return isWordAllowedForCategory(letter, category, trimmed);
}

/**
 * Calcula los puntos asociados a un "status" de respuesta.
 *
 * status:
 * - "empty"
 * - "invalid"
 * - "valid-unique"
 * - "valid-shared"
 */
function getPointsForStatus(status) {
  switch (status) {
    case "valid-unique":
      return SCORE_CONFIG.UNIQUE;
    case "valid-shared":
      return SCORE_CONFIG.SHARED;
    case "invalid":
    case "empty":
    default:
      return SCORE_CONFIG.INVALID;
  }
}

/**
 * Puntúa una ronda completa.
 *
 * @param {Object} params
 * @param {Array} params.players   array de jugadores:
 *   [{ id, name, score, isBot, tempAnswers }]
 *   - tempAnswers: { [categoryName]: string }
 * @param {Array<string>} params.categories
 * @param {string} params.letter
 *
 * @returns {Object} {
 *   scoredPlayers: jugadores con score acumulado actualizado,
 *   roundResult: {
 *     letter,
 *     perPlayer: [{
 *       playerId,
 *       name,
 *       roundScore,
 *       perCategoryScore: {
 *         [categoryName]: {
 *           answer,
 *           normalizedAnswer,
 *           status,
 *           points
 *         }
 *       }
 *     }]
 *   }
 * }
 */
export function scoreRound({ players, categories, letter }) {
  const safePlayers = Array.isArray(players) ? players : [];
  const safeCategories = Array.isArray(categories) ? categories : [];

  // 1) Preprocesar todas las respuestas
  const preprocessed = [];

  safePlayers.forEach((player) => {
    const tempAnswers = player?.tempAnswers || {};
    const playerId = player?.id;

    safeCategories.forEach((cat) => {
      const rawAnswer = tempAnswers[cat] ?? "";
      const trimmed = String(rawAnswer).trim();
      const normalized = normalizeForComparison(rawAnswer);
      const isEmpty = trimmed.length === 0;
      const valid = !isEmpty && isValidAnswer(rawAnswer, letter, cat);

      preprocessed.push({
        playerId,
        category: cat,
        rawAnswer,
        normalized,
        isEmpty,
        isValid: valid,
      });
    });
  });

  // 2) Para cada categoría, ver qué respuestas válidas están repetidas
  const categoryGroups = {}; // { [category]: { [normalizedAnswer]: count } }

  preprocessed.forEach((entry) => {
    const { category, normalized, isValid } = entry;
    if (!isValid || !normalized) return;

    if (!categoryGroups[category]) {
      categoryGroups[category] = {};
    }
    const group = categoryGroups[category];
    group[normalized] = (group[normalized] || 0) + 1;
  });

  // 3) Construir perCategoryScore por jugador
  const perPlayerRoundData = {}; // { [playerId]: { perCategoryScore, roundScore } }

  preprocessed.forEach((entry) => {
    const {
      playerId,
      category,
      rawAnswer,
      normalized,
      isEmpty,
      isValid,
    } = entry;

    if (!perPlayerRoundData[playerId]) {
      perPlayerRoundData[playerId] = {
        perCategoryScore: {},
        roundScore: 0,
      };
    }

    let status;
    if (isEmpty) {
      status = "empty";
    } else if (!isValid) {
      status = "invalid";
    } else {
      const group = categoryGroups[category] || {};
      const count = group[normalized] || 0;
      status = count > 1 ? "valid-shared" : "valid-unique";
    }

    const points = getPointsForStatus(status);

    perPlayerRoundData[playerId].perCategoryScore[category] = {
      answer: rawAnswer,
      normalizedAnswer: normalized,
      status,
      points,
    };
    perPlayerRoundData[playerId].roundScore += points;
  });

  // 4) Construir perPlayer del resultado de ronda
  const perPlayer = safePlayers.map((p) => {
    const pdata = perPlayerRoundData[p.id] || {
      perCategoryScore: {},
      roundScore: 0,
    };

    return {
      playerId: p.id,
      name: p.name,
      roundScore: pdata.roundScore,
      perCategoryScore: pdata.perCategoryScore,
    };
  });

  const roundResult = {
    letter,
    perPlayer,
  };

  // 5) Actualizar score acumulado
  const scoredPlayers = safePlayers.map((p) => {
    const pdata = perPlayerRoundData[p.id] || { roundScore: 0 };
    const prevScore =
      typeof p.score === "number" && !Number.isNaN(p.score) ? p.score : 0;

    return {
      ...p,
      score: prevScore + pdata.roundScore,
      tempAnswers: undefined,
    };
  });

  return {
    scoredPlayers,
    roundResult,
  };
}

/**
 * Utilidad para otros archivos si quieres saber si algo está vacío.
 */
export function isEmptyAnswer(raw) {
  if (!raw && raw !== 0) return true;
  return String(raw).trim().length === 0;
}
