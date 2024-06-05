import React from "react";
import Header from "../components/Header";
import { createBox } from "@shopify/restyle";
import { Theme } from "../theme";
import ModelSelector from "../components/ModelSelector";
import AppIcon from "../components/AppIcon";
import { Button } from "react-native";
import SignOutButton from "../components/SignOutButton";
import MemoryToggle from "../components/MemoryToggle";

const Box = createBox<Theme>();

interface SettingScreenProps {}

const SettingScreen: React.FC<SettingScreenProps> = ({}) => {
  return (
    <Box flex={1} backgroundColor="background">
      <Header>
        <AppIcon />
      </Header>
      <Box
        flex={1}
        flexDirection="column"
        alignItems="center"
        paddingVertical="l"
        rowGap={"l"}
      >
        <ModelSelector />
        <MemoryToggle />
        <SignOutButton />
      </Box>
    </Box>
  );
};

export default SettingScreen;
