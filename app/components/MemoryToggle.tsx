import React from "react";
import { Switch } from "react-native"; // Using Switch from React Native for the toggle
import { createBox, createText } from "@shopify/restyle";
import { Theme } from "../theme";
import { useAppStore } from "../state";

const Box = createBox<Theme>();
const Text = createText<Theme>();

const MemoryToggle = () => {
  // Access memory enabled state and the function to set it
  const memory = useAppStore((state) => state.memory);
  const setMemory = useAppStore((state) => state.setMemory);

  // Function to toggle memory on or off
  const toggleMemory = () => {
    setMemory(!memory);
  };

  return (
    <Box flexDirection="row" alignItems="center" padding="m">
      <Text color="textPrimary" paddingRight="m" fontSize={16}>
        Memory:
      </Text>
      <Switch
        value={memory}
        onValueChange={toggleMemory}
        trackColor={{ false: "#767577", true: "#81b0ff" }} // Optional: Custom colors
        thumbColor={memory ? "#f5dd4b" : "#f4f3f4"} // Optional: Custom thumb colors
      />
    </Box>
  );
};

export default MemoryToggle;
