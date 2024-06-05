import React, { useState } from "react";
import { Theme } from "../theme";
import { createBox, createText, useTheme } from "@shopify/restyle";
import {
  ActivityIndicator,
  GestureResponderEvent,
  TextInput,
  TouchableOpacity,
} from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import RecordVoiceButton from "./RecordVoiceButton";

const Box = createBox<Theme>();

interface ChatInputProps {
  onSubmit: (input: string) => void;
  isSubmitting: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSubmit, isSubmitting }) => {
  const [input, setInput] = useState("");
  const theme = useTheme();

  const onSubmitEditing = (event: any) => {
    if (input.trim().length > 0 && !isSubmitting) {
      onSubmit(input.trim());
      setInput('');
    }
  };

  const onUserInput = (text: string) => {
    setInput(text);
  };

  return (
    <Box
      flexDirection="row"
      alignItems="center"
      paddingHorizontal="m"
      paddingVertical="m"
      gap="s"
      width="100%"
      backgroundColor="surface"
    >
      <TextInput
        style={{
          flex: 1,
          borderRadius: theme.spacing.s,
          paddingHorizontal: theme.spacing.s,
          backgroundColor: theme.colors.background,
          color: theme.colors.textPrimary,
          fontSize: 16,
          lineHeight: 24,
          paddingVertical: 4,
          maxHeight: 96,
        }}
        placeholderTextColor={theme.colors.textDim}
        onChangeText={onUserInput}
        value={input}
        multiline
        placeholder="Send a message..."
        onSubmitEditing={onSubmitEditing}
        editable={!isSubmitting}
      />
      {isSubmitting ? (
        <ActivityIndicator size={20} color="white" />
      ) : (
        <TouchableOpacity onPress={onSubmitEditing}>
          <Box
            padding="s"
            justifyContent="center"
            alignItems="center"
            backgroundColor="primary"
            style={{
              borderRadius: theme.spacing.m,
              height: 30,
            }}
          >
            <FontAwesome
              name="arrow-up"
              size={15}
              color={theme.colors.textPrimary}
            />
          </Box>
        </TouchableOpacity>
      )}
      <RecordVoiceButton onUserInput={onUserInput} />
    </Box>
  );
};

export default ChatInput;
