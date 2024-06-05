import React, { useEffect } from "react";
import Header from "../components/Header";
import { createBox } from "@shopify/restyle";
import { Theme } from "../theme";
import ModelSelector from "../components/ModelSelector";
import AppIcon from "../components/AppIcon";
import { ActivityIndicator, Button } from "react-native";
import SignOutButton from "../components/SignOutButton";
import DeleteConversationsButton from "../components/DeleteConversationsButton";
import { useAppStore } from "../state";
import useFetchUserInfo from "../hooks/useFetchUserInfo";
import PatientInfoSection from "../components/PatientInfoSection";
import ObservationSection from "../components/ObservationSection";

const Box = createBox<Theme>();

interface ProfileScreenProps {}

const ProfileScreen: React.FC<ProfileScreenProps> = ({}) => {
  const fetchUserInfo = useFetchUserInfo();
  const isFetchingUserInfo = useAppStore((state) => state.fetchingUserInfo);
  useEffect(() => {
    fetchUserInfo();
  }, []);
  return (
    <Box flex={1} backgroundColor="background">
      <Header>
        <AppIcon />
      </Header>
      <Box flex={1} flexDirection="column" alignItems="center" rowGap={"l"}>
        {isFetchingUserInfo ? (
          <ActivityIndicator size={40} color="white" />
        ) : (
          <>
            <PatientInfoSection />
            <ObservationSection />
          </>
        )}
      </Box>
    </Box>
  );
};

export default ProfileScreen;
