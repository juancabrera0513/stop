// src/navigation/RootNavigator.js
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeScreen from "../screens/HomeScreen";
import SinglePlayerSetupScreen from "../screens/SinglePlayerSetupScreen";
import RoundIntroScreen from "../screens/RoundIntroScreen";
import GameScreen from "../screens/GameScreen";
import RoundResultsScreen from "../screens/RoundResultsScreen";
import FinalResultsScreen from "../screens/FinalResultsScreen";
import LobbyScreen from "../screens/LobbyScreen";
import CreateRoomScreen from "../screens/CreateRoomScreen";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        // Header encima del contenido, sin barra sólida
        headerTransparent: true,
        headerTitleAlign: "center",
        headerShadowVisible: false,
        headerBackTitleVisible: false,
        headerTintColor: "#ffffff",
        // Muy importante: que la escena sea transparente,
        // así se ve el fondo de cada pantalla hasta arriba
        contentStyle: {
          backgroundColor: "transparent",
        },
      }}
    >
      {/* HOME: sin header */}
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerShown: false,
        }}
      />

      {/* Pantallas con header (botón back + título) */}
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
