// src/screens/HomeScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Image,
} from "react-native";
import { useGame } from "../context/GameContext";

const backgroundImage = require("../../assets/images/stop-bg.png");
// Asegúrate de guardar tu PNG aquí:
const playButtonImage = require("../../assets/images/home-play-button.png");

export default function HomeScreen({ navigation }) {
  const [isPressed, setIsPressed] = useState(false);
  const { resetGame } = useGame();

  // Al entrar al Home, reinicia el estado del juego (ronda, puntajes, etc.)
  useEffect(() => {
    resetGame();
  }, [resetGame]);

  const handlePressIn = () => setIsPressed(true);
  const handlePressOut = () => setIsPressed(false);

  return (
    <ImageBackground
      source={backgroundImage}
      style={styles.bg}
      imageStyle={styles.bgImage}
    >
      <View style={styles.overlay}>
        {/* Títulos */}
        <View style={styles.header}>
          <Text style={styles.appName}>STOP</Text>
          <Text style={styles.title}>Juego de palabras</Text>
        </View>

        {/* Botón principal */}
        <View style={styles.centerArea}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => navigation.navigate("SinglePlayerSetup")}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={[
              styles.playButtonWrapper,
              isPressed && styles.playButtonWrapperPressed,
            ]}
          >
            <Image
              source={playButtonImage}
              style={styles.playButtonImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        {/* Texto inferior */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Más modos de juego llegarán pronto
          </Text>
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
    paddingHorizontal: 24,
    paddingVertical: 32,
    justifyContent: "space-between",
  },

  header: {
    marginTop: 32,
    alignItems: "center",
  },
  appName: {
    fontSize: 36,
    fontWeight: "900",
    letterSpacing: 3,
    color: "#FFFFFF",
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 5,
  },
  title: {
    marginTop: 4,
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 13,
    color: "rgba(255,255,255,0.9)",
    textAlign: "center",
  },

  centerArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  // 🔹 Botón grande
  playButtonWrapper: {
    width: "100%", // más ancho
    maxWidth: 420,
    borderRadius: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
    transform: [{ scale: 1 }],
  },
  playButtonWrapperPressed: {
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
    transform: [{ scale: 0.97 }],
  },
  playButtonImage: {
    width: "100%",
    height: 440, // tamaño grande como pusiste
  },

  footer: {
    alignItems: "center",
    marginBottom: 8,
  },
  footerText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
  },
});
