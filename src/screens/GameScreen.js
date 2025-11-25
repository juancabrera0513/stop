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
import plusPng from "../../assets/images/coin-plus.png"; // botón con cruz

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

  useEffect(() => {
    setCurrentIndex(0);
    if (roundTimeLimit) {
      setTimeLeft(roundTimeLimit);
    }
  }, [roundNumber, currentLetter, roundTimeLimit]);

  useEffect(() => {
    if (!currentLetter || !roundTimeLimit) return;
    if (stage !== "playing") return;

    let remaining = roundTimeLimit;
    setTimeLeft(remaining);
    let stopped = false;

    const interval = setInterval(() => {
      remaining -= 1;
      setTimeLeft(remaining);

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
        <Text style={styles.errorText}>
          Algo salió mal, no hay partida activa.
        </Text>
      </View>
    );
  }

  const currentCategory = categories[currentIndex];
  const currentValue = (currentAnswers?.[currentCategory] || "").toString();

  const hasMinLength2 = (value) => value.trim().length >= 2;

  const canGoNext = useMemo(
    () =>
      stage === "playing" &&
      hasMinLength2(currentValue) &&
      currentIndex < categories.length - 1,
    [stage, currentValue, currentIndex, categories.length]
  );

  const allFilled = useMemo(
    () =>
      categories.every((cat) =>
        hasMinLength2((currentAnswers?.[cat] || "").toString())
      ),
    [categories, currentAnswers]
  );

  const canPressStop = useMemo(
    () =>
      stage === "playing" &&
      currentIndex === categories.length - 1 &&
      allFilled,
    [stage, currentIndex, categories.length, allFilled]
  );

  const handleChange = (text) => {
    if (stage !== "playing") return;
    updateAnswer(currentCategory, text);
  };

  const handleNext = () => {
    if (!canGoNext) return;
    setCurrentIndex((prev) => Math.min(prev + 1, categories.length - 1));
  };

  const handleStop = () => {
    if (!canPressStop) return;
    pressStop("human");
    navigation.replace("RoundResults");
  };

  const cpuProgress = useMemo(() => {
    if (
      botStopAfter == null ||
      !roundTimeLimit ||
      typeof timeLeft !== "number"
    ) {
      return 0;
    }

    const elapsed = roundTimeLimit - timeLeft;
    if (elapsed <= 0) return 0;

    const ratio = elapsed / botStopAfter;
    return Math.max(0, Math.min(ratio, 1));
  }, [botStopAfter, roundTimeLimit, timeLeft]);

  const totalQuestions = categories.length;

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
              <View style={styles.iconCircle}>
                <Text style={styles.iconText}>≡</Text>
              </View>

              {/* Coin + monto + botón (imagen) */}
              <View style={styles.coinsWrapper}>
                <View style={styles.coinsShadowBar} />
                <Image
                  source={coinPng}
                  style={styles.coinImage}
                  resizeMode="contain"
                />
                <Text style={styles.coinsAmount}>2,000</Text>
                <TouchableOpacity style={styles.coinsPlusButton}>
                  <Image
                    source={plusPng}
                    style={styles.coinsPlusImage}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Categoría grande */}
            <Text style={styles.categoryTitle}>{currentCategory}</Text>

            {/* STOP + avatares */}
            <View style={styles.stopRow}>
              <AvatarReaction
                side="left"
                baseEmoji="🙂"
                initialReaction="😀"
              />

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

              <AvatarReaction
                side="right"
                baseEmoji="🤖"
                initialReaction="😡"
              />
            </View>

            {/* Input blanco tipo píldora */}
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={currentValue}
                onChangeText={handleChange}
                editable={stage === "playing"}
                placeholder={
                  currentLetter
                    ? `Palabra con ${currentLetter}`
                    : "Escribe tu respuesta"
                }
                placeholderTextColor="#9CA3AF"
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>

            {/* Info de ronda y letra */}
            <View style={styles.infoRow}>
              <Text style={styles.infoText}>
                Ronda {roundNumber} de {totalRounds}
              </Text>
              <Text style={styles.infoText}>
                Tiempo: <Text style={styles.infoHighlight}>{timeLeft}s</Text>
              </Text>
            </View>

            {/* Flecha / STOP más arriba */}
            <View style={styles.bottomButtons}>
              <Text style={styles.questionsText}>
                Pregunta {currentIndex + 1} de {totalQuestions}
              </Text>

              {currentIndex < categories.length - 1 && (
                <TouchableOpacity
                  style={[
                    styles.nextButton,
                    !canGoNext && styles.buttonDisabled,
                  ]}
                  disabled={!canGoNext}
                  onPress={handleNext}
                >
                  <Image
                    source={require("../../assets/images/next-arrow.png")}
                    style={styles.nextIcon}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              )}

              {currentIndex === categories.length - 1 && (
                <TouchableOpacity
                  style={[
                    styles.stopButton,
                    !canPressStop && styles.buttonDisabled,
                  ]}
                  disabled={!canPressStop}
                  onPress={handleStop}
                >
                  <Text style={styles.stopButtonText}>STOP</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
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
  errorText: {
    color: "white",
  },

  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: {
    fontSize: 18,
    color: "#FFFFFF",
  },

  // === COINS HUD estilo mockup ===
  // === COINS HUD estilo mockup ===
coinsWrapper: {
  position: "relative",
  width: 110,            // antes 130, lo hacemos más compacto
  height: 28,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
},
coinsShadowBar: {
  position: "absolute",
  left: 24,              // ⬅️ mueve la SOMBRA hacia la derecha
  width: 80,             // ⬅️ CAMBIA ESTE VALOR PARA AJUSTAR EL ANCHO DE LA SOMBRA
  height: 16,
  borderRadius: 8,
  backgroundColor: "rgba(0,0,0,0.45)",
},
coinImage: {
  width: 30,
  height: 30,
  borderRadius: 13,
  marginLeft: 12,        // ⬅️ mueve la MONEDA hacia la derecha
  marginRight: 0,
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
  marginLeft: 0,
},
coinsPlusImage: {
  width: 32,
  height: 32,
},


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

  stopCenter: {
    flex: 1,
    alignItems: "center",
  },
  stopBadge: {
    width: 150,
    height: 110,
    marginBottom: 6,
  },
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
    borderRadius: 4,
    backgroundColor: "#EF4444",
  },
  stopProgressLabel: {
    fontSize: 11,
    color: "#374151",
  },

  inputWrapper: {
    marginTop: 8,
    marginBottom: 10,
    paddingHorizontal: 8,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 18,
    color: "#111827",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    textAlign: "center",
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: "#111827",
  },
  infoHighlight: {
    fontWeight: "700",
  },

  bottomButtons: {
    alignItems: "center",
    marginTop: 6,
    marginBottom: 4,
  },
  questionsText: {
    fontSize: 13,
    color: "#111827",
    marginBottom: 6,
  },
  nextButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#0F172A",
    alignItems: "center",
    justifyContent: "center",
  },
  nextIcon: {
    width: 24,
    height: 24,
  },
  stopButton: {
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: "#DC2626",
    marginTop: 4,
  },
  stopButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
  buttonDisabled: {
    opacity: 0.4,
  },
});
