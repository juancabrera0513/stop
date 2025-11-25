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
import { SafeAreaView } from "react-native-safe-area-context";
import { useGame } from "../context/GameContext";
import TutorialModal from "../components/TutorialModal"; // 👈 NUEVO

const backgroundImage = require("../../assets/images/bg-home.png");

// Botón grande central
const playButtonImage = require("../../assets/images/home-play-button.png");

// Botones inferiores (sin funcionalidad por ahora)
const footerInfoImage = require("../../assets/images/home-footer-info.png");
const footerModesImage = require("../../assets/images/home-footer-modes.png");
const footerSettingsImage = require("../../assets/images/home-footer-settings.png");

function HomeScreen({ navigation }) {
  const [isPressed, setIsPressed] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false); // 👈 estado para el modal
  const { resetGame } = useGame();

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
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.overlay}>
          {/* 🔹 Botón flotante de ayuda (?) */}
          {/* Modifica helpButton para moverlo (top/right) */}
          <TouchableOpacity
            style={styles.helpButton}
            activeOpacity={0.9}
            onPress={() => setShowTutorial(true)}
          >
            <Text style={styles.helpButtonText}>?</Text>
          </TouchableOpacity>

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

          {/* Footer con 3 botones grandes (placeholder, luego les pones navegación) */}
          <View style={styles.footer}>
            {/* Izquierda */}
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => {
                // Futuro: navegación a "Store" o similar
              }}
              style={[styles.footerButtonWrapper, styles.footerButtonWrapperLeft]}
            >
              <Image
                source={footerInfoImage}
                style={styles.footerIconLeft}
                resizeMode="contain"
              />
            </TouchableOpacity>

            {/* Centro */}
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => {
                // Futuro: navegación a "GameModes"
              }}
              style={[
                styles.footerButtonWrapper,
                styles.footerButtonWrapperCenter,
              ]}
            >
              <Image
                source={footerModesImage}
                style={styles.footerIconCenter}
                resizeMode="contain"
              />
            </TouchableOpacity>

            {/* Derecha */}
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => {
                // Futuro: navegación a "Settings/Friends"
              }}
              style={[
                styles.footerButtonWrapper,
                styles.footerButtonWrapperRight,
              ]}
            >
              <Image
                source={footerSettingsImage}
                style={styles.footerIconRight}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      {/* 🔹 Modal de tutorial separado */}
      <TutorialModal
        visible={showTutorial}
        onClose={() => setShowTutorial(false)}
      />
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
  safeArea: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    justifyContent: "space-between",
  },

  // 🔹 Botón flotante de ayuda (?)
  // - Cambia top/right para moverlo
  // - Cambia width/height/fontSize para tamaño
  helpButton: {
    position: "absolute",
    top: 20, // ⬅️ mueve vertical
    right: 20, // ⬅️ mueve horizontal
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(15,23,42,0.85)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  helpButtonText: {
    color: "#f9fafb",
    fontSize: 18,
    fontWeight: "800",
  },

  header: {
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

  centerArea: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  playButtonWrapper: {
    width: "100%",
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
    height: 440,
  },

  // 🔻 FOOTER
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 120,
    marginBottom: 0,
    // Mueve TODOS los íconos hacia arriba/abajo (positivo = más abajo)
    transform: [{ translateY: 37 }],
  },

  footerButtonWrapper: {
    flex: 1,
    alignItems: "center",
  },
  // Mover cada icono de forma INDIVIDUAL:
  footerButtonWrapperLeft: {
    transform: [{ translateY: 1 }, { translateX: -23 }],
  },
  footerButtonWrapperCenter: {
    transform: [{ translateY: 0 }, { translateX: 0 }],
  },
  footerButtonWrapperRight: {
    transform: [{ translateY: 7 }, { translateX: 25 }],
  },

  // Tamaño de cada icono
  footerIconLeft: {
    width: 73,
    height: 73,
  },
  footerIconCenter: {
    width: 98,
    height: 98,
  },
  footerIconRight: {
    width: 150,
    height: 150,
  },
});

export default HomeScreen;
