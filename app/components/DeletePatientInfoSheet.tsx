import React from "react";
import { createBox, createText } from "@shopify/restyle";
import ActionSheet, { SheetManager } from "react-native-actions-sheet";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { useAppStore } from "../state";
import { deletePatientInformation } from "../utils"; // Assuming you have a similar utility function
import { Theme, theme } from "../theme";
import useFetchUserInfo from "../hooks/useFetchUserInfo";

const Text = createText<Theme>();
const Box = createBox<Theme>();

const DeletePatientInfoSheet = () => {
  const user_id = useAppStore((state) => state.user?.id);
  const fetchUserInfo = useFetchUserInfo();

  const onDeleteConfirm = async () => {
    if (user_id) {
      await deletePatientInformation(user_id);
      await fetchUserInfo();
    }
    closeSheet();
  };

  const closeSheet = () => {
    SheetManager.hide("delete-patient-info-sheet");
  };

  return (
    <ActionSheet id="delete-patient-info-sheet">
      <Box padding="l" backgroundColor="background">
        <Text variant="body" marginBottom="m">
          Do you want to delete all patient information?
        </Text>
        <Box flexDirection="row" justifyContent="space-between">
          <FontAwesome.Button
            name="times"
            onPress={closeSheet}
            color={theme.colors.textPrimary}
            backgroundColor={theme.colors.secondary}
            borderRadius={theme.spacing.s}
          >
            Cancel
          </FontAwesome.Button>
          <FontAwesome.Button
            name="check"
            onPress={onDeleteConfirm}
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

export default DeletePatientInfoSheet;
