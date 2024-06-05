import React from "react";
import { createBox, createText } from "@shopify/restyle";
import { isErrorWithMessage } from "../types";
import { Theme } from "../theme";
import {
  FieldValues,
  FieldError,
  FieldErrorsImpl,
  Merge,
} from "react-hook-form";

const Text = createText<Theme>();
const Box = createBox<Theme>();

interface FormFieldProps {
  label: string;
  errors: FieldError | Merge<FieldError, FieldErrorsImpl<any>> | undefined;
  children?: React.ReactNode;
}

const FormField: React.FC<FormFieldProps> = ({ label, errors, children }) => {
  return (
    <Box marginBottom="m">
      <Text color="textPrimary">{label}</Text>
      {children}
      {isErrorWithMessage(errors) && (
        <Text style={{ color: "red" }}>{errors?.message}</Text>
      )}
    </Box>
  );
};

export default FormField;
