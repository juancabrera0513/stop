// src/screens/FinalResultsScreen.js
import React, { useEffect } from "react";
import {
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { playSfx } from "../audio/soundManager";
import { useGame } from "../context/GameContext";

export default function FinalResultsScreen({ navigation }) {
  const {
    players,
    roundHistory,
    resetGame,
    totalRounds,
    startSinglePlayer,
    difficulty,
    computePlayerStats,
    soundEnabled,
    vibrationEnabled,
  } = useGame();

  const handleBackHome = () => {
    resetGame();
    navigation.reset({
      index: 0,
      routes: [{ name: "Home" }],
    });
  };

  const handlePlayAgain = () => {
    resetGame();

    // Dejamos Home como raíz y SinglePlayerSetup encima
    navigation.reset({
      index: 1,
      routes: [
        { name: "Home" },
        { name: "SinglePlayerSetup" },
      ],
    });
  };

  const handleSuddenDeath = () => {
    const currentPlayers = players || [];
    const statsForSudden = computePlayerStats(currentPlayers, roundHistory);
    const sortedForSudden = [...currentPlayers];

    sortedForSudden.sort((a, b) =>
      comparePlayersWithTiebreakers(a, b, statsForSudden)
    );

    const humanFromSorted =
      sortedForSudden.find((p) => !p.isBot) ||
      sortedForSudden[0] ||
      { name: "Jugador" };

    const playerName = humanFromSorted.name || "Jugador";
    const diff = difficulty || "easy";
    const botCount = currentPlayers.filter((p) => p.isBot).length || 1;

    resetGame();
    startSinglePlayer({
      playerName,
      rounds: 1,
      difficultyLevel: diff,
      numBots: botCount,
    });

    // Igual que con "Jugar de nuevo": mantenemos Home en el stack
    navigation.reset({
      index: 1,
      routes: [
        { name: "Home" },
        { name: "RoundIntro" },
      ],
    });
  };

  if (!players || players.length === 0) {
    return (
      <ImageBackground
        source={require("../../assets/images/stop-bg.png")}
        style={styles.bg}
        imageStyle={styles.bgImage}
      >
        <View style={styles.overlay}>
          <View style={styles.center}>
            <Text style={styles.emptyText}>
              No hay resultados para mostrar.
            </Text>
            <TouchableOpacity
              style={styles.btnPrimary}
              onPress={handleBackHome}
            >
              <Text style={styles.btnPrimaryText}>Volver al inicio</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    );
  }

  // --- Cálculos de stats y ganador ---
  const statsByPlayer = computePlayerStats(players, roundHistory);
  const sorted = [...players].sort((a, b) =>
    comparePlayersWithTiebreakers(a, b, statsByPlayer)
  );
  const winner = sorted[0];

  const human = sorted.find((p) => !p.isBot) || sorted[0];
  const roundsPlayed = totalRounds ?? roundHistory.length;

  const topGroup = sorted.filter(
    (p) => comparePlayersWithTiebreakers(p, winner, statsByPlayer) === 0
  );
  const isTieForFirst = topGroup.length > 1;
  const isHumanWinner = !isTieForFirst && winner.id === human.id;

  const scoreDiff =
    sorted.length > 1 ? winner.score - sorted[1].score : 0;

  const humanStats = statsByPlayer[human.id] || {
    total: 0,
    roundsWon: 0,
    bestRoundScore: 0,
    correctAnswers: 0,
    emptyAnswers: 0,
  };

  // Mensaje principal
  let mainTitle = "Resultados finales";
  let mainSubtitle = "";
  let icon = "🏆";

  if (isTieForFirst) {
    icon = "🤝";
    mainTitle = "Empate en el marcador";
    mainSubtitle = "Hay varios jugadores con el mismo puntaje.";
  } else if (isHumanWinner) {
    icon = "🏆";
    mainTitle = "¡Victoria!";
    mainSubtitle = "Ganaste la partida.";
  } else {
    icon = "🤖";
    mainTitle = "Las CPUs ganaron";
    mainSubtitle = "Quedaste por debajo en el marcador.";
  }

  // 🔊 SFX de victoria / derrota al entrar a la pantalla final
  useEffect(() => {
    if (!soundEnabled) return;

    if (isTieForFirst) {
      // Si quieres, aquí podríamos reproducir algún SFX neutro
      return;
    }

    const sfxName = isHumanWinner ? "gameWin" : "roundLose";
    playSfx(sfxName, {
      enabled: soundEnabled,
      vibration: vibrationEnabled,
    });
  }, [isTieForFirst, isHumanWinner, soundEnabled, vibrationEnabled]);

  return (
    <ImageBackground
      source={require("../../assets/images/stop-bg.png")}
      style={styles.bg}
      imageStyle={styles.bgImage}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header principal */}
          <View style={styles.headerCard}>
            <Text style={styles.title}>{mainTitle}</Text>
            {!!mainSubtitle && (
              <Text style={styles.subtitleHeader}>{mainSubtitle}</Text>
            )}
          </View>

          {/* Card de ganador / empate (glass dark) */}
          <View style={styles.winnerCard}>
            <Text style={styles.trophy}>{icon}</Text>

            {!isTieForFirst && (
              <>
                <Text style={styles.winnerName}>{winner.name}</Text>
                <Text style={styles.winnerScore}>
                  {winner.score} pts
                  {sorted.length > 1 && (
                    <Text style={styles.scoreDiff}>
                      {" "}
                      · +{scoreDiff} sobre el 2º lugar
                    </Text>
                  )}
                </Text>
              </>
            )}

            {isTieForFirst && (
              <View style={{ marginBottom: 4 }}>
                {topGroup.map((p) => (
                  <Text
                    key={p.id || p.name}
                    style={styles.tiePlayerName}
                  >
                    {p.name} — {p.score} pts
                  </Text>
                ))}
              </View>
            )}

            <Text style={styles.roundInfo}>
              Rondas jugadas: {roundsPlayed}
            </Text>
          </View>

          {/* Resumen rápido del jugador humano */}
          <View style={styles.humanCard}>
            <Text style={styles.humanTitle}>Tu desempeño</Text>
            <Text style={styles.humanName}>{human.name}</Text>
            <Text style={styles.humanStat}>
              Puntaje total:{" "}
              <Text style={styles.humanStatValue}>
                {human.score} pts
              </Text>
            </Text>
            <Text style={styles.humanStat}>
              Rondas ganadas:{" "}
              <Text style={styles.humanStatValue}>
                {humanStats.roundsWon}
              </Text>
            </Text>
            <Text style={styles.humanStat}>
              Mejor ronda:{" "}
              <Text style={styles.humanStatValue}>
                {humanStats.bestRoundScore} pts
              </Text>
            </Text>
            <Text style={styles.humanStat}>
              Respuestas correctas:{" "}
              <Text style={styles.humanStatValue}>
                {humanStats.correctAnswers}
              </Text>
            </Text>
            <Text style={styles.humanStat}>
              Casillas vacías:{" "}
              <Text style={styles.humanStatValue}>
                {humanStats.emptyAnswers}
              </Text>
            </Text>
          </View>

          {/* Tabla completa de jugadores */}
          <Text style={styles.tableTitle}>Marcador completo</Text>
          <View style={styles.tableCard}>
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
            >
              {sorted.map((p, index) => {
                const stats = statsByPlayer[p.id] || {
                  total: 0,
                  roundsWon: 0,
                  bestRoundScore: 0,
                  correctAnswers: 0,
                  emptyAnswers: 0,
                };
                const tiedWithWinner =
                  comparePlayersWithTiebreakers(
                    p,
                    winner,
                    statsByPlayer
                  ) === 0;
                const isWinner = !isTieForFirst && index === 0;

                return (
                  <View
                    key={p.id || p.name}
                    style={styles.row}
                  >
                    <Text style={styles.pos}>
                      {index + 1}
                      {"º"}
                    </Text>
                    <View style={styles.playerInfo}>
                      <Text
                        style={[
                          styles.playerName,
                          (isWinner || tiedWithWinner) &&
                            styles.playerNameWinner,
                        ]}
                      >
                        {p.name} {p.isBot ? "🤖" : "🧑"}
                      </Text>
                      <Text style={styles.playerSub}>
                        Rondas ganadas: {stats.roundsWon} · Mejor
                        ronda: {stats.bestRoundScore} pts ·
                        Correctas: {stats.correctAnswers} ·
                        Vacías: {stats.emptyAnswers}
                      </Text>
                    </View>
                    <Text style={styles.playerScore}>
                      {p.score} pts
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
          </View>

          {/* Botones inferiores */}
          <View style={styles.footerButtons}>
            {isTieForFirst && (
              <TouchableOpacity
                style={[styles.btnPrimary, { marginBottom: 8 }]}
                onPress={handleSuddenDeath}
              >
                <Text style={styles.btnPrimaryText}>
                  Jugar Sudden Death (1 ronda)
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.btnPrimary}
              onPress={handlePlayAgain}
            >
              <Text style={styles.btnPrimaryText}>
                Jugar de nuevo
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.btnSecondary}
              onPress={handleBackHome}
            >
              <Text style={styles.btnSecondaryText}>
                Volver al inicio
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}

/**
 * Tiebreakers:
 * 1) score total (desc)
 * 2) rondas ganadas (desc)
 * 3) mejor ronda (desc)
 * 4) respuestas correctas (desc)
 * Si todo empata → empate real
 */
function comparePlayersWithTiebreakers(a, b, statsByPlayer) {
  if (a.score !== b.score) {
    return b.score - a.score;
  }

  const sa = statsByPlayer[a.id] || {};
  const sb = statsByPlayer[b.id] || {};

  const aw = sa.roundsWon || 0;
  const bw = sb.roundsWon || 0;
  const abest = sa.bestRoundScore || 0;
  const bbest = sb.bestRoundScore || 0;
  const acorrect = sa.correctAnswers || 0;
  const bcorrect = sb.correctAnswers || 0;

  if (aw !== bw) {
    return bw - aw;
  }

  if (abest !== bbest) {
    return bbest - abest;
  }

  if (acorrect !== bcorrect) {
    return bcorrect - acorrect;
  }

  return 0;
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
  },
  bgImage: {
    resizeMode: "cover",
  },
  overlay: {
    flex: 1,
    backgroundColor: "transparent",
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 110,
    paddingBottom: 16,
  },

  center: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 110,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#111827",
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 999,
  },

  headerCard: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.96)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.8)",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 4,
  },
  subtitleHeader: {
    fontSize: 13,
    color: "#4b5563",
  },

  winnerCard: {
    borderRadius: 20,
    padding: 16,
    backgroundColor: "rgba(15,23,42,0.65)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.8)",
    marginBottom: 14,
  },
  trophy: {
    fontSize: 40,
    textAlign: "center",
    marginBottom: 4,
  },
  winnerName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#f9fafb",
    textAlign: "center",
    marginTop: 4,
  },
  winnerScore: {
    fontSize: 14,
    color: "#e5e7eb",
    textAlign: "center",
    marginTop: 4,
  },
  scoreDiff: {
    fontWeight: "600",
  },
  roundInfo: {
    fontSize: 12,
    color: "#d1d5db",
    textAlign: "center",
    marginTop: 8,
  },
  tiePlayerName: {
    fontSize: 14,
    color: "#f9fafb",
    textAlign: "center",
  },

  humanCard: {
    borderRadius: 20,
    padding: 14,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 14,
  },
  humanTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  humanName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 6,
  },
  humanStat: {
    fontSize: 12,
    color: "#4b5563",
    marginBottom: 2,
  },
  humanStatValue: {
    fontWeight: "600",
    color: "#111827",
  },

  tableTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },
  tableCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 10,
    overflow: "hidden",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    paddingBottom: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
  },
  pos: {
    width: 30,
    fontSize: 14,
    color: "#6b7280",
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 14,
    color: "#111827",
  },
  playerNameWinner: {
    fontWeight: "700",
  },
  playerSub: {
    fontSize: 11,
    color: "#6b7280",
  },
  playerScore: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    marginLeft: 8,
  },

  footerButtons: {
    marginTop: 4,
  },
  btnPrimary: {
    backgroundColor: "#16a34a",
    paddingVertical: 14,
    borderRadius: 999,
    marginBottom: 8,
  },
  btnPrimaryText: {
    color: "#ffffff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
  },
  btnSecondary: {
    paddingVertical: 13,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#111827",
    backgroundColor: "#111827",
  },
  btnSecondaryText: {
    color: "#f9fafb",
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
  },
});
