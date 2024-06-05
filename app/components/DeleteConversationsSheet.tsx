import { createBox, createText } from "@shopify/restyle";
import React from "react";
import { Theme, theme } from "../theme";
import ActionSheet, { SheetManager } from "react-native-actions-sheet";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { useAppStore } from "../state";
import { deleteConversations } from "../utils";

const Text = createText<Theme>();
const Box = createBox<Theme>();

const DeleteConversationsSheet = () => {
  const user_id = useAppStore((state) => state.user?.id);

  const onSaveConfirm = () => {
    if (user_id) {
      deleteConversations(user_id);
    }
    clearChat();
  };

  const clearChat = () => {
    SheetManager.hide("delete-convo-sheet");
  };

  return (
    <ActionSheet>
      <Box padding="l" backgroundColor="background">
        <Text variant="body" marginBottom="m">
          Do you want to delete all your conversations?
        </Text>
        <Box flexDirection="row" justifyContent="space-between">
          <FontAwesome.Button
            name="times"
            onPress={clearChat}
            color={theme.colors.textPrimary}
            backgroundColor={theme.colors.secondary}
            borderRadius={theme.spacing.s}
          >
            Cancel
          </FontAwesome.Button>
          <FontAwesome.Button
            name="check"
            onPress={onSaveConfirm}
            color={theme.colors.textPrimary}
            backgroundColor={theme.colors.primary}
            borderRadius={theme.spacing.s}
          >
            Confirm
          </FontAwesome.Button>
        </Box>
      </Box>
    </ActionSheet>
  );
};

export default DeleteConversationsSheet;
