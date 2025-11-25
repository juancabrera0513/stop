// src/components/AvatarReaction.js
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

/**
 * Componente de avatar con reacciones (emojis)
 *
 * Props:
 * - side: "left" | "right"  (para alinear burbujas)
 * - baseEmoji: emoji del avatar (🙂, 🤖, etc.)
 * - initialReaction: emoji inicial en la burbuja
 * - onReactionChange?: (emoji) => void
 */
const REACTIONS = ["😀", "😭", "😢", "😡"];

export default function AvatarReaction({
  side = "left",
  baseEmoji = "🙂",
  initialReaction = "😀",
  onReactionChange,
}) {
  const [reaction, setReaction] = useState(initialReaction);
  const [pickerOpen, setPickerOpen] = useState(false);

  const isRight = side === "right";

  const handleTogglePicker = () => {
    setPickerOpen((prev) => !prev);
  };

  const handleSelectReaction = (emoji) => {
    setReaction(emoji);
    setPickerOpen(false);
    if (onReactionChange) onReactionChange(emoji);
  };

  return (
    <View style={styles.container}>
      {/* Avatar */}
      <TouchableOpacity
        style={[
          styles.avatarCircle,
          isRight ? styles.avatarRight : styles.avatarLeft,
        ]}
        onPress={handleTogglePicker}
        activeOpacity={0.8}
      >
        <Text style={styles.avatarEmoji}>{baseEmoji}</Text>
      </TouchableOpacity>

      {/* Burbuja con reacción actual */}
      <View
        style={[
          styles.bubble,
          isRight ? styles.bubbleRight : styles.bubbleLeft,
        ]}
      >
        <Text style={styles.bubbleText}>{reaction}</Text>
      </View>

      {/* Picker de reacciones */}
      {pickerOpen && (
        <View
          style={[
            styles.picker,
            isRight ? styles.pickerRight : styles.pickerLeft,
          ]}
        >
          {REACTIONS.map((emoji) => (
            <TouchableOpacity
              key={emoji}
              style={styles.reactionButton}
              onPress={() => handleSelectReaction(emoji)}
            >
              <Text style={styles.reactionEmoji}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const AVATAR_SIZE = 50;

const styles = StyleSheet.create({
  container: {
    width: 70,
    height: 150,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  avatarCircle: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarLeft: {
    backgroundColor: "#9CA3AF",
  },
  avatarRight: {
    backgroundColor: "#8B5CF6",
  },
  avatarEmoji: {
    fontSize: 24,
  },
  bubble: {
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  bubbleLeft: {},
  bubbleRight: {},
  bubbleText: {
    fontSize: 14,
    fontWeight: "700",
  },
  picker: {
    position: "absolute",
    top: 0,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  pickerLeft: {
    left: 0,
  },
  pickerRight: {
    right: 0,
  },
  reactionButton: {
    paddingHorizontal: 2,
  },
  reactionEmoji: {
    fontSize: 18,
  },
});
