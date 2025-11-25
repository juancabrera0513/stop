// src/components/TutorialModal.js
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from "react-native";

export default function TutorialModal({ visible, onClose }) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>Cómo jugar STOP</Text>
          <Text style={styles.subtitle}>Aprende lo básico en unos segundos.</Text>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.content}
          >
            <View className="step" style={styles.step}>
              <Text style={styles.stepNumber}>1</Text>
              <View style={styles.stepTextWrapper}>
                <Text style={styles.stepTitle}>
                  Elige tu modo y configuración
                </Text>
                <Text style={styles.stepText}>
                  Toca el botón “Jugar” y decide tu nombre, número de rondas,
                  dificultad y cuántas CPUs quieres como rivales.
                </Text>
              </View>
            </View>

            <View style={styles.step}>
              <Text style={styles.stepNumber}>2</Text>
              <View style={styles.stepTextWrapper}>
                <Text style={styles.stepTitle}>
                  Mira la letra y las categorías
                </Text>
                <Text style={styles.stepText}>
                  Cada ronda tiene una letra aleatoria y varias categorías como
                  Nombre, Apellido, País, Ciudad, Animal, etc. Todas tus
                  respuestas deben empezar con esa letra.
                </Text>
              </View>
            </View>

            <View style={styles.step}>
              <Text style={styles.stepNumber}>3</Text>
              <View style={styles.stepTextWrapper}>
                <Text style={styles.stepTitle}>
                  Escribe y usa el botón STOP
                </Text>
                <Text style={styles.stepText}>
                  Completa las casillas lo más rápido que puedas. Cuando creas
                  que tienes ventaja, toca el botón STOP. La CPU también puede
                  decir STOP automáticamente.
                </Text>
              </View>
            </View>

            <View style={styles.step}>
              <Text style={styles.stepNumber}>4</Text>
              <View style={styles.stepTextWrapper}>
                <Text style={styles.stepTitle}>Puntuación de la ronda</Text>
                <Text style={styles.stepText}>
                  Las respuestas correctas y únicas valen más puntos. Si hay
                  empate en una palabra, ambos reciben menos puntos. Respuestas
                  incorrectas o vacías no suman.
                </Text>
              </View>
            </View>

            <View style={styles.step}>
              <Text style={styles.stepNumber}>5</Text>
              <View style={styles.stepTextWrapper}>
                <Text style={styles.stepTitle}>Gana por puntos totales</Text>
                <Text style={styles.stepText}>
                  Juegas varias rondas. Al final, gana quien tenga más puntos
                  totales. El marcador final te muestra tu desempeño frente a
                  las CPUs.
                </Text>
              </View>
            </View>
          </ScrollView>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>Entendido</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.75)",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  card: {
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 16,
    backgroundColor: "rgba(15,23,42,0.94)",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.8)",
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#f9fafb",
    marginBottom: 4,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 13,
    color: "#e5e7eb",
    textAlign: "center",
    marginBottom: 8,
  },
  scroll: {
    maxHeight: 320,
    marginBottom: 10,
  },
  content: {
    paddingVertical: 4,
    gap: 8,
  },
  step: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 999,
    backgroundColor: "#f97316",
    color: "#ffffff",
    fontWeight: "800",
    textAlign: "center",
    textAlignVertical: "center",
    marginRight: 8,
    overflow: "hidden",
  },
  stepTextWrapper: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#f9fafb",
    marginBottom: 2,
  },
  stepText: {
    fontSize: 12,
    color: "#e5e7eb",
  },
  closeButton: {
    marginTop: 4,
    backgroundColor: "#22c55e",
    paddingVertical: 10,
    borderRadius: 999,
  },
  closeText: {
    color: "#0b1120",
    textAlign: "center",
    fontSize: 14,
    fontWeight: "700",
  },
});
