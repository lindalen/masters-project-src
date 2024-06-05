import { useAppStore } from "../state";
import * as AppleAuthentication from "expo-apple-authentication";
import { proxyUrl } from "../utils";
import { RequestError, isUser } from "../types";
import Toast from "react-native-toast-message";

export const useAppleSignIn = () => {
  const signIn = useAppStore((state) => state.signIn);

  const handleAppleSignIn = async () => {
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      const response = await fetch(`${proxyUrl}/auth/apple`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identityToken: credential.identityToken,
        }),
      });

      const userData = await response.json();

      if (isUser(userData)) {
        signIn(userData);
      } else {
        throw new RequestError("Server-side error.");
      }
    } catch (e) {
      if (e.code === "ERR_REQUEST_CANCELED") {
        console.log("User canceled the sign-in flow");
      } else {
        Toast.show({
          type: "error",
          text1: e.message,
        });
        console.error("Authentication error:", e);
      }
    }
  };

  return handleAppleSignIn;
};
