import { createBox, createText } from "@shopify/restyle";
import React, { useEffect } from "react";
import { Theme, theme } from "../theme";
import { TouchableOpacity } from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { useAppStore } from "../state";
import { SheetManager } from "react-native-actions-sheet";

const Text = createText<Theme>();
const Box = createBox<Theme>();

const NewChatButton = () => {
  const onNew = () => {
    SheetManager.show('convo-sheet');
  };

  return (
    <FontAwesome.Button name="plus" onPress={onNew} color="white" backgroundColor={theme.colors.primary}>
      New
    </FontAwesome.Button>
  );
};

export default NewChatButton;
