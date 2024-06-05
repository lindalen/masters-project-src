import React, { useState } from "react";
import { createBox, createText, ThemeProvider } from "@shopify/restyle";
import ChatScreen from "./screens/ChatScreen";
import { darkTheme, theme, Theme } from "./theme";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { Dimensions } from "react-native";
import SettingScreen from "./screens/SettingScreen";
import { useAppStore } from "./state";
import LoginScreen from "./screens/LoginScreen";
import { AppScreen } from "./types";
import SignUpScreen from "./screens/SignUpScreen";
import { SheetProvider } from "react-native-actions-sheet";
import "./sheets.tsx";
import ProfileScreen from "./screens/ProfileScreen.tsx";

const screenHeight = Dimensions.get("window").height;
const Box = createBox<Theme>();
const Text = createText<Theme>();

export default function App() {
  const screen = useAppStore((state) => state.screen);
  const setScreen = useAppStore((state) => state.setScreen);
  const user = useAppStore((state) => state.user);
  const darkMode = useAppStore((state) => state.darkMode);
  const currentTheme = darkMode ? darkTheme : theme;

  const renderScreen = () => {
    switch (screen) {
      case AppScreen.Settings:
        return <SettingScreen />;
      case AppScreen.Chat:
        return <ChatScreen />;
      case AppScreen.Profile:
        return <ProfileScreen />;
      default:
        return <ChatScreen />;
    }
  };

  return (
    <ThemeProvider theme={currentTheme}>
      <SheetProvider>
        {!user ? (
          screen === AppScreen.SignUp ? (
            <SignUpScreen />
          ) : (
            <LoginScreen />
          )
        ) : (
          <Box height={screenHeight} flex={1}>
            {renderScreen()}
            <Box
              height="7.5%"
              flexDirection="row"
              backgroundColor="primary"
              alignItems="center"
            >
              <Box
                flex={1}
                height="100%"
                justifyContent="center"
                alignItems="center"
                onTouchEnd={() => setScreen(AppScreen.Chat)}
              >
                <FontAwesome
                  name="comments"
                  size={25}
                  color={theme.colors.textPrimary}
                />
              </Box>
              <Box
                flex={1}
                height="100%"
                justifyContent="center"
                alignItems="center"
                onTouchEnd={() => setScreen(AppScreen.Profile)}
              >
                <FontAwesome
                  name="user"
                  size={25}
                  color={theme.colors.textPrimary}
                />
              </Box>
              <Box
                flex={1}
                height="100%"
                justifyContent="center"
                alignItems="center"
                onTouchEnd={() => setScreen(AppScreen.Settings)}
              >
                <FontAwesome
                  name="cog"
                  size={25}
                  color={theme.colors.textPrimary}
                />
              </Box>
            </Box>
          </Box>
        )}
      </SheetProvider>
    </ThemeProvider>
  );
}
