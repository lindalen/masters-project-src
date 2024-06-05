import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import AntDesign from "@expo/vector-icons/AntDesign";
import { createText, createBox } from "@shopify/restyle";
import { Theme, theme } from "../theme";
import { Model } from "../types";
import { useAppStore } from "../state";

const Text = createText<Theme>();
const Box = createBox<Theme>();

const data = [
  { label: "GPT-4 Omni", value: Model.GPT4o },
  { label: "GPT-4 Turbo", value: Model.GPT4Turbo },
  { label: "GPT-4", value: Model.GPT4 },
  { label: "GPT-3.5 Turbo", value: Model.GPT35Turbo },
  { label: "Mistral Large Latest", value: Model.MistralLargeLatest },
  { label: "Mistral Medium Latest", value: Model.MistralMediumLatest },
  { label: "Mistral Small Latest", value: Model.MistralSmallLatest },
  { label: "Mixtral 8x22B", value: Model.Mixtral8x22B },
  { label: "Mixtral 8x7B", value: Model.Mixtral8x7B },
  { label: "Mistral 7B", value: Model.Mistral7B },
];

const ModelSelector = () => {
  const model = useAppStore((state) => state.model);
  const setModel = useAppStore((state) => state.setModel);
  const [isFocus, setIsFocus] = useState(false);

  const renderLabel = () => {
    if (model || isFocus) {
      return (
        <Text
          style={[styles.label, isFocus && { color: theme.colors.primary }]}
        >
          Model
        </Text>
      );
    }
    return null;
  };

  return (
    <Box style={styles.container}>
      {renderLabel()}
      <Dropdown
        style={[
          styles.dropdown,
          isFocus && { borderColor: theme.colors.primary },
        ]}
        placeholderStyle={styles.placeholderStyle}
        selectedTextStyle={styles.selectedTextStyle}
        iconStyle={styles.iconStyle}
        itemContainerStyle={{ backgroundColor: theme.colors.surface }}
        itemTextStyle={{ color: theme.colors.textPrimary }}
        activeColor={theme.colors.surface}
        data={data}
        maxHeight={300}
        labelField="label"
        valueField="value"
        placeholder={!isFocus ? "Select item" : "..."}
        value={model}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        onChange={(item) => {
          setModel(item.value);
          setIsFocus(false);
        }}
        renderLeftIcon={() => (
          <AntDesign
            style={styles.icon}
            color={isFocus ? theme.colors.primary : theme.colors.textDim}
            name="Safety"
            size={20}
          />
        )}
      />
    </Box>
  );
};

export default ModelSelector;

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background, // Assuming dark mode background color
    padding: 16,
  },
  dropdown: {
    height: 50,
    width: 200,
    borderColor: theme.colors.primary, // Use primary color for border
    borderWidth: 1, // Adjusted for visibility
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: theme.colors.surface, // Assuming dark mode surface color
  },
  icon: {
    marginRight: 5,
  },
  label: {
    position: "absolute",
    backgroundColor: theme.colors.surface, // Match the container background
    left: 22,
    top: 8,
    zIndex: 999,
    paddingHorizontal: 8,
    fontSize: 14,
    color: theme.colors.textPrimary, // Assuming dark mode primary text color
  },
  placeholderStyle: {
    fontSize: 16,
    color: theme.colors.textDim, // Assuming dark mode secondary text color
  },
  selectedTextStyle: {
    fontSize: 16,
    color: theme.colors.textPrimary, // Assuming dark mode primary text color
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
    color: theme.colors.textPrimary, // Assuming dark mode primary text color
  },
});
