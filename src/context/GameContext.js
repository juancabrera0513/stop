// src/context/GameContext.js
import React, { createContext, useContext, useState, useMemo } from "react";
import { generateLetter, scoreRound } from "../logic/gameEngine";
import { generateBotAnswers, getBotStopDelay } from "../logic/aiBot";

const GameContext = createContext(null);

// Tiempo total por ronda (en segundos)
const ROUND_TIME_LIMIT = 45;

export function GameProvider({ children }) {
  // modo de juego: por ahora solo "single" (1 vs CPU)
  const [mode, setMode] = useState(null); // "single" | null

  const [player, setPlayer] = useState(null); // humano
  const [bot, setBot] = useState(null); // CPU
  const [players, setPlayers] = useState([]); // [player, bot]

  const [difficulty, setDifficulty] = useState("easy"); // "easy" | "medium" | "hard"
  const [roundNumber, setRoundNumber] = useState(0);
  const [totalRounds, setTotalRounds] = useState(5);
  const [currentLetter, setCurrentLetter] = useState(null);
  const [currentAnswers, setCurrentAnswers] = useState({});
  const [roundHistory, setRoundHistory] = useState([]);
  const [stage, setStage] = useState("idle"); // "idle" | "playing" | "roundResults" | "finished"

  // tiempo planificado para que el bot diga STOP en esta ronda (segundos)
  const [botStopAfter, setBotStopAfter] = useState(null);

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
   * 🧠 Helper interno: prepara una ronda concreta
   * roundIndex: número de ronda (1, 2, 3...)
   * diffOverride: dificultad a usar en esta ronda (útil al iniciar partida nueva)
   */
  const setupRound = (roundIndex, diffOverride) => {
    const activeDifficulty = diffOverride || difficulty;

    const letter = generateLetter();

    // calcular en cuántos segundos el bot intentará decir STOP
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

  // Iniciar modo 1 jugador vs CPU
  const startSinglePlayer = ({ playerName, rounds, difficultyLevel }) => {
    const cleanName =
      playerName && playerName.trim().length > 0 ? playerName.trim() : "Tú";

    const diff = difficultyLevel || "easy";

    const human = {
      id: "human",
      name: cleanName,
      score: 0,
      isBot: false,
    };

    const botPlayer = {
      id: "bot",
      name:
        diff === "hard"
          ? "CPU Experto"
          : diff === "medium"
          ? "CPU"
          : "CPU Fácil",
      score: 0,
      isBot: true,
      difficulty: diff,
    };

    setMode("single");
    setPlayer(human);
    setBot(botPlayer);
    setPlayers([human, botPlayer]);
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

  // STOP: puede venir del humano, del bot o del fin de tiempo
  const pressStop = (stoppedBy = "human") => {
    if (stage !== "playing") return;
    if (!currentLetter || !player || !bot) return;

    // respuestas del bot usando AI sencilla
    const botAnswers = generateBotAnswers(
      currentLetter,
      categories,
      difficulty
    );

    const playersWithAnswers = players.map((p) => {
      if (p.id === "human") {
        return { ...p, tempAnswers: currentAnswers };
      }
      if (p.id === "bot") {
        return { ...p, tempAnswers: botAnswers };
      }
      return p;
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
    setBot(null);
    setPlayers([]);
    setDifficulty("easy");
    setRoundNumber(0);
    setTotalRounds(5);
    setCurrentLetter(null);
    setCurrentAnswers({});
    setRoundHistory([]);
    setStage("idle");
    setBotStopAfter(null);
  };

  const value = {
    mode,
    player,
    bot,
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
    // acciones
    startSinglePlayer,
    updateAnswer,
    pressStop,
    goFromRoundResults,
    resetGame,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}
