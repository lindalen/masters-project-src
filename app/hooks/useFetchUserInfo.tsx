import { proxyUrl } from "../utils";
import { useAppStore } from "../state";
import { isObservation, isPatientInformation, Observation } from "../types";

export const useFetchUserInfo = () => {
  const user_id = useAppStore((state) => state.user?.id);
  const setIsFetching = useAppStore((state) => state.setFetchingUserInfo);
  const setPatientInfo = useAppStore((state) => state.setPatientInformation);
  const setObservations = useAppStore((state) => state.setObservations);

  // Assuming `proxyUrl` starts with 'https://'
  const fetchUserInfo = async () => {
    if (!user_id) return;
    setIsFetching(true);

    try {
      const response = await fetch(`${proxyUrl}/api/user-info/${user_id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (response.ok) {
        var observations = data.observations;
        console.log(observations);
        if (Array.isArray(observations)) {
          var validated_observations: Observation[] = [];
          observations.forEach((observation) => {
            if (isObservation(observation)) {
              validated_observations.push(observation);
            }
          });
          setObservations(validated_observations);
        }

        var patient_info = data.patient_info;
        if (isPatientInformation(patient_info)) {
          setPatientInfo(patient_info);
        }

        setIsFetching(false);
      }
    } catch (error) {
      console.error("An error occurred fetching user info process.");
      setIsFetching(false);
    }
  };

  return fetchUserInfo;
};

export default useFetchUserInfo;
