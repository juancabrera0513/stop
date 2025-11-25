// src/screens/RoundResultsScreen.js
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
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
      navigation.replace("RoundIntro");
    }
  };

  if (!lastRound) {
    return (
      <ImageBackground
        source={require("../../assets/images/stop-bg.png")}
        style={styles.bg}
        imageStyle={styles.bgImage}
      >
        <View style={styles.overlay}>
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No hay resultados de ronda.</Text>
            <TouchableOpacity style={styles.btn} onPress={onContinue}>
              <Text style={styles.btnText}>Continuar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    );
  }

  const stoppedByLabel =
    lastRound.stoppedBy === "human"
      ? "Tú dijiste STOP"
      : lastRound.stoppedBy === "bot"
      ? "El CPU dijo STOP"
      : "Se acabó el tiempo";

  return (
    <ImageBackground
      source={require("../../assets/images/stop-bg.png")}
      style={styles.bg}
      imageStyle={styles.bgImage}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header card */}
          <View style={styles.headerCard}>
            <Text style={styles.title}>Resultados de la ronda</Text>
            <Text style={styles.subtitle}>
              Ronda {roundNumber} de {totalRounds} · Letra{" "}
              <Text style={styles.letterHighlight}>{lastRound.letter}</Text>
            </Text>
            <Text style={styles.summary}>{stoppedByLabel}</Text>
          </View>

          {/* Lista de categorías y respuestas */}
          <View style={styles.contentCard}>
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
            >
              {categories.map((cat) => (
                <View key={cat} style={styles.categoryBlock}>
                  <Text style={styles.categoryTitle}>{cat}</Text>

                  {lastRound.perPlayer.map((r) => {
                    const player = players.find(
                      (p) => p.id === r.playerId
                    ) || { name: r.name };

                    const details = r.perCategoryScore[cat];
                    const rawAnswer =
                      details && typeof details.answer === "string"
                        ? details.answer
                        : "";
                    const points =
                      details && typeof details.points === "number"
                        ? details.points
                        : 0;

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
                          <Text style={styles.answerText}>
                            {displayAnswer}
                          </Text>
                          <Text style={styles.pointsText}>
                            {points} pts
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Botón continuar */}
          <TouchableOpacity style={styles.btn} onPress={onContinue}>
            <Text style={styles.btnText}>
              {roundNumber >= totalRounds
                ? "Ver resultados finales"
                : "Siguiente ronda"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
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
    paddingTop: 110, // deja espacio para el header
    paddingBottom: 20,
  },

  // Estado vacío
  emptyState: {
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

  // Header card
  headerCard: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.96)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.8)",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 14,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#4b5563",
    marginBottom: 4,
  },
  letterHighlight: {
    fontWeight: "800",
    color: "#f97316",
  },
  summary: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
    marginTop: 4,
  },

  // Card donde van las categorías
  contentCard: {
    flex: 1,
    marginTop: 10,
    marginBottom: 8,
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(209,213,219,0.9)",
    overflow: "hidden",
  },

  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    paddingBottom: 18,
  },

  categoryBlock: {
    marginBottom: 12,
    padding: 10,
    borderRadius: 12,
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  categoryTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 6,
    color: "#111827",
  },
  answerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  playerName: {
    width: 90,
    fontSize: 13,
    fontWeight: "600",
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
    backgroundColor: "#bbf7d0",
  },
  badgeYellow: {
    backgroundColor: "#fef9c3",
  },
  badgeRed: {
    backgroundColor: "#fecaca",
  },
  answerText: {
    fontSize: 13,
    flex: 1,
    marginRight: 8,
    color: "#111827",
  },
  pointsText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#111827",
  },

  btn: {
    backgroundColor: "#16a34a",
    paddingVertical: 14,
    borderRadius: 999,
    marginTop: 4,
  },
  btnText: {
    color: "#ffffff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
  },
});

