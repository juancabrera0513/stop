// src/screens/LobbyScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ImageBackground,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useGame } from "../context/GameContext";

export default function LobbyScreen({ navigation }) {
  const { localRoom, startLocalGame, resetLocalRoom } = useGame();

  // Si por alguna razón llegaron al lobby sin room creada
  if (!localRoom) {
    return (
      <ImageBackground
        source={require("../../assets/images/stop-bg.png")}
        style={styles.bg}
        imageStyle={styles.bgImage}
      >
        <View style={styles.overlay}>
          <View style={[styles.container, { justifyContent: "center" }]}>
            <Text style={styles.title}>No hay partida configurada</Text>
            <Text style={styles.subtitle}>
              Primero configura una partida local para poder entrar al lobby.
            </Text>

            <TouchableOpacity
              style={styles.btnPrimary}
              onPress={() => navigation.replace("CreateRoom")}
            >
              <Text style={styles.btnPrimaryText}>Ir a configurar partida</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    );
  }

  const { rounds, playerNames } = localRoom;

  // Rondas seleccionadas (dropdown 1–5)
  const [selectedRounds, setSelectedRounds] = useState(rounds || 1);

  const handleStart = () => {
    // Inicializa la partida en el contexto
    // Puedes hacer que startLocalGame reciba selectedRounds si quieres
    // Ej: startLocalGame({ rounds: selectedRounds });
    startLocalGame(selectedRounds);
    navigation.replace("Game"); // Ajusta el nombre de la screen si usas otro
  };

  const handleBackToConfig = () => {
    if (resetLocalRoom) {
      resetLocalRoom();
    }
    navigation.goBack();
  };

  return (
    <ImageBackground
      source={require("../../assets/images/stop-bg.png")}
      style={styles.bg}
      imageStyle={styles.bgImage}
    >
      <View style={styles.overlay}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Lobby de la partida</Text>
          <Text style={styles.subtitle}>
            Revisa los jugadores y el número de rondas. Cuando estén listos,
            comiencen la primera ronda.
          </Text>

          <View style={styles.card}>
            {/* Info general */}
            <View style={styles.infoRow}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Partida local</Text>
              </View>
              <View style={styles.badgeSecondary}>
                <Text style={styles.badgeSecondaryText}>
                  {selectedRounds}{" "}
                  {selectedRounds === 1 ? "ronda" : "rondas"}
                </Text>
              </View>
              <View style={styles.badgeSecondary}>
                <Text style={styles.badgeSecondaryText}>
                  {playerNames.length}{" "}
                  {playerNames.length === 1 ? "jugador" : "jugadores"}
                </Text>
              </View>
            </View>

            {/* Dropdown de rondas */}
            <View style={styles.roundsSection}>
              <Text style={styles.sectionLabel}>Número de rondas</Text>
              <Text style={styles.helperText}>
                Puedes ajustar las rondas antes de comenzar. Para partidas
                rápidas, usa 1–2 rondas. Para partidas largas, usa 4–5.
              </Text>

              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={selectedRounds}
                  onValueChange={(value) => setSelectedRounds(value)}
                  dropdownIconColor="#e5e7eb"
                  style={styles.picker}
                  itemStyle={styles.pickerItem}
                >
                  {[1, 2, 3, 4, 5].map((num) => (
                    <Picker.Item
                      key={num}
                      label={`${num} ${num === 1 ? "ronda" : "rondas"}`}
                      value={num}
                      color="#e5e7eb"
                    />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Jugadores */}
            <Text style={[styles.sectionLabel, { marginTop: 20 }]}>
              Jugadores
            </Text>
            <Text style={styles.helperText}>
              Estos serán los jugadores que aparecerán en el marcador y en las
              comparaciones de respuestas.
            </Text>

            <View style={styles.playersList}>
              {playerNames.map((name, index) => (
                <View key={index} style={styles.playerItem}>
                  <View style={styles.playerAvatar}>
                    <Text style={styles.playerAvatarText}>{index + 1}</Text>
                  </View>
                  <View style={styles.playerInfo}>
                    <Text style={styles.playerName}>{name}</Text>
                    <Text style={styles.playerSubText}>
                      Jugador {index + 1}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.divider} />

            <Text style={styles.readyText}>
              Cuando todos estén listos, pulsa{" "}
              <Text style={{ fontWeight: "700", color: "#e5e7eb" }}>
                “Empezar primera ronda”
              </Text>
              . La letra se elegirá automáticamente y el tiempo comenzará a
              correr.
            </Text>

            <TouchableOpacity style={styles.btnPrimary} onPress={handleStart}>
              <Text style={styles.btnPrimaryText}>Empezar primera ronda</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnSecondary}
              onPress={handleBackToConfig}
            >
              <Text style={styles.btnSecondaryText}>
                Volver a configuración
              </Text>
            </TouchableOpacity>
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
    backgroundColor: "rgba(3,7,18,0.85)",
  },
  container: {
    padding: 20,
    paddingBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#f9fafb",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#e5e7eb",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "rgba(15,23,42,0.95)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1f2937",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 16,
    gap: 8,
  },
  badge: {
    backgroundColor: "#22c55e",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: {
    color: "#052e16",
    fontSize: 12,
    fontWeight: "700",
  },
  badgeSecondary: {
    backgroundColor: "rgba(148,163,184,0.12)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.4)",
  },
  badgeSecondaryText: {
    color: "#e5e7eb",
    fontSize: 12,
    fontWeight: "500",
  },
  roundsSection: {
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#e5e7eb",
    marginBottom: 4,
  },
  helperText: {
    fontSize: 12,
    color: "#9ca3af",
    marginBottom: 10,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "rgba(55,65,81,0.9)",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "rgba(15,23,42,0.98)",
  },
  picker: {
    width: "100%",
    color: "#e5e7eb",
  },
  pickerItem: {
    fontSize: 14,
  },
  playersList: {
    marginTop: 4,
    marginBottom: 12,
  },
  playerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: "rgba(15,23,42,0.9)",
    borderWidth: 1,
    borderColor: "rgba(31,41,55,0.9)",
    marginBottom: 6,
  },
  playerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 999,
    backgroundColor: "rgba(34,197,94,0.12)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(34,197,94,0.6)",
    marginRight: 10,
  },
  playerAvatarText: {
    color: "#bbf7d0",
    fontWeight: "700",
    fontSize: 14,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    color: "#f9fafb",
    fontSize: 14,
    fontWeight: "600",
  },
  playerSubText: {
    color: "#9ca3af",
    fontSize: 12,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(31,41,55,0.9)",
    marginVertical: 10,
  },
  readyText: {
    fontSize: 12,
    color: "#9ca3af",
    marginBottom: 16,
  },
  btnPrimary: {
    backgroundColor: "#22c55e",
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  btnPrimaryText: {
    color: "#052e16",
    fontSize: 16,
    fontWeight: "700",
  },
  btnSecondary: {
    marginTop: 10,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  btnSecondaryText: {
    color: "#e5e7eb",
    fontSize: 14,
    fontWeight: "500",
  },
});
