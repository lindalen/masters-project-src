import { createBox, createText } from "@shopify/restyle";
import React from "react";
import * as AppleAuthentication from "expo-apple-authentication";
import { Theme } from "../theme";
import AppIcon from "../components/AppIcon";
import { useAppleSignIn } from "../hooks/useAppleSignIn";
import { SignInForm } from "../components/SignInForm";
import ActionButton from "../components/ActionButton";
import { useAppStore } from "../state";
import { AppScreen } from "../types";
import Toast from "react-native-toast-message";
import { Platform } from "react-native";

const Box = createBox<Theme>();
const Text = createText<Theme>();

const LoginScreen = () => {
  const setScreen = useAppStore((state) => state.setScreen);
  const handleAppleSignIn = useAppleSignIn();

  return (
    <Box
      flex={1}
      flexDirection={"column"}
      justifyContent="center"
      backgroundColor="background"
      alignItems={"center"}
    >
      <Toast />
      <Box justifyContent={"center"} alignItems={"center"} paddingBottom={"l"}>
        <AppIcon fontSize={25} iconSize={48} gapSize={6} />
      </Box>
      <Box paddingBottom="l">
        <SignInForm />
      </Box>
      <Box paddingBottom="m">
        <ActionButton
          title="Sign Up"
          onPress={() => setScreen(AppScreen.SignUp)}
        />
      </Box>
      <Box
        paddingTop="m"
        borderBottomWidth={2}
        style={{ borderTopColor: "gray" }}
      >
        {Platform.OS === "ios" && (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={
              AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN
            }
            buttonStyle={
              AppleAuthentication.AppleAuthenticationButtonStyle.BLACK
            }
            style={{ width: 200, height: 48 }}
            cornerRadius={5}
            onPress={handleAppleSignIn}
          />
        )}
      </Box>
    </Box>
  );
};

export default LoginScreen;
