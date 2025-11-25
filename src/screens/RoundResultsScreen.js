// src/screens/RoundResultsScreen.js
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useGame } from "../context/GameContext";
import { formatAnswer } from "../helpers/formatAnswer";

export default function RoundResultsScreen({ navigation }) {
  const {
    roundHistory,
    players,
    goFromRoundResults,
    roundNumber,
    totalRounds,
    categories,
  } = useGame();

  const lastRound = roundHistory[roundHistory.length - 1];

  const onContinue = () => {
    goFromRoundResults();

    if (roundNumber >= totalRounds) {
      navigation.replace("FinalResults");
    } else {
      // Ahora siempre pasamos por la pantalla de introducción
      navigation.replace("RoundIntro");
    }
  };

  if (!lastRound) {
    return (
      <View style={styles.container}>
        <Text>No hay resultados de ronda.</Text>
        <TouchableOpacity style={styles.btn} onPress={onContinue}>
          <Text style={styles.btnText}>Continuar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const stoppedByLabel =
    lastRound.stoppedBy === "human"
      ? "Tú dijiste STOP"
      : lastRound.stoppedBy === "bot"
      ? "El CPU dijo STOP"
      : "Se acabó el tiempo";

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Resultados de la ronda</Text>
      <Text style={styles.subtitle}>
        Ronda {roundNumber} de {totalRounds} · Letra {lastRound.letter}
      </Text>
      <Text style={styles.summary}>{stoppedByLabel}</Text>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((cat) => (
          <View key={cat} style={styles.categoryBlock}>
            <Text style={styles.categoryTitle}>{cat}</Text>

            {lastRound.perPlayer.map((r) => {
              const player = players.find((p) => p.id === r.playerId) || {
                name: r.name,
              };

              const details = r.perCategoryScore[cat];
              const rawAnswer =
                details && typeof details.answer === "string"
                  ? details.answer
                  : "";
              const points =
                details && typeof details.points === "number"
                  ? details.points
                  : 0;

              // Colores según puntos: 10 = verde, 5 = amarillo, 0 = rojo
              let badgeStyle = styles.badgeRed;
              if (points >= 10) badgeStyle = styles.badgeGreen;
              else if (points > 0) badgeStyle = styles.badgeYellow;

              const trimmed = rawAnswer.trim();
              const isEmpty = trimmed.length === 0;
              const displayAnswer = isEmpty
                ? "(vacío)"
                : formatAnswer(rawAnswer);

              return (
                <View key={r.playerId} style={styles.answerRow}>
                  <Text style={styles.playerName}>{player.name}</Text>
                  <View style={[styles.answerBadge, badgeStyle]}>
                    <Text style={styles.answerText}>{displayAnswer}</Text>
                    <Text style={styles.pointsText}>{points} pts</Text>
                  </View>
                </View>
              );
            })}
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.btn} onPress={onContinue}>
        <Text style={styles.btnText}>
          {roundNumber >= totalRounds
            ? "Ver resultados finales"
            : "Siguiente ronda"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 24,
    backgroundColor: "#f9fafb",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 4,
    color: "#111827",
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 8,
  },
  summary: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 16,
    color: "#111827",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  categoryBlock: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#111827",
  },
  answerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  playerName: {
    width: 90,
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
  },
  answerBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    flex: 1,
  },
  badgeGreen: {
    backgroundColor: "#bbf7d0", // verde (correcto único)
  },
  badgeYellow: {
    backgroundColor: "#fef9c3", // amarillo (empate)
  },
  badgeRed: {
    backgroundColor: "#fecaca", // rojo (incorrecto o vacío)
  },
  answerText: {
    fontSize: 14,
    flex: 1,
    marginRight: 8,
    color: "#111827",
  },
  pointsText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#111827",
  },
  btn: {
    backgroundColor: "#16a34a",
    paddingVertical: 14,
    borderRadius: 999,
    marginTop: 8,
  },
  btnText: {
    color: "#ffffff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
});
