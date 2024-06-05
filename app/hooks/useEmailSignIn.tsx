import { useState } from "react";
import Toast from "react-native-toast-message"; // Import Toast here
import { useAppStore } from "../state";
import { isUser } from "../types";
import { proxyUrl } from "../utils";

export const useEmailSignIn = () => {
  const signIn = useAppStore((state) => state.signIn);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (formData) => {
    try {
      const response = await fetch(`${proxyUrl}/auth/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors(data.errors || data.detail.errors || {});
        // Show error toast
        Toast.show({
          type: "error",
          text1: "Login Error",
          text2: "Please check your credentials and try again.",
        });
      } else {
        if (isUser(data)) {
          Toast.show({
            type: "success",
            text1: "Login Successful",
          });
          signIn(data);
        } else {
          setErrors({ general: "A server-side error occurred." });
          // Optionally show a toast for server-side errors
          Toast.show({
            type: "error",
            text1: "Server-side error.",
          });
        }
      }
    } catch (error) {
      console.error("Sign-in error:", error);
      setErrors({ general: "An error occurred during sign-in." });
      // Show error toast for catch block
      Toast.show({
        type: "error",
        text1: "Unexpected Error",
        text2: error.message,
      });
    }
  };

  return { handleSubmit, errors };
};

export default useEmailSignIn;
