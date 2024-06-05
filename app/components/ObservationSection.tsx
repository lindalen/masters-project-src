import React from "react";
import { ScrollView } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { useAppStore } from "../state";
import { createBox, createText } from "@shopify/restyle";
import { Theme } from "../theme";
import { Observation } from "../types";
import { deleteObservation } from "../utils";
import useFetchUserInfo from "../hooks/useFetchUserInfo";

const Box = createBox<Theme>();
const Text = createText<Theme>();

const ObservationSection = () => {
  const observations = useAppStore(
    (state) => state.observations
  ) as Observation[];

  const user_id = useAppStore((state) => state.user?.id) as number;
  const fetchUserInfo = useFetchUserInfo();
  const handleDelete = async (id: string) => {
    // Placeholder for delete logic
    await deleteObservation(user_id, id);
    await fetchUserInfo();
  };

  return (
    <Box flex={1} padding="m" backgroundColor="background" width="100%">
      <Text
        fontSize={20}
        fontWeight={"bold"}
        color="textPrimary"
        paddingBottom={"s"}
      >
        Observations
      </Text>
      {observations.length === 0 ? (
        <Text color="textPrimary">No observations available.</Text>
      ) : (
        <ScrollView horizontal={false}>
          {observations.map((observation) => (
            <Box
              key={observation.id}
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
              paddingVertical="s"
              backgroundColor="surface"
              borderRadius={5}
              padding={"s"}
              marginVertical={"s"}
              marginRight={"s"}
            >
              <Text color="textPrimary" marginRight={"s"}>
                {observation.content}
              </Text>
              <AntDesign
                name="delete"
                size={24}
                color="red"
                onPress={() => handleDelete(observation.id)}
              />
            </Box>
          ))}
        </ScrollView>
      )}
    </Box>
  );
};

export default ObservationSection;
