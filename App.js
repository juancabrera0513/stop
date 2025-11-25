// App.js
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import RootNavigator from "./src/navigation/RootNavigator";
import { GameProvider } from "./src/context/GameContext";

export default function App() {
  return (
    <GameProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </GameProvider>
  );
}
