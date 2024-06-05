import { createBox, createText } from "@shopify/restyle";
import React from "react";
import { Theme } from "../theme";
import { Image } from "react-native";

const Text = createText<Theme>();
const Box = createBox<Theme>();

interface AppIconProps {
  iconSize?: number;
  fontSize?: number;
  gapSize?: number;
}
const AppIcon: React.FC<AppIconProps> = ({ iconSize, fontSize, gapSize }) => {
  const settings = {
    iconSize: iconSize || 36,
    fontSize: fontSize || 20,
    gapSize: gapSize || 4,
  };

  return (
    <Box flexDirection="row" alignItems="center">
      <Image
        source={require("../assets/cropped-app-icon-no-bg.png")}
        style={{
          width: settings.iconSize,
          height: settings.iconSize,
          marginRight: settings.gapSize,
        }}
      />
      <Text color="textPrimary" fontSize={settings.fontSize}>
        WellVerse
      </Text>
    </Box>
  );
};

export default AppIcon;
