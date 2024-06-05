import { createBox } from "@shopify/restyle";
import React from "react";
import { Theme, theme } from "../theme";
import { AppScreen } from "../types";
import { useAppStore } from "../state";
import { SignUpForm } from "../components/SignUpForm";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Header from "../components/Header";

const Box = createBox<Theme>();

const SignUpScreen = () => {
  const setScreen = useAppStore((state) => state.setScreen);

  return (
    <Box flex={1} backgroundColor="background">
      <Header>
        <FontAwesome.Button
          name="arrow-left"
          onPress={() => setScreen(AppScreen.Login)}
          backgroundColor={theme.colors.primary}
        >
          Back
        </FontAwesome.Button>
      </Header>
      <Box
        flex={1}
        justifyContent={"center"}
        backgroundColor="background"
        alignItems={"center"}
        paddingVertical="l"
      >
        <SignUpForm />
      </Box>
    </Box>
  );
};

export default SignUpScreen;
