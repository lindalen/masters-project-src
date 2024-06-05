import { useState } from "react";
import { useForm } from "react-hook-form";
import { proxyUrl } from "../utils";
import { useAppStore } from "../state";
import { isUser } from "../types";

export const useEmailSignUp = () => {
  const signIn = useAppStore((state) => state.signIn);
  const [errors, setErrors] = useState({});

  // Assuming `proxyUrl` starts with 'https://'
  const handleSubmit = async (formData) => {
    try {
      const response = await fetch(`${proxyUrl}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors(data.errors || data.detail.errors || {});
      } else {
        if (data && isUser(data)) {
          signIn(data);
        } else {
          // Ensure errors are user-friendly
          setErrors({ general: "Unexpected issue, please try again later." });
        }
      }
    } catch (error) {
      console.error("An error occurred during the sign-up process.");
      setErrors({ general: "Network error, please try again later." });
    }
  };

  return { handleSubmit, errors };
};

export default useEmailSignUp;
