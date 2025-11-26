// src/components/SettingsModal.js
import React from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
} from "react-native";

export default function SettingsModal({
  visible,
  onClose,
  soundEnabled,
  vibrationEnabled,
  onToggleSound,
  onToggleVibration,
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {/* HEADER CON ICONO ⚙️ */}
          <View style={styles.headerRow}>
            <View style={styles.iconCircle}>
              <Text style={styles.iconText}>⚙️</Text>
            </View>
            <Text style={styles.title}>Configuración</Text>
          </View>

          {/* Sonido / efectos */}
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.label}>Efectos de sonido</Text>
              <Text style={styles.helper}>
                Activa o desactiva los sonidos del juego.
              </Text>
            </View>
            <Switch value={soundEnabled} onValueChange={onToggleSound} />
          </View>

          {/* Vibración */}
          <View style={styles.row}>
            <View style={styles.rowText}>
              <Text style={styles.label}>Vibración</Text>
              <Text style={styles.helper}>
                Vibra el dispositivo en momentos clave.
              </Text>
            </View>
            <Switch
              value={vibrationEnabled}
              onValueChange={onToggleVibration}
            />
          </View>

          {/* Botón cerrar */}
          <TouchableOpacity
            style={styles.closeButton}
            activeOpacity={0.9}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>Cerrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: "85%",
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 18,
    backgroundColor: "#F9FAFB",
  },

  // 🧷 Header con icono y título
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(15,23,42,0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  iconText: {
    fontSize: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  rowText: {
    flex: 1,
    marginRight: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  helper: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  closeButton: {
    marginTop: 18,
    alignSelf: "center",
    paddingHorizontal: 28,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#0EA5E9",
  },
  closeButtonText: {
    color: "#F9FAFB",
    fontWeight: "700",
    fontSize: 14,
  },
});
