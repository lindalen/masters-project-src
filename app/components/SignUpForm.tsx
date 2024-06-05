import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextInput } from "react-native";
import ActionButton from "./ActionButton";
import { styles } from "../types";
import useEmailSignUp from "../hooks/useEmailSignUp";
import { z } from "zod";
import { createBox, createText } from "@shopify/restyle";
import { Theme, theme } from "../theme";
import FormField from "./FormField";

const signUpSchema = z
  .object({
    email: z.string().email({ message: "Invalid email format" }),
    password: z.string().min(6, { message: "Must be 6 or more characters" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"],
  });

const Box = createBox<Theme>();

export const SignUpForm = () => {
  const {
    register,
    setValue,
    handleSubmit,
    setError,
    formState: { errors },
    trigger,
  } = useForm({
    resolver: zodResolver(signUpSchema),
  });
  const { handleSubmit: submitEmailSignUp, errors: backendErrors } =
    useEmailSignUp();

  const onSubmit = async (data) => {
    await submitEmailSignUp(data);
    // Handle backend errors
    Object.keys(backendErrors).forEach((field) => {
      setError(field, { type: "manual", message: backendErrors[field] });
    });
  };

  useEffect(() => {
    register("email");
    register("password");
    register("confirmPassword");
  }, [register]);

  return (
    <Box flex={1} flexDirection={"column"}>
      <FormField errors={errors.email} label={"Email"}>
        <TextInput
          placeholder="Enter your email"
          placeholderTextColor={theme.colors.textDim}
          autoCapitalize="none"
          style={styles.textInput}
          textContentType="emailAddress"
          onChangeText={(text) => setValue("email", text)} // Removed shouldValidate
        />
      </FormField>
      <FormField errors={errors.password} label={"Password"}>
        <TextInput
          secureTextEntry={true}
          placeholder="Enter your password"
          placeholderTextColor={theme.colors.textDim}
          style={styles.textInput}
          textContentType="newPassword"
          onChangeText={(text) => setValue("password", text)} // Removed shouldValidate
        />
      </FormField>
      <FormField errors={errors.confirmPassword} label="Confirm Password">
        <TextInput
          secureTextEntry={true}
          placeholder="Confirm your password"
          placeholderTextColor={theme.colors.textDim}
          style={styles.textInput}
          textContentType="newPassword"
          onChangeText={(text) => setValue("confirmPassword", text)} // Removed shouldValidate
        />
      </FormField>

      <Box marginTop="l">
        <ActionButton title="Sign Up" onPress={handleSubmit(onSubmit)} />
      </Box>
    </Box>
  );
};
