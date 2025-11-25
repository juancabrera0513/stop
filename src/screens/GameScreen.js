// src/screens/GameScreen.js
import React, {
  useEffect,
  useState,
  useMemo,
  useRef,
} from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useGame } from "../context/GameContext";
import AvatarReaction from "../components/AvatarReaction";

// 👇 imágenes
import coinPng from "../../assets/images/coin.png";
import plusPng from "../../assets/images/coin-plus.png";
import homeIcon from "../../assets/images/home-footer-modes.png"; // Nuevo icono Home

// 🔹 Longitud mínima para considerar una respuesta "llena" a efectos de STOP.
const MIN_ANSWER_LENGTH = 1;

export default function GameScreen({ navigation }) {
  const {
    player,
    bot,
    currentLetter,
    categories,
    currentAnswers,
    roundNumber,
    totalRounds,
    pressStop,
    updateAnswer,
    stage,
    roundTimeLimit,
    botStopAfter,
  } = useGame();

  const [timeLeft, setTimeLeft] = useState(roundTimeLimit || 45);
  const [currentIndex, setCurrentIndex] = useState(0);

  const pressStopRef = useRef(pressStop);
  useEffect(() => {
    pressStopRef.current = pressStop;
  }, [pressStop]);

  // Reset al cambiar de ronda/letra
  useEffect(() => {
    setCurrentIndex(0);
    if (roundTimeLimit) {
      setTimeLeft(roundTimeLimit);
    }
  }, [roundNumber, currentLetter, roundTimeLimit]);

  // Timer + STOP de CPU / tiempo
  useEffect(() => {
    if (!currentLetter || !roundTimeLimit) return;
    if (stage !== "playing") return;

    let remaining = roundTimeLimit;
    setTimeLeft(remaining);
    let stopped = false;

    const interval = setInterval(() => {
      remaining -= 1;
      setTimeLeft(remaining);

      // STOP del bot (CPU)
      if (
        !stopped &&
        botStopAfter != null &&
        remaining === roundTimeLimit - botStopAfter
      ) {
        stopped = true;
        pressStopRef.current("bot");
        navigation.replace("RoundResults");
        clearInterval(interval);
        return;
      }

      // Se acabó el tiempo
      if (!stopped && remaining <= 0) {
        stopped = true;
        pressStopRef.current("time");
        navigation.replace("RoundResults");
        clearInterval(interval);
        return;
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [
    currentLetter,
    roundNumber,
    roundTimeLimit,
    botStopAfter,
    stage,
    navigation,
  ]);

  if (!player || !bot) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Algo salió mal, no hay partida activa.</Text>
      </View>
    );
  }

  const totalQuestions = categories.length;

  // 🔹 Helper: ¿esta respuesta cuenta como "llena"?
  const isAnswered = (value) =>
    value.toString().trim().length >= MIN_ANSWER_LENGTH;

  const currentCategory = categories[currentIndex];
  const currentValue = (currentAnswers?.[currentCategory] || "").toString();

  // Categorías pendientes (solo vacías)
  const pendingCategories = useMemo(
    () =>
      categories.filter(
        (cat) =>
          !isAnswered((currentAnswers?.[cat] || "").toString())
      ),
    [categories, currentAnswers]
  );

  const answeredCount = totalQuestions - pendingCategories.length;
  const allFilled = pendingCategories.length === 0;

  // NEXT habilitado solo si la actual está llena
  const canGoNext = useMemo(
    () =>
      stage === "playing" &&
      isAnswered(currentValue) &&
      pendingCategories.length > 0,
    [stage, currentValue, pendingCategories.length]
  );

  // SKIP: solo si quedan 2+ pendientes
  const canSkip = useMemo(
    () => stage === "playing" && pendingCategories.length > 1,
    [stage, pendingCategories.length]
  );

  // STOP solo si todo está lleno
  const canPressStop = useMemo(
    () => stage === "playing" && allFilled,
    [stage, allFilled]
  );

  const handleChange = (text) => {
    if (stage !== "playing") return;
    updateAnswer(currentCategory, text);
  };

  // Navegación circular entre pendientes
  const goToNextPending = () => {
    if (pendingCategories.length === 0) return;

    const idxAll = categories.indexOf(currentCategory);
    if (idxAll === -1) return;

    for (let offset = 1; offset <= categories.length; offset++) {
      const nextIdx = (idxAll + offset) % categories.length;
      const cat = categories[nextIdx];

      if (pendingCategories.includes(cat)) {
        setCurrentIndex(nextIdx);
        return;
      }
    }
  };

  const handleNext = () => {
    if (!canGoNext) return;
    goToNextPending();
  };

  const handleSkip = () => {
    if (!canSkip) return;
    goToNextPending();
  };

  const handleStop = () => {
    if (!canPressStop) return;
    pressStop("human");
    navigation.replace("RoundResults");
  };

  // Progreso visual CPU
  const cpuProgress = useMemo(() => {
    if (
      botStopAfter == null ||
      !roundTimeLimit ||
      typeof timeLeft !== "number"
    ) return 0;

    const elapsed = roundTimeLimit - timeLeft;
    if (elapsed <= 0) return 0;

    const ratio = elapsed / botStopAfter;
    return Math.max(0, Math.min(ratio, 1));
  }, [botStopAfter, roundTimeLimit, timeLeft]);

  return (
    <ImageBackground
      source={require("../../assets/images/stop-bg.png")}
      style={styles.bg}
      imageStyle={styles.bgImage}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.overlay}>

            {/* TOP BAR */}
            <View style={styles.topBar}>

              {/* BOTÓN HOME — CORRECTO */}
              <TouchableOpacity
                onPress={() => {
                  navigation.reset({
                    index: 0,
                    routes: [{ name: "Home" }],
                  });
                }}
                style={styles.homeButton}
                activeOpacity={0.8}
              >
                <Image
                  source={homeIcon}
                  style={styles.homeIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>

              {/* Coins HUD */}
              <View style={styles.coinsWrapper}>
                <View style={styles.coinsShadowBar} />
                <Image source={coinPng} style={styles.coinImage} resizeMode="contain" />
                <Text style={styles.coinsAmount}>2,000</Text>
                <TouchableOpacity style={styles.coinsPlusButton}>
                  <Image source={plusPng} style={styles.coinsPlusImage} resizeMode="contain" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Categoría */}
            <Text style={styles.categoryTitle}>{currentCategory}</Text>

            {/* STOP + avatares */}
            <View style={styles.stopRow}>
              <AvatarReaction side="left" baseEmoji="🙂" initialReaction="😀" />

              <View style={styles.stopCenter}>
                <Image
                  source={require("../../assets/images/stop-badge.png")}
                  style={styles.stopBadge}
                  resizeMode="contain"
                />

                <View style={styles.stopProgressBar}>
                  <View
                    style={[
                      styles.stopProgressFill,
                      { width: `${cpuProgress * 100}%` },
                    ]}
                  />
                </View>

                <Text style={styles.stopProgressLabel}>
                  {bot.name} se acerca a STOP ({Math.round(cpuProgress * 100)}%)
                </Text>
              </View>

              <AvatarReaction side="right" baseEmoji="🤖" initialReaction="😡" />
            </View>

            {/* Input */}
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={currentValue}
                onChangeText={handleChange}
                editable={stage === "playing"}
                placeholder={
                  currentLetter ? `Palabra con ${currentLetter}` : "Escribe tu respuesta"
                }
                placeholderTextColor="#9CA3AF"
                autoCapitalize="words"
              />
            </View>

            {/* Info */}
            <View style={styles.infoRow}>
              <Text style={styles.infoText}>
                Ronda {roundNumber} de {totalRounds}
              </Text>
              <Text style={styles.infoText}>
                Tiempo: <Text style={styles.infoHighlight}>{timeLeft}s</Text>
              </Text>
            </View>

            {/* Controles */}
            <View style={styles.bottomButtons}>
              {!allFilled ? (
                <>
                  <Text style={styles.questionsText}>
                    Respondidas: {answeredCount} / {totalQuestions}
                  </Text>

                  <View style={styles.navRow}>
                    <TouchableOpacity
                      style={[styles.skipButton, !canSkip && styles.buttonDisabled]}
                      disabled={!canSkip}
                      onPress={handleSkip}
                    >
                      <Text style={styles.skipButtonText}>Omitir</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.nextButton, !canGoNext && styles.buttonDisabled]}
                      disabled={!canGoNext}
                      onPress={handleNext}
                    >
                      <Image
                        source={require("../../assets/images/next-arrow.png")}
                        style={styles.nextIcon}
                        resizeMode="contain"
                      />
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <>
                  <Text style={styles.questionsText}>Todas las categorías respondidas</Text>
                  <TouchableOpacity
                    style={[styles.stopButton, !canPressStop && styles.buttonDisabled]}
                    disabled={!canPressStop}
                    onPress={handleStop}
                  >
                    <Text style={styles.stopButtonText}>STOP</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>

          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  bgImage: { resizeMode: "cover" },

  overlay: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 72,
    paddingBottom: 12,
    justifyContent: "flex-start",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000",
  },
  errorText: { color: "white" },

  // TOP BAR
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },

  // 🔵 Nuevo botón Home
  homeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.20)",
    alignItems: "center",
    justifyContent: "center",
  },
  homeIcon: {
    width: 22,
    height: 22,
    tintColor: "#FFFFFF",
  },

  coinsWrapper: {
    position: "relative",
    width: 110,
    height: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  coinsShadowBar: {
    position: "absolute",
    left: 24,
    width: 80,
    height: 16,
    borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  coinImage: {
    width: 30,
    height: 30,
    borderRadius: 13,
    marginLeft: 12,
  },
  coinsAmount: {
    flex: 1,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "700",
    color: "#FFE56A",
  },
  coinsPlusButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  coinsPlusImage: { width: 32, height: 32 },

  categoryTitle: {
    textAlign: "center",
    fontSize: 32,
    fontWeight: "900",
    color: "#0F172A",
    marginTop: 8,
    marginBottom: 8,
    textShadowColor: "rgba(0,0,0,0.25)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },

  stopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  stopCenter: { flex: 1, alignItems: "center" },
  stopBadge: { width: 150, height: 110, marginBottom: 6 },

  stopProgressBar: {
    width: 140,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(0,0,0,0.1)",
    overflow: "hidden",
    marginBottom: 4,
  },
  stopProgressFill: {
    height: "100%",
    backgroundColor: "#EF4444",
  },
  stopProgressLabel: { fontSize: 11, color: "#374151" },

  inputWrapper: { marginTop: 8, marginBottom: 10, paddingHorizontal: 8 },

  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 18,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    textAlign: "center",
    color: "#111827",
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  infoText: { fontSize: 12, color: "#111827" },
  infoHighlight: { fontWeight: "700" },

  bottomButtons: { alignItems: "center", marginTop: 6, marginBottom: 4 },
  questionsText: { fontSize: 13, color: "#111827", marginBottom: 6 },

  navRow: { flexDirection: "row", alignItems: "center", gap: 12 },

  skipButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.25)",
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  skipButtonText: { fontSize: 14, fontWeight: "600", color: "#111827" },

  nextButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#0F172A",
    alignItems: "center",
    justifyContent: "center",
  },
  nextIcon: { width: 24, height: 24 },

  stopButton: {
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: "#DC2626",
  },
  stopButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },

  buttonDisabled: { opacity: 0.4 },
});
