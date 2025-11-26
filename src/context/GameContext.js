// src/context/GameContext.js
import React, { createContext, useContext, useMemo, useState } from "react";
import { playMusic, playSfx, stopMusic } from "../audio/soundManager";
import { generateBotAnswers, getBotStopDelay } from "../logic/aiBot";
import { generateLetter, scoreRound } from "../logic/gameEngine";

const GameContext = createContext(null);

// Tiempo total por ronda (en segundos)
const ROUND_TIME_LIMIT = 45;

export function GameProvider({ children }) {
  const [mode, setMode] = useState(null); // "single" | null

  const [player, setPlayer] = useState(null); // humano
  const [bots, setBots] = useState([]); // varios CPU
  const [players, setPlayers] = useState([]); // [player, ...bots]

  const [difficulty, setDifficulty] = useState("easy");
  const [roundNumber, setRoundNumber] = useState(0);
  const [totalRounds, setTotalRounds] = useState(5);
  const [currentLetter, setCurrentLetter] = useState(null);
  const [currentAnswers, setCurrentAnswers] = useState({});
  const [roundHistory, setRoundHistory] = useState([]);
  const [stage, setStage] = useState("idle"); // "idle" | "playing" | "roundResults" | "finished"

  const [botStopAfter, setBotStopAfter] = useState(null);
  const [localRoom, setLocalRoom] = useState(null);

  const [soundEnabled, setSoundEnabled] = useState(true);
const [vibrationEnabled, setVibrationEnabled] = useState(true);

const toggleSound = () => {
  setSoundEnabled((prev) => {
    const next = !prev;

    if (!next) {
      // 🔇 Se está APAGANDO el sonido → paramos cualquier música
      stopMusic();
    } else {
      // 🔊 Se está ENCENDIENDO otra vez
      // Dependiendo de en qué estado esté el juego, decidimos qué música poner
      if (stage === "idle" || stage === "finished") {
        playMusic("menu", { enabled: true, loop: true });
      } else if (stage === "playing") {
        playMusic("round", { enabled: true, loop: true });
      }
      // Si estuvieras en otra pantalla especial, podrías ajustar aquí
    }

    return next;
  });
};

  const toggleVibration = () => setVibrationEnabled((prev) => !prev);

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

  function getDifficultySpeedMultiplier(d) {
    if (d === "hard") return 1.15;
    if (d === "medium") return 1.0;
    return 0.85;
  }

  /**
   * 🔁 PREPARAR RONDA
   *   👉 OJO: aquí YA NO se llama playMusic("round")
   *   La música de ronda la controla GameScreen.
   */
  const setupRound = (roundIndex, diffOverride) => {
    const activeDifficulty = diffOverride || difficulty;

    const letter = generateLetter();

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
    // ❌ ANTES aquí estaba playMusic("round"); ahora NO.
  };

  const startSinglePlayer = ({
    playerName,
    rounds,
    difficultyLevel,
    numBots,
  }) => {
    const cleanName =
      playerName && playerName.trim().length > 0 ? playerName.trim() : "Tú";

    const diff = difficultyLevel || "easy";
    const botsCount = numBots && numBots > 0 ? numBots : 1;

    const human = {
      id: "human",
      name: cleanName,
      score: 0,
      isBot: false,
    };

    const speedProfiles = [1.15, 1.0, 0.85];
    const botPlayers = Array.from({ length: botsCount }).map((_, index) => {
      const idx = index + 1;

      const baseName =
        diff === "hard"
          ? "CPU Experto"
          : diff === "medium"
          ? "CPU"
          : "CPU Fácil";

      const speedMultiplier =
        speedProfiles[index] || (0.8 + Math.random() * 0.6);

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

    setupRound(1, diff);
  };

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

  function getBotSpeedFactor(botPlayer, stoppedBy) {
    const diff = botPlayer.difficulty || difficulty;
    const diffSpeed = getDifficultySpeedMultiplier(diff);
    const baseSpeed = botPlayer.speedMultiplier || 1.0;

    let stopProgress;

    if (stoppedBy === "human") {
      stopProgress = 0.3 + Math.random() * 0.4;
    } else if (stoppedBy === "bot") {
      stopProgress = 0.6 + Math.random() * 0.35;
    } else if (stoppedBy === "time") {
      stopProgress = 1.0;
    } else {
      stopProgress = 0.8;
    }

    const jitter = 0.9 + Math.random() * 0.3;

    let speedFactor = baseSpeed * diffSpeed * stopProgress * jitter;

    if (speedFactor < 0.2) speedFactor = 0.2;
    if (speedFactor > 1.4) speedFactor = 1.4;

    return speedFactor;
  }

  const pressStop = (stoppedBy = "human") => {
    if (stage !== "playing") return;
    if (!currentLetter || !player || bots.length === 0) return;

    if (stoppedBy === "human") {
      playSfx("stopHuman", {
        enabled: soundEnabled,
        vibration: vibrationEnabled,
      });
    } else if (stoppedBy === "bot") {
      playSfx("stopCpu", {
        enabled: soundEnabled,
        vibration: vibrationEnabled,
      });
    }

    const playersWithAnswers = players.map((p) => {
      if (!p.isBot) {
        return {
          ...p,
          tempAnswers: currentAnswers,
        };
      }

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
      stopMusic();
      playMusic("menu", { enabled: soundEnabled, loop: true });
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

    stopMusic();
    playMusic("menu", { enabled: soundEnabled, loop: true });
  };

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

  const startLocalGame = () => {};
  const resetLocalRoom = () => {
    setLocalRoom(null);
  };

  // Stats simples: puntaje total por jugador (lo dejé como lo tenías)
  function computePlayerStats(playersList, history) {
    const totals = {};
    const safePlayers = Array.isArray(playersList) ? playersList : [];
    const safeHistory = Array.isArray(history) ? history : [];

    safePlayers.forEach((p) => {
      if (!p || !p.id) return;
      totals[p.id] = { total: 0 };
    });

    safeHistory.forEach((round) => {
      if (!round || !round.perPlayer) return;
      const per = round.perPlayer;

      if (Array.isArray(per)) {
        per.forEach((entry) => {
          if (!entry || !entry.playerId) return;
          const playerId = entry.playerId;
          const pts =
            typeof entry.roundScore === "number" ? entry.roundScore : 0;

          if (!totals[playerId]) {
            totals[playerId] = { total: 0 };
          }
          totals[playerId].total += pts;
        });
      } else {
        Object.keys(per).forEach((playerId) => {
          const data = per[playerId];
          const pts =
            data && typeof data.roundScore === "number"
              ? data.roundScore
              : 0;

          if (!totals[playerId]) {
            totals[playerId] = { total: 0 };
          }
          totals[playerId].total += pts;
        });
      }
    });

    safePlayers.forEach((p) => {
      if (!p || !p.id) return;
      if (!totals[p.id]) {
        totals[p.id] = { total: 0 };
      }
    });

    return totals;
  }

  const value = {
    mode,
    player,
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
    soundEnabled,
    vibrationEnabled,
    toggleSound,
    toggleVibration,
    startSinglePlayer,
    updateAnswer,
    pressStop,
    goFromRoundResults,
    resetGame,
    createLocalRoom,
    startLocalGame,
    resetLocalRoom,
    computePlayerStats,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used within GameProvider");
  return ctx;
}
