import { createBox, createText } from "@shopify/restyle";
import React from "react";
import { Theme, theme } from "../theme";
import ActionSheet, { SheetManager } from "react-native-actions-sheet";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { useAppStore } from "../state";
import { useSaveConversation } from "../hooks/useSaveConversation";

const Text = createText<Theme>();
const Box = createBox<Theme>();

const SaveConversationSheet = () => {
  const onNewChat = useAppStore((state) => state.onNewChat);
  const saveConversation = useSaveConversation();

  const onSaveConfirm = () => {
    saveConversation();
    clearChat();
  };

  const clearChat = () => {
    SheetManager.hide("convo-sheet");
    onNewChat();
  };

  return (
    <ActionSheet>
      <Box padding="l" backgroundColor="background">
        <Text variant="body" marginBottom="m">
          Do you want to save the conversation? The chatbot will be able to
          query past conversations to guide you.
        </Text>
        <Box flexDirection="row" justifyContent="space-between">
          <FontAwesome.Button
            name="times"
            onPress={clearChat}
            color={theme.colors.textPrimary}
            backgroundColor={theme.colors.secondary}
            borderRadius={theme.spacing.s}
          >
            Discard
          </FontAwesome.Button>
          <FontAwesome.Button
            name="check"
            onPress={onSaveConfirm}
            color={theme.colors.textPrimary}
            backgroundColor={theme.colors.primary}
            borderRadius={theme.spacing.s}
          >
            Save
          </FontAwesome.Button>
        </Box>
      </Box>
    </ActionSheet>
  );
};

export default SaveConversationSheet;
