import React, { useState } from "react";
import Header from "../components/Header";
import MessageList from "../components/MessageList";
import ChatInput from "../components/ChatInput";
import { createBox, createText } from "@shopify/restyle";
import { Theme } from "../theme";
import { KeyboardAvoidingView, Platform } from "react-native";
import { useSendMessage } from "../hooks/useSendMessage";
import { useAppStore } from "../state";
import AppIcon from "../components/AppIcon";
import Toast from "react-native-toast-message";
import NewChatButton from "../components/NewChatButton";

const Box = createBox<Theme>();
const Text = createText<Theme>();

interface ChatScreenProps {}

const ChatScreen: React.FC<ChatScreenProps> = ({}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const sendMessage = useSendMessage();
  const messages = useAppStore((state) => state.messages);

  const onChatSubmit = async (input: string) => {
    if (!input.trim()) return;
    setIsSubmitting(true);

    try {
      await sendMessage(input);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <Box flex={1} backgroundColor="background">
        <Header>
          <AppIcon />
          <Box flexDirection="row" gap="l">
            <NewChatButton/>
          </Box>
        </Header>
        <Toast />
          <MessageList messages={messages} />
          <ChatInput onSubmit={onChatSubmit} isSubmitting={isSubmitting} />
      </Box>
    </KeyboardAvoidingView>
  );
};

export default ChatScreen;
