import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";

const ActionButton = ({ onPress, title }) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 200,
    height: 48,
    backgroundColor: "#333333", // A dark grey that looks great in dark mode
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5,
    elevation: 3, // Adds subtle shadow for Android
    shadowColor: "#000000", // Shadow color for iOS
    shadowOffset: { width: 0, height: 2 }, // Shadow position for iOS
    shadowOpacity: 0.25, // Shadow opacity for iOS
    shadowRadius: 3.84, // Shadow blur radius for iOS
  },
  text: {
    color: "#FFFFFF", // Ensures high contrast for readability
    fontSize: 16,
    fontWeight: "bold", // Makes the text bold for better legibility
  },
});

export default ActionButton;
