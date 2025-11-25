// src/screens/FinalResultsScreen.js
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useGame } from "../context/GameContext";

export default function FinalResultsScreen({ navigation }) {
  const {
    players,
    roundHistory,
    resetGame,
    totalRounds,
    startSinglePlayer,
    difficulty,
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
    navigation.reset({
      index: 0,
      routes: [{ name: "Home" }],
    });
  };

  const handleSuddenDeath = () => {
    // Usamos el nombre del jugador humano detectado en el marcador
    const currentPlayers = players || [];
    const sortedForSudden = [...currentPlayers];
    const statsForSudden = computePlayerStats(currentPlayers, roundHistory);

    sortedForSudden.sort((a, b) =>
      comparePlayersWithTiebreakers(a, b, statsForSudden)
    );

    const humanFromSorted =
      sortedForSudden.find((p) => !p.isBot) ||
      sortedForSudden[0] ||
      { name: "Jugador" };

    const playerName = humanFromSorted.name || "Jugador";
    const diff = difficulty || "easy";

    resetGame();
    startSinglePlayer({
      playerName,
      rounds: 1,
      difficultyLevel: diff,
    });

    navigation.reset({
      index: 0,
      routes: [{ name: "RoundIntro" }],
    });
  };

  if (!players || players.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>No hay resultados para mostrar.</Text>
        <TouchableOpacity style={styles.btnPrimary} onPress={handleBackHome}>
          <Text style={styles.btnPrimaryText}>Volver al inicio</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Stats por jugador (rondas ganadas, mejor ronda, correctas, vacías)
  const statsByPlayer = computePlayerStats(players, roundHistory);

  // Ordenamos jugadores usando tiebreakers
  const sorted = [...players].sort((a, b) =>
    comparePlayersWithTiebreakers(a, b, statsByPlayer)
  );

  const winner = sorted[0];

  // 🚨 AHORA human y cpu se sacan SIEMPRE de la lista con score actualizado
  const human =
    sorted.find((p) => !p.isBot) || sorted[0];
  const cpu =
    sorted.find((p) => p.isBot) || null;

  // ¿Hay empate real en primer lugar (ni siquiera tiebreakers los separan)?
  const topGroup = sorted.filter(
    (p) => comparePlayersWithTiebreakers(p, winner, statsByPlayer) === 0
  );
  const isTieForFirst = topGroup.length > 1;

  const isHumanWinner = !isTieForFirst && winner.id === human.id;

  // Diferencia de puntos (informativo)
  const scoreDiff =
    sorted.length > 1 ? winner.score - sorted[1].score : 0;

  const humanStats = statsByPlayer[human.id] || {
    roundsWon: 0,
    bestRoundScore: 0,
    correctAnswers: 0,
    emptyAnswers: 0,
  };

  const cpuStats = cpu
    ? statsByPlayer[cpu.id] || {
        roundsWon: 0,
        bestRoundScore: 0,
        correctAnswers: 0,
        emptyAnswers: 0,
      }
    : null;

  const roundsPlayed = totalRounds ?? roundHistory.length;

  // Mensaje de header según tiebreaker
  let mainTitle = "Resultados finales";
  let mainSubtitle = "";
  let icon = "🏆";

  if (isTieForFirst) {
    icon = "🤝";
    mainTitle = "Empate";
    mainSubtitle =
      "Ambos jugadores quedaron iguales incluso después de los tiebreakers. Puedes decidirlo en una ronda Sudden Death.";
  } else if (isHumanWinner) {
    icon = "🏆";
    mainTitle = "¡Ganaste la partida!";
    mainSubtitle = "Superaste al CPU usando los criterios de desempate.";
  } else {
    icon = "🤖";
    mainTitle = "El CPU ganó esta vez";
    mainSubtitle = "Te superó usando los criterios de desempate.";
  }

  return (
    <View style={styles.container}>
      {/* Header principal */}
      <Text style={styles.title}>{mainTitle}</Text>
      <Text style={styles.subtitleHeader}>{mainSubtitle}</Text>

      {/* Card de ganador / empate */}
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
                  · Diferencia marcador: +{scoreDiff}
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

        <Text style={styles.tiebreakerInfo}>
          Tiebreakers usados (en orden):{" "}
          <Text style={styles.tiebreakerHighlight}>
            Puntaje total → Rondas ganadas → Mejor ronda → Más respuestas
            correctas
          </Text>
        </Text>
      </View>

      {/* Resumen rápido humano vs CPU */}
      {cpu && (
        <View style={styles.duelCard}>
          <Text style={styles.duelTitle}>Resumen del duelo</Text>
          <View style={styles.duelRow}>
            <View style={styles.duelCol}>
              <Text style={styles.duelName}>{human.name}</Text>
              <Text style={styles.duelStat}>
                Total: {human.score} pts
              </Text>
              <Text style={styles.duelStat}>
                Rondas ganadas: {humanStats.roundsWon}
              </Text>
              <Text style={styles.duelStat}>
                Mejor ronda: {humanStats.bestRoundScore} pts
              </Text>
              <Text style={styles.duelStat}>
                Respuestas correctas: {humanStats.correctAnswers}
              </Text>
              <Text style={styles.duelStat}>
                Casillas vacías: {humanStats.emptyAnswers}
              </Text>
            </View>
            <View style={styles.duelDivider} />
            <View style={styles.duelCol}>
              <Text style={styles.duelName}>{cpu.name}</Text>
              <Text style={styles.duelStat}>
                Total: {cpu.score} pts
              </Text>
              <Text style={styles.duelStat}>
                Rondas ganadas: {cpuStats.roundsWon}
              </Text>
              <Text style={styles.duelStat}>
                Mejor ronda: {cpuStats.bestRoundScore} pts
              </Text>
              <Text style={styles.duelStat}>
                Respuestas correctas: {cpuStats.correctAnswers}
              </Text>
              <Text style={styles.duelStat}>
                Casillas vacías: {cpuStats.emptyAnswers}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Tabla completa de jugadores */}
      <Text style={styles.tableTitle}>Marcador completo</Text>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        {sorted.map((p, index) => {
          const stats = statsByPlayer[p.id] || {
            roundsWon: 0,
            bestRoundScore: 0,
            correctAnswers: 0,
            emptyAnswers: 0,
          };
          const tiedWithWinner =
            comparePlayersWithTiebreakers(p, winner, statsByPlayer) === 0;
          const isWinner = !isTieForFirst && index === 0;

          return (
            <View key={p.id || p.name} style={styles.row}>
              <Text style={styles.pos}>
                {index + 1}
                {index === 0 ? "º" : "º"}
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
                  Rondas ganadas: {stats.roundsWon} · Mejor ronda:{" "}
                  {stats.bestRoundScore} pts · Correctas:{" "}
                  {stats.correctAnswers} · Vacías: {stats.emptyAnswers}
                </Text>
              </View>
              <Text style={styles.playerScore}>{p.score} pts</Text>
            </View>
          );
        })}
      </ScrollView>

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

        <TouchableOpacity style={styles.btnPrimary} onPress={handlePlayAgain}>
          <Text style={styles.btnPrimaryText}>Jugar de nuevo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnSecondary} onPress={handleBackHome}>
          <Text style={styles.btnSecondaryText}>Volver al inicio</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/**
 * Calcula, para cada jugador:
 * - rondas ganadas
 * - mejor puntaje de ronda
 * - respuestas correctas
 * - casillas vacías (solo stats)
 */
function computePlayerStats(players, roundHistory) {
  const stats = {};
  players.forEach((p) => {
    stats[p.id] = {
      roundsWon: 0,
      bestRoundScore: 0,
      correctAnswers: 0,
      emptyAnswers: 0,
    };
  });

  roundHistory.forEach((round) => {
    if (!round || !Array.isArray(round.perPlayer)) return;
    const perPlayer = round.perPlayer;

    // Mejor puntaje de esta ronda
    const maxRoundScore = perPlayer.reduce((max, r) => {
      const rs =
        typeof r.roundScore === "number" ? r.roundScore : 0;
      return rs > max ? rs : max;
    }, 0);

    perPlayer.forEach((r) => {
      const s = stats[r.playerId];
      if (!s) return;

      const roundScore =
        typeof r.roundScore === "number" ? r.roundScore : 0;

      // Mejor ronda personal
      if (roundScore > s.bestRoundScore) {
        s.bestRoundScore = roundScore;
      }

      // Ronda ganada (empates cuentan para ambos)
      if (roundScore === maxRoundScore && maxRoundScore > 0) {
        s.roundsWon += 1;
      }

      // Contar correctas y vacías por categoría
      if (r.perCategoryScore && typeof r.perCategoryScore === "object") {
        Object.values(r.perCategoryScore).forEach((entry) => {
          const points =
            entry && typeof entry.points === "number"
              ? entry.points
              : 0;
          const rawAnswer =
            entry && typeof entry.answer === "string"
              ? entry.answer
              : "";
          const trimmed = rawAnswer.trim();

          if (trimmed.length === 0) {
            s.emptyAnswers += 1;
          } else if (points > 0) {
            s.correctAnswers += 1;
          }
        });
      }
    });
  });

  return stats;
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
  // 1) Puntaje total
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

  // 2) Rondas ganadas
  if (aw !== bw) {
    return bw - aw;
  }

  // 3) Mejor ronda
  if (abest !== bbest) {
    return bbest - abest;
  }

  // 4) Respuestas correctas
  if (acorrect !== bcorrect) {
    return bcorrect - acorrect;
  }

  // Empate total incluso después de los criterios
  return 0;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 24,
    backgroundColor: "#f9fafb",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f9fafb",
  },
  emptyText: {
    fontSize: 16,
    color: "#4b5563",
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 4,
    color: "#111827",
  },
  subtitleHeader: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 12,
  },
  winnerCard: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: "#111827",
    marginBottom: 16,
  },
  trophy: {
    fontSize: 40,
    textAlign: "center",
    marginBottom: 4,
  },
  winnerName: {
    fontSize: 18,
    fontWeight: "600",
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
    color: "#9ca3af",
    textAlign: "center",
    marginTop: 4,
  },
  tiebreakerInfo: {
    fontSize: 11,
    color: "#9ca3af",
    textAlign: "center",
    marginTop: 8,
  },
  tiebreakerHighlight: {
    color: "#facc15",
    fontWeight: "500",
  },
  tiePlayerName: {
    fontSize: 14,
    color: "#f9fafb",
    textAlign: "center",
  },
  duelCard: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 16,
  },
  duelTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#111827",
    textAlign: "center",
  },
  duelRow: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  duelCol: {
    flex: 1,
  },
  duelDivider: {
    width: 1,
    backgroundColor: "#e5e7eb",
    marginHorizontal: 8,
  },
  duelName: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
    color: "#111827",
  },
  duelStat: {
    fontSize: 12,
    color: "#4b5563",
    marginBottom: 2,
  },
  tableTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#111827",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
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
    fontSize: 15,
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
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  footerButtons: {
    marginTop: 8,
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
    fontWeight: "600",
  },
  btnSecondary: {
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  btnSecondaryText: {
    color: "#374151",
    textAlign: "center",
    fontSize: 14,
    fontWeight: "500",
  },
});
