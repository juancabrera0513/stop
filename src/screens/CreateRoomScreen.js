// src/screens/CreateRoomScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useGame } from "../context/GameContext";

export default function CreateRoomScreen({ navigation }) {
  const { createLocalRoom } = useGame();

  const [rounds, setRounds] = useState(5);
  const [player1, setPlayer1] = useState("Jugador 1");
  const [player2, setPlayer2] = useState("Jugador 2");
  const [player3, setPlayer3] = useState("");
  const [player4, setPlayer4] = useState("");
  const [player5, setPlayer5] = useState("");

  const onCreate = () => {
    const r = rounds || 1;

    const names = [player1, player2, player3, player4, player5]
      .map((n) => (n || "").trim())
      .filter((n) => n.length > 0);

    if (names.length < 2) {
      alert("Necesitas al menos 2 jugadores con nombre.");
      return;
    }

    createLocalRoom({ rounds: r, playerNames: names });
    navigation.replace("Lobby");
  };

  const roundOptions = [1, 2, 3, 4, 5];

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Partida local</Text>
        <Text style={styles.subtitle}>
          Jueguen todos en el mismo dispositivo. Cada jugador tendrá su turno
          para contestar cuando salga la letra.
        </Text>

        <View style={styles.card}>
          {/* RONDAS */}
          <Text style={styles.sectionLabel}>Número de rondas</Text>
          <Text style={styles.helperText}>
            Elige cuántas rondas quieren jugar en esta partida.
          </Text>

          <View style={styles.roundsRow}>
            {roundOptions.map((value) => {
              const isActive = rounds === value;
              return (
                <TouchableOpacity
                  key={value}
                  style={[
                    styles.roundChip,
                    isActive && styles.roundChipActive,
                  ]}
                  onPress={() => setRounds(value)}
                >
                  <Text
                    style={[
                      styles.roundChipText,
                      isActive && styles.roundChipTextActive,
                    ]}
                  >
                    {value}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* JUGADORES */}
          <Text style={[styles.sectionLabel, { marginTop: 24 }]}>
            Jugadores
          </Text>
          <Text style={styles.helperText}>
            Todos jugarán en el mismo dispositivo. Los nombres ayudan a mostrar
            el marcador y los resultados.
          </Text>

          <View style={styles.playersGroup}>
            <Text style={styles.playerLabel}>
              Jugador 1 <Text style={styles.required}>* obligatorio</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={player1}
              onChangeText={setPlayer1}
              placeholder="Nombre del jugador 1"
              maxLength={18}
            />

            <Text style={styles.playerLabel}>
              Jugador 2 <Text style={styles.required}>* obligatorio</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={player2}
              onChangeText={setPlayer2}
              placeholder="Nombre del jugador 2"
              maxLength={18}
            />

            <Text style={styles.playerLabel}>Jugador 3 (opcional)</Text>
            <TextInput
              style={styles.input}
              value={player3}
              onChangeText={setPlayer3}
              placeholder="Nombre del jugador 3"
              maxLength={18}
            />

            <Text style={styles.playerLabel}>Jugador 4 (opcional)</Text>
            <TextInput
              style={styles.input}
              value={player4}
              onChangeText={setPlayer4}
              placeholder="Nombre del jugador 4"
              maxLength={18}
            />

            <Text style={styles.playerLabel}>Jugador 5 (opcional)</Text>
            <TextInput
              style={styles.input}
              value={player5}
              onChangeText={setPlayer5}
              placeholder="Nombre del jugador 5"
              maxLength={18}
            />
          </View>

          <TouchableOpacity style={styles.btn} onPress={onCreate}>
            <Text style={styles.btnText}>Crear partida y continuar</Text>
          </TouchableOpacity>

          <Text style={styles.footerHint}>
            Podrás ver el lobby con todos los jugadores antes de empezar la
            primera ronda.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 32,
    backgroundColor: "#020617", // fondo oscuro tipo app moderna
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#f9fafb",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#9ca3af",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#020617",
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
  roundsRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  roundChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#374151",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#020617",
  },
  roundChipActive: {
    backgroundColor: "#22c55e",
    borderColor: "#22c55e",
    shadowColor: "#22c55e",
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  roundChipText: {
    color: "#e5e7eb",
    fontSize: 14,
    fontWeight: "500",
  },
  roundChipTextActive: {
    color: "#022c22",
    fontWeight: "700",
  },
  playersGroup: {
    marginTop: 8,
    gap: 10,
  },
  playerLabel: {
    fontSize: 13,
    color: "#d1d5db",
    marginTop: 4,
    marginBottom: 4,
  },
  required: {
    color: "#f97316",
    fontSize: 12,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#374151",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#020617",
    color: "#f9fafb",
    fontSize: 14,
  },
  btn: {
    backgroundColor: "#22c55e",
    paddingVertical: 14,
    borderRadius: 999,
    marginTop: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: {
    color: "#052e16",
    fontSize: 16,
    fontWeight: "700",
  },
  footerHint: {
    marginTop: 12,
    fontSize: 12,
    color: "#9ca3af",
    textAlign: "center",
  },
});
