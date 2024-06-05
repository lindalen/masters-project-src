import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextInput } from "react-native";
import ActionButton from "./ActionButton";
import { styles } from "../types";
import useEmailSignIn from "../hooks/useEmailSignIn";
import { z } from "zod";
import { createBox } from "@shopify/restyle";
import { Theme, theme } from "../theme";
import FormField from "./FormField";

const signInSchema = z.object({
  email: z.string().email({ message: "Invalid email format" }),
  password: z.string().min(6, { message: "Must be 6 or more characters" }),
});

const Box = createBox<Theme>();

export const SignInForm = () => {
  const {
    register,
    setValue,
    handleSubmit,
    setError,
    formState: { errors },
    trigger,
  } = useForm({
    resolver: zodResolver(signInSchema),
  });
  const { handleSubmit: submitEmailSignIn, errors: backendErrors } =
    useEmailSignIn();

  const onSubmit = async (data) => {
    await submitEmailSignIn(data);

    // Handle backend errors
    Object.keys(backendErrors).forEach((field) => {
      setError(field, { type: "manual", message: backendErrors[field] });
    });
  };

  useEffect(() => {
    register("email");
    register("password");
  }, [register]);

  return (
    <Box padding="m" style={{ width: 300 }} alignItems={"center"}>
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
          textContentType="password" // For password fields, enabling autofill
          onChangeText={(text) => setValue("password", text)}
          onBlur={() => trigger("password")}
        />
      </FormField>

      <Box marginTop="l">
        <ActionButton title="Sign In" onPress={handleSubmit(onSubmit)} />
      </Box>
    </Box>
  );
};
