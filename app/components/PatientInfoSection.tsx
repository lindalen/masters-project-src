import React from "react";
import { useAppStore } from "../state";
import { createBox, createText } from "@shopify/restyle";
import { Theme, theme } from "../theme";
import { PatientInformation } from "../types";
import { AntDesign } from "@expo/vector-icons";
import { SheetManager } from "react-native-actions-sheet";

const Box = createBox<Theme>();
const Text = createText<Theme>();

const PatientInfoSection = () => {
  const patientInfo = useAppStore(
    (state) => state.patientInformation
  ) as PatientInformation;

  const formatInfo = (label: string, value: string | number | undefined) =>
    value !== undefined ? `${label}: ${value}` : "";

  const patientDetails = [
    formatInfo("📛 Name", patientInfo.name),
    formatInfo("🎂 Age", patientInfo.age),
    formatInfo("⚖️ Weight", patientInfo.weight),
    formatInfo("📏 Height", patientInfo.height),
    formatInfo("🚻 Gender", patientInfo.gender),
  ].filter((detail) => detail !== "");
  // add modal thing that appears to confirm, applies to all. step 2: add api calls.
  const handleClearPatientInfo = () => {
    SheetManager.show("delete-patient-info-sheet");
  };
  return (
    <Box padding="m" margin="m" backgroundColor="background" width="100%">
      <Text
        fontSize={20}
        fontWeight={"bold"}
        color="textPrimary"
        paddingBottom={"s"}
      >
        Patient Information
      </Text>

      {patientDetails.length === 0 ? (
        <Text color="textPrimary">No patient information available.</Text>
      ) : (
        <Box
          flexDirection={"row"}
          justifyContent={"space-between"}
          backgroundColor={"surface"}
          borderRadius={5}
          padding={"s"}
        >
          <Box>
            {patientDetails.map((detail, index) => (
              <Text color="textPrimary" key={index}>
                {detail}
              </Text>
            ))}
          </Box>
          <AntDesign
            name="delete"
            size={24}
            color="red"
            onPress={handleClearPatientInfo}
          />
        </Box>
      )}
    </Box>
  );
};

export default PatientInfoSection;
