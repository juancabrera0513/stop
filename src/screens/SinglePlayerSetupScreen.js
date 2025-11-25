// src/screens/SinglePlayerSetupScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useGame } from "../context/GameContext";

export default function SinglePlayerSetupScreen({ navigation }) {
  const { startSinglePlayer } = useGame();

  const [playerName, setPlayerName] = useState("Jugador");
  const [rounds, setRounds] = useState(3);
  const [difficulty, setDifficulty] = useState("easy");
  const [cpuCount, setCpuCount] = useState(1); // CPUs rivales

  const onStart = () => {
    if (!playerName.trim()) {
      alert("Escribe un nombre para jugar.");
      return;
    }

    const r = rounds || 1;
    const safeCpuCount =
      typeof cpuCount === "number" && cpuCount > 0 && cpuCount <= 3
        ? cpuCount
        : 1;

    startSinglePlayer({
      playerName: playerName.trim(),
      rounds: r,
      difficultyLevel: difficulty,
      // 👇 aquí conectamos con el GameContext (numBots)
      numBots: safeCpuCount,
    });

    navigation.replace("RoundIntro");
  };

  return (
    <ImageBackground
      source={require("../../assets/images/stop-bg.png")}
      style={styles.bg}
      imageStyle={styles.bgImage}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.header}>
              <Text style={styles.title}>1 jugador vs CPU</Text>
              <Text style={styles.subtitle}>
                Elige tu nombre, la cantidad de rondas y cuántos bots quieres
                como rivales.
              </Text>
            </View>

            <View style={styles.card}>
              {/* Nombre */}
              <Text style={styles.label}>Tu nombre</Text>

              <TextInput
                style={styles.input}
                value={playerName}
                onChangeText={setPlayerName}
                placeholder="Tu nombre"
                placeholderTextColor="#9ca3af"
                maxLength={18}
              />

              {/* Rondas */}
              <Text style={[styles.label, { marginTop: 18 }]}>
                Número de rondas
              </Text>

              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={rounds}
                  onValueChange={(value) => setRounds(value)}
                  dropdownIconColor="#111827"
                  style={styles.picker}
                  itemStyle={styles.pickerItem}
                >
                  {[1, 2, 3, 4, 5].map((num) => (
                    <Picker.Item
                      key={num}
                      label={`${num} ${num === 1 ? "ronda" : "rondas"}`}
                      value={num}
                      color="#111827"
                    />
                  ))}
                </Picker>
              </View>

              {/* Número de CPUs */}
              <Text style={[styles.label, { marginTop: 20 }]}>
                Número de CPUs rivales
              </Text>

              <View style={styles.cpuRow}>
                <CpuButton
                  label="1 CPU"
                  value={1}
                  current={cpuCount}
                  onChange={setCpuCount}
                />
                <CpuButton
                  label="2 CPUs"
                  value={2}
                  current={cpuCount}
                  onChange={setCpuCount}
                />
                <CpuButton
                  label="3 CPUs"
                  value={3}
                  current={cpuCount}
                  onChange={setCpuCount}
                />
              </View>

              {/* Vista previa de jugadores */}
              <View style={styles.playersPreview}>
                <View style={[styles.playerChip, styles.playerChipSelf]}>
                  <Text style={styles.playerChipSelfText}>Tú</Text>
                </View>

                {Array.from({ length: cpuCount }).map((_, index) => (
                  <View key={index} style={styles.playerChip}>
                    <Text style={styles.playerChipCpuText}>
                      CPU {index + 1}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Dificultad */}
              <Text style={[styles.label, { marginTop: 20 }]}>
                Dificultad de la CPU
              </Text>
              <Text style={styles.helperText}>
                La CPU pensará y responderá más rápido en dificultades altas.
              </Text>

              <View style={styles.diffRow}>
                <DiffButton
                  label="Fácil"
                  value="easy"
                  current={difficulty}
                  onChange={setDifficulty}
                />
                <DiffButton
                  label="Normal"
                  value="medium"
                  current={difficulty}
                  onChange={setDifficulty}
                />
                <DiffButton
                  label="Difícil"
                  value="hard"
                  current={difficulty}
                  onChange={setDifficulty}
                />
              </View>

              <TouchableOpacity style={styles.btnStart} onPress={onStart}>
                <Text style={styles.btnText}>Empezar partida</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </ImageBackground>
  );
}

function DiffButton({ label, value, current, onChange }) {
  const active = current === value;
  return (
    <TouchableOpacity
      style={[styles.diffButton, active && styles.diffButtonActive]}
      onPress={() => onChange(value)}
    >
      <Text style={[styles.diffText, active && styles.diffTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function CpuButton({ label, value, current, onChange }) {
  const active = current === value;
  return (
    <TouchableOpacity
      style={[styles.cpuButton, active && styles.cpuButtonActive]}
      onPress={() => onChange(value)}
    >
      <Text style={[styles.cpuButtonText, active && styles.cpuButtonTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
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
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 130,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#4b5563",
  },
  card: {
    marginTop: 10,
    backgroundColor: "rgba(255,255,255,0.3)",
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
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  helperText: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#ffffff",
    color: "#111827",
    fontSize: 15,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#f9fafb",
    marginTop: 4,
  },
  picker: {
    width: "100%",
    color: "#111827",
  },
  pickerItem: {
    fontSize: 15,
  },
  diffRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 8,
    marginBottom: 20,
  },
  diffButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#f9fafb",
    alignItems: "center",
  },
  diffButtonActive: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  diffText: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "500",
  },
  diffTextActive: {
    color: "#ffffff",
    fontWeight: "700",
  },

  // CPUs
  cpuRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 8,
    marginBottom: 10,
  },
  cpuButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#f9fafb",
    alignItems: "center",
  },
  cpuButtonActive: {
    backgroundColor: "#f97316",
    borderColor: "#f97316",
  },
  cpuButtonText: {
    fontSize: 13,
    color: "#111827",
    fontWeight: "500",
  },
  cpuButtonTextActive: {
    color: "#ffffff",
    fontWeight: "700",
  },
  playersPreview: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 6,
  },
  playerChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(15,23,42,0.06)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.8)",
  },
  playerChipSelf: {
    backgroundColor: "#10b981",
    borderColor: "#059669",
  },
  playerChipSelfText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 12,
  },
  playerChipCpuText: {
    color: "#111827",
    fontWeight: "600",
    fontSize: 12,
  },

  btnStart: {
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
  footerHint: {
    marginTop: 10,
    fontSize: 12,
    color: "#6b7280",
    textAlign: "center",
  },
});
