// src/screens/RoundIntroScreen.js
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
} from "react-native";
import { useGame } from "../context/GameContext";

export default function RoundIntroScreen({ navigation }) {
  const {
    player,
    bot,
    roundNumber,
    totalRounds,
    currentLetter,
    categories,
    difficulty,
  } = useGame();

  const handleStartRound = () => {
    navigation.replace("Game");
  };

  if (!player || !bot || !currentLetter) {
    return (
      <ImageBackground
        source={require("../../assets/images/stop-bg.png")}
        style={styles.bg}
        imageStyle={styles.bgImage}
      >
        <View style={styles.overlay}>
          <View style={styles.center}>
            <Text style={styles.loadingText}>Preparando la partida...</Text>
          </View>
        </View>
      </ImageBackground>
    );
  }

  const difficultyLabel =
    difficulty === "hard"
      ? "Difícil"
      : difficulty === "medium"
      ? "Normal"
      : "Fácil";

  return (
    <ImageBackground
      source={require("../../assets/images/stop-bg.png")}
      style={styles.bg}
      imageStyle={styles.bgImage}
    >
      <View style={styles.overlay}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Ronda preparada</Text>
            <Text style={styles.subtitle}>
              Revisa la letra, la dificultad y las categorías antes de empezar.
            </Text>

            <View style={styles.badgesRow}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  Ronda {roundNumber} de {totalRounds}
                </Text>
              </View>
              <View style={styles.badgeSecondary}>
                <Text style={styles.badgeSecondaryText}>
                  CPU: {difficultyLabel}
                </Text>
              </View>
            </View>
          </View>

          {/* Carta principal */}
          <View style={styles.card}>
            {/* Letra grande */}
            <Text style={styles.cardLabel}>Letra de esta ronda</Text>
            <View style={styles.letterCircle}>
              <Text style={styles.letterText}>{currentLetter}</Text>
            </View>

            {/* Duelo */}
            <View style={styles.vsBox}>
              <Text style={styles.vsTitle}>Duelo</Text>
              <Text style={styles.vsText}>
                {player.name}{" "}
                <Text style={styles.vsHighlight}>vs</Text> {bot.name}
              </Text>
              <Text style={styles.vsSubText}>
                La CPU jugará en modo <Text style={styles.vsSubStrong}>{difficultyLabel}</Text>.
              </Text>
            </View>

            {/* Categorías */}
            <View style={styles.categoriesSection}>
              <Text style={styles.cardLabel}>Categorías que jugarás</Text>
              <Text style={styles.cardHelper}>
                Responde con palabras que empiecen con la letra seleccionada.
              </Text>

              <View style={styles.chipsRow}>
                {categories.map((cat) => (
                  <View key={cat} style={styles.chip}>
                    <Text style={styles.chipText}>{cat}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Botón */}
            <TouchableOpacity style={styles.btnStart} onPress={handleStartRound}>
              <Text style={styles.btnText}>Empezar</Text>
            </TouchableOpacity>

            <Text style={styles.helperNote}>
              Al iniciar la ronda verás el tiempo en pantalla. Escribe lo más
              rápido que puedas antes de que alguien diga STOP.
            </Text>
          </View>
        </ScrollView>
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
    backgroundColor: "transparent", // respetamos el color original del background
  },
  container: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 110, // baja todo para que no se vea pegado arriba
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  loadingText: {
    fontSize: 16,
    color: "#111827",
    textAlign: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
  },

  // Header
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#4b5563",
  },
  badgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#16a34a",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#ffffff",
  },
  badgeSecondary: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  badgeSecondaryText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#111827",
  },

  // Card principal
  card: {
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 22,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.6)",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 14,
    elevation: 6,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 6,
  },

  // Letra
  letterCircle: {
    alignSelf: "center",
    width: 96,
    height: 96,
    borderRadius: 999,
    backgroundColor: "#f97316",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
    marginBottom: 18,
    shadowColor: "#f97316",
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 4,
  },
  letterText: {
    fontSize: 56,
    fontWeight: "900",
    color: "#ffffff",
  },

  // VS Box
  vsBox: {
    borderRadius: 14,
    padding: 12,
    backgroundColor: "#111827",
    marginBottom: 18,
  },
  vsTitle: {
    fontSize: 12,
    color: "#9ca3af",
    marginBottom: 2,
    textTransform: "uppercase",
    letterSpacing: 1,
    textAlign: "center",
  },
  vsText: {
    fontSize: 16,
    color: "#f9fafb",
    fontWeight: "600",
    textAlign: "center",
  },
  vsHighlight: {
    color: "#f97316",
  },
  vsSubText: {
    marginTop: 4,
    fontSize: 12,
    color: "#e5e7eb",
    textAlign: "center",
  },
  vsSubStrong: {
    fontWeight: "700",
    color: "#facc15",
  },

  // Categorías
  categoriesSection: {
    marginTop: 8,
    marginBottom: 18,
  },
  cardHelper: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 8,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  chipText: {
    fontSize: 12,
    color: "#111827",
    fontWeight: "500",
  },

  // Botón
  btnStart: {
    backgroundColor: "#16a34a",
    paddingVertical: 14,
    borderRadius: 999,
  },
  btnText: {
    color: "#ffffff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
  },
  helperNote: {
    marginTop: 10,
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
  },
});
