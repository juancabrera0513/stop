// src/navigation/RootNavigator.js
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";

import CreateRoomScreen from "../screens/CreateRoomScreen";
import FinalResultsScreen from "../screens/FinalResultsScreen";
import GameScreen from "../screens/GameScreen";
import HomeScreen from "../screens/HomeScreen";
import LobbyScreen from "../screens/LobbyScreen";
import RoundIntroScreen from "../screens/RoundIntroScreen";
import RoundResultsScreen from "../screens/RoundResultsScreen";
import SinglePlayerSetupScreen from "../screens/SinglePlayerSetupScreen";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerTransparent: true,
        headerTitleAlign: "center",
        headerShadowVisible: false,

        // 👇👇 FIX DEL BUG (única línea necesaria)
        headerBackVisible: true, // ← obliga a mostrar el botón “← Home” siempre

        headerBackTitleVisible: false,
        headerTintColor: "#ffffff",
        contentStyle: {
          backgroundColor: "transparent",
        },
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="SinglePlayerSetup"
        component={SinglePlayerSetupScreen}
        options={{ title: "Configuración" }}
      />

      <Stack.Screen
        name="RoundIntro"
        component={RoundIntroScreen}
        options={{ title: "Nueva ronda" }}
      />

      <Stack.Screen
        name="Game"
        component={GameScreen}
        options={{ title: "Ronda en juego" }}
      />

      <Stack.Screen
        name="RoundResults"
        component={RoundResultsScreen}
        options={{ title: "Resultados" }}
      />

      <Stack.Screen
        name="FinalResults"
        component={FinalResultsScreen}
        options={{ title: "Resultado final" }}
      />

      <Stack.Screen
        name="Lobby"
        component={LobbyScreen}
        options={{ title: "Sala local" }}
      />

      <Stack.Screen
        name="CreateRoom"
        component={CreateRoomScreen}
        options={{ title: "Crear sala" }}
      />
    </Stack.Navigator>
  );
}
