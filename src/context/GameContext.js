// src/context/GameContext.js
import React, { createContext, useContext, useState, useMemo } from "react";
import { generateLetter, scoreRound } from "../logic/gameEngine";
import { generateBotAnswers, getBotStopDelay } from "../logic/aiBot";

const GameContext = createContext(null);

// Tiempo total por ronda (en segundos)
const ROUND_TIME_LIMIT = 45;

export function GameProvider({ children }) {
  // modo de juego: por ahora solo "single" (1 vs CPUs)
  const [mode, setMode] = useState(null); // "single" | null

  const [player, setPlayer] = useState(null); // humano
  const [bots, setBots] = useState([]); // varios CPU
  const [players, setPlayers] = useState([]); // [player, ...bots]

  const [difficulty, setDifficulty] = useState("easy"); // "easy" | "medium" | "hard"
  const [roundNumber, setRoundNumber] = useState(0);
  const [totalRounds, setTotalRounds] = useState(5);
  const [currentLetter, setCurrentLetter] = useState(null);
  const [currentAnswers, setCurrentAnswers] = useState({});
  const [roundHistory, setRoundHistory] = useState([]);
  const [stage, setStage] = useState("idle"); // "idle" | "playing" | "roundResults" | "finished"

  // tiempo planificado para que (al menos un) bot diga STOP en esta ronda (segundos)
  const [botStopAfter, setBotStopAfter] = useState(null);

  // 💡 Para no romper Lobby/CreateRoom, dejamos un estado simple de sala local
  const [localRoom, setLocalRoom] = useState(null);

  /**
   * 🔹 CATEGORÍAS POR DEFECTO
   * Deben coincidir EXACTAMENTE con las keys de tu diccionario JSON:
   * "Nombre", "Apellido", "País", "Ciudad", "Animal", "Fruta/Comida", "Color"
   */
  const categories = useMemo(
    () => [
      "Nombre",
      "Apellido",
      "País",
      "Ciudad",
      "Animal",
      "Fruta/Comida",
      "Color",
    ],
    []
  );

  /**
   * 🧠 Helper: factor de velocidad base por dificultad (mismo criterio que en aiBot)
   */
  function getDifficultySpeedMultiplier(d) {
    if (d === "hard") return 1.15;
    if (d === "medium") return 1.0;
    return 0.85;
  }

  /**
   * 🧠 Helper interno: prepara una ronda concreta
   * roundIndex: número de ronda (1, 2, 3...)
   * diffOverride: dificultad a usar en esta ronda (útil al iniciar partida nueva)
   */
  const setupRound = (roundIndex, diffOverride) => {
    const activeDifficulty = diffOverride || difficulty;

    const letter = generateLetter();

    // calcular en cuántos segundos (aprox) el bot más rápido intentará decir STOP
    const botDelay = getBotStopDelay(
      letter,
      categories,
      activeDifficulty,
      ROUND_TIME_LIMIT
    );

    setRoundNumber(roundIndex);
    setCurrentLetter(letter);
    setCurrentAnswers({});
    setStage("playing");
    setBotStopAfter(botDelay);
  };

  /**
   * Iniciar modo 1 jugador vs CPU(s)
   *
   * startSinglePlayer({
   *   playerName,
   *   rounds,
   *   difficultyLevel,
   *   numBots // opcional
   * })
   */
  const startSinglePlayer = ({
    playerName,
    rounds,
    difficultyLevel,
    numBots,
  }) => {
    const cleanName =
      playerName && playerName.trim().length > 0 ? playerName.trim() : "Tú";

    const diff = difficultyLevel || "easy";

    // 🔸 Número de bots (si no se pasa, dejamos 1 por ahora)
    const botsCount = numBots && numBots > 0 ? numBots : 1;

    const human = {
      id: "human",
      name: cleanName,
      score: 0,
      isBot: false,
    };

    // Creamos N bots con pequeños cambios de velocidad
    const speedProfiles = [1.15, 1.0, 0.85]; // rápido, normal, lento (para los 3 primeros)
    const botPlayers = Array.from({ length: botsCount }).map((_, index) => {
      const idx = index + 1;

      const baseName =
        diff === "hard"
          ? "CPU Experto"
          : diff === "medium"
          ? "CPU"
          : "CPU Fácil";

      const speedMultiplier =
        speedProfiles[index] ||
        (0.8 + Math.random() * 0.6); // 0.8–1.4 para extras

      return {
        id: `bot-${idx}`,
        name: botsCount === 1 ? baseName : `${baseName} ${idx}`,
        score: 0,
        isBot: true,
        difficulty: diff,
        speedMultiplier,
      };
    });

    setMode("single");
    setPlayer(human);
    setBots(botPlayers);
    setPlayers([human, ...botPlayers]);
    setDifficulty(diff);
    setTotalRounds(rounds || 5);
    setRoundHistory([]);
    setCurrentAnswers({});
    setStage("idle");
    setBotStopAfter(null);

    // 🚀 Siempre empezamos la nueva partida en RONDA 1
    setupRound(1, diff);
  };

  // Siguiente ronda dentro de la misma partida
  const startNextRound = () => {
    const nextRound = roundNumber + 1;
    setupRound(nextRound);
  };

  const updateAnswer = (category, text) => {
    setCurrentAnswers((prev) => ({
      ...prev,
      [category]: text,
    }));
  };

  /**
   * Calcula un speedFactor para un bot dado, según:
   * - su velocidad propia (speedMultiplier)
   * - dificultad
   * - quién dijo STOP
   */
  function getBotSpeedFactor(botPlayer, stoppedBy) {
    const diff = botPlayer.difficulty || difficulty;
    const diffSpeed = getDifficultySpeedMultiplier(diff);
    const baseSpeed = botPlayer.speedMultiplier || 1.0;

    let stopProgress;

    if (stoppedBy === "human") {
      // Humano suele cortar "a la mitad" de la ronda (pero con variación)
      stopProgress = 0.3 + Math.random() * 0.4; // 0.3–0.7
    } else if (stoppedBy === "bot") {
      // Un bot llegó al límite → casi final de la ronda, pero no siempre
      stopProgress = 0.6 + Math.random() * 0.35; // 0.6–0.95
    } else if (stoppedBy === "time") {
      // Se acabó el tiempo → tuvieron toda la ronda
      stopProgress = 1.0;
    } else {
      stopProgress = 0.8;
    }

    const jitter = 0.9 + Math.random() * 0.3; // 0.9–1.2

    let speedFactor = baseSpeed * diffSpeed * stopProgress * jitter;

    // Clamp razonable
    if (speedFactor < 0.2) speedFactor = 0.2;
    if (speedFactor > 1.4) speedFactor = 1.4;

    return speedFactor;
  }

  /**
   * STOP: puede venir del humano, de un bot o del fin de tiempo.
   *
   * AHORA:
   * - Generamos respuestas para TODOS los bots.
   * - Cada bot usa un speedFactor distinto, así que:
   *   - algunos llenan más categorías
   *   - otros menos
   *   - a veces incluso ninguno
   */
  const pressStop = (stoppedBy = "human") => {
    if (stage !== "playing") return;
    if (!currentLetter || !player || bots.length === 0) return;

    const playersWithAnswers = players.map((p) => {
      if (!p.isBot) {
        // Jugador humano → usamos currentAnswers tal cual
        return {
          ...p,
          tempAnswers: currentAnswers,
        };
      }

      // Bot: calculamos su velocidad específica para ESTA ronda
      const speedFactor = getBotSpeedFactor(p, stoppedBy);
      const botAnswers = generateBotAnswers(
        currentLetter,
        categories,
        p.difficulty || difficulty,
        speedFactor
      );

      return {
        ...p,
        tempAnswers: botAnswers,
      };
    });

    finalizeRound(playersWithAnswers, stoppedBy);
  };

  const finalizeRound = (playersWithAnswers, stoppedBy = "human") => {
    const { scoredPlayers, roundResult } = scoreRound({
      players: playersWithAnswers,
      categories,
      letter: currentLetter,
    });

    // añadimos quién dijo STOP al resultado de la ronda
    const resultWithStop = {
      ...roundResult,
      stoppedBy,
    };

    setPlayers(scoredPlayers);
    setRoundHistory((prev) => [...prev, resultWithStop]);
    setStage("roundResults");
  };

  const goFromRoundResults = () => {
    if (roundNumber >= totalRounds) {
      setStage("finished");
    } else {
      startNextRound();
    }
  };

  const resetGame = () => {
    setMode(null);
    setPlayer(null);
    setBots([]);
    setPlayers([]);
    setDifficulty("easy");
    setRoundNumber(0);
    setTotalRounds(5);
    setCurrentLetter(null);
    setCurrentAnswers({});
    setRoundHistory([]);
    setStage("idle");
    setBotStopAfter(null);
    setLocalRoom(null);
  };

  // 🔹 Stubs simples para Lobby/CreateRoom (para que no revienten)
  const createLocalRoom = ({ rounds, players: localPlayers }) => {
    setLocalRoom({
      id: "local-room-1",
      rounds: rounds || 3,
      players: (localPlayers || []).map((name, index) => ({
        id: `local-${index + 1}`,
        name: name || `Jugador ${index + 1}`,
        score: 0,
      })),
    });
  };

  const startLocalGame = () => {
    // En el futuro se puede implementar modo local.
    // Por ahora, no hace nada especial.
  };

  const resetLocalRoom = () => {
    setLocalRoom(null);
  };

  const value = {
    mode,
    player,
    // compatibilidad con código que antes usaba "bot"
    bot: bots[0] || null,
    bots,
    players,
    difficulty,
    roundNumber,
    totalRounds,
    currentLetter,
    categories,
    currentAnswers,
    roundHistory,
    stage,
    roundTimeLimit: ROUND_TIME_LIMIT,
    botStopAfter,
    localRoom,
    // acciones
    startSinglePlayer,
    updateAnswer,
    pressStop,
    goFromRoundResults,
    resetGame,
    createLocalRoom,
    startLocalGame,
    resetLocalRoom,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}
