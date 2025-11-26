// src/audio/soundManager.js
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";

let initialized = false;

// Aquí defines tus sonidos (cámbialos por tus rutas reales)
const SFX_FILES = {
  click: require("../../assets/sounds/click.mp3"),
  stopHuman: require("../../assets/sounds/stop-human.mp3"),
  stopCpu: require("../../assets/sounds/stop-cpu.mp3"),
  roundStart: require("../../assets/sounds/round-start.mp3"),
  timeAlmost: require("../../assets/sounds/time-almost.mp3"),
  win: require("../../assets/sounds/win.mp3"),
  lose: require("../../assets/sounds/lose.mp3"),
};

const MUSIC_FILES = {
  menu: require("../../assets/sounds/music-menu.mp3"),
  round: require("../../assets/sounds/music-round.mp3"),
};

const loadedSfx = {};
let currentMusicSound = null;
let currentMusicKey = null;

async function ensureAudioMode() {
  if (initialized) return;
  initialized = true;

  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
    staysActiveInBackground: false,
    playsInSilentModeIOS: true,
    shouldDuckAndroid: true,
    playThroughEarpieceAndroid: false,
  });
}

// 🔊 SFX
export async function playSfx(name, { enabled = true, vibration = false } = {}) {
  try {
    if (!enabled) return;

    await ensureAudioMode();

    // Vibración si está activa
    if (vibration) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    const file = SFX_FILES[name];
    if (!file) return;

    // lazy-load
    if (!loadedSfx[name]) {
      const { sound } = await Audio.Sound.createAsync(file);
      loadedSfx[name] = sound;
    }

    const soundObj = loadedSfx[name];
    await soundObj.replayAsync();
  } catch (err) {
    console.warn("Error reproduciendo SFX", name, err);
  }
}

// 🎵 Música
export async function playMusic(name, { enabled = true, loop = true } = {}) {
  try {
    if (!enabled) return;

    await ensureAudioMode();

    const file = MUSIC_FILES[name];
    if (!file) return;

    // parar música actual
    if (currentMusicSound) {
      await currentMusicSound.stopAsync();
      await currentMusicSound.unloadAsync();
      currentMusicSound = null;
      currentMusicKey = null;
    }

    const { sound } = await Audio.Sound.createAsync(file, {
      isLooping: loop,
      volume: 0.7,
    });

    currentMusicSound = sound;
    currentMusicKey = name;

    await sound.playAsync();
  } catch (err) {
    console.warn("Error reproduciendo música", name, err);
  }
}

export async function stopMusic() {
  try {
    if (currentMusicSound) {
      await currentMusicSound.stopAsync();
      await currentMusicSound.unloadAsync();
      currentMusicSound = null;
      currentMusicKey = null;
    }
  } catch (err) {
    console.warn("Error parando música", err);
  }
}

// Por si quieres saber qué está sonando
export function getCurrentMusicKey() {
  return currentMusicKey;
}
