// src/audio/soundManager.js
import { Audio } from "expo-av";
import { Platform, Vibration } from "react-native";

// 🎧 SFX cortos
const SFX_FILES = {
  uiOpen: require("../../assets/sounds/ui-open.mp3"),
  uiClick: require("../../assets/sounds/ui-click.mp3"),
  roundStart: require("../../assets/sounds/round-start.mp3"),
  stopHuman: require("../../assets/sounds/stop-human.mp3"),
  timeAlmost: require("../../assets/sounds/time-almost.mp3"),
  gameWin: require("../../assets/sounds/game-win.mp3"),
  roundLose: require("../../assets/sounds/round-lose.mp3"),
};

// 🎵 Música de fondo
const MUSIC_FILES = {
  menu: require("../../assets/sounds/music-menu.mp3"),
  round: require("../../assets/sounds/music-round.mp3"),
};

let currentMusicSound = null;
let currentMusicName = null;
let audioModeConfigured = false;

// 🔑 ID global para evitar carreras entre playMusic / stopMusic
let musicRequestId = 0;

// ⚙️ Config básica de audio
async function ensureAudioMode() {
  if (audioModeConfigured) return;

  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });
    audioModeConfigured = true;
  } catch (err) {
    console.warn("Error configurando Audio mode:", err);
  }
}

// 🔊 Efectos de sonido
export async function playSfx(
  name,
  { enabled = true, vibration = false } = {}
) {
  if (!enabled) return;

  const file = SFX_FILES[name];
  if (!file) return;

  try {
    await ensureAudioMode();

    const { sound } = await Audio.Sound.createAsync(file, {
      shouldPlay: true,
    });

    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.didJustFinish || status.isLoaded === false) {
        sound.unloadAsync();
      }
    });
  } catch (err) {
    console.warn("Error reproduciendo SFX", name, err);
  }

  if (vibration) {
    const duration = Platform.OS === "ios" ? 50 : 30;
    Vibration.vibrate(duration);
  }
}

// 🎵 Música de fondo
export async function playMusic(
  name,
  { enabled = true, loop = true } = {}
) {
  if (!enabled) return;

  const file = MUSIC_FILES[name];
  if (!file) return;

  // Cada vez que alguien pide música, creamos un "token"
  musicRequestId += 1;
  const requestId = musicRequestId;

  try {
    await ensureAudioMode();

    // Si mientras esperábamos el audio mode alguien pidió otra cosa, abortamos
    if (requestId !== musicRequestId) {
      return;
    }

    // Si ya está sonando esa misma pista y sigue siendo el request activo, no hagas nada
    if (currentMusicSound && currentMusicName === name) {
      return;
    }

    // Cortar música anterior (si existe), usando snapshot
    const prevSound = currentMusicSound;
    currentMusicSound = null;
    currentMusicName = null;

    if (prevSound) {
      try {
        await prevSound.stopAsync();
      } catch (e) {
        // ignoramos errores tipo "Seeking interrupted"
      }
      try {
        await prevSound.unloadAsync();
      } catch (e) {
        // ignoramos
      }
    }

    // Crear sonido NUEVO para esta request
    const { sound } = await Audio.Sound.createAsync(file, {
      shouldPlay: true,
      isLooping: loop,
    });

    // ⚠️ Importante: puede que, mientras se cargaba, alguien haya llamado
    // stopMusic() o playMusic() de otra pista → ID cambió
    if (requestId !== musicRequestId) {
      // Esta request ya no es la activa: descargamos y no la usamos
      try {
        await sound.stopAsync();
      } catch (e) {}
      try {
        await sound.unloadAsync();
      } catch (e) {}
      return;
    }

    // Esta request sigue siendo la vigente → actualizamos globales
    currentMusicSound = sound;
    currentMusicName = name;
    console.log("▶️ Reproduciendo música:", name);
  } catch (err) {
    console.warn("Error reproduciendo música", name, err);
  }
}

export async function stopMusic() {
  // Invalidamos cualquier playMusic pendiente
  musicRequestId += 1;

  const sound = currentMusicSound;
  if (!sound) {
    currentMusicSound = null;
    currentMusicName = null;
    return;
  }

  // dejamos el estado limpio aunque falle algo
  currentMusicSound = null;
  currentMusicName = null;

  try {
    await sound.stopAsync();
  } catch (err) {
    // errores típicos de "Seeking interrupted" los ignoramos
  }

  try {
    await sound.unloadAsync();
  } catch (err) {
    // también los ignoramos, así no ensuciamos el log
  }
}
