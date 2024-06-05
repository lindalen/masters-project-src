import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Model,
  ChatMessage,
  User,
  AppScreen,
  PatientInformation,
  Observation,
} from "./types";

interface AppState {
  screen: AppScreen;
  setScreen: (screen: AppScreen) => void;
  memory: boolean;
  setMemory: (b: boolean) => void;
  user?: User;
  fetchingUserInfo: boolean;
  setFetchingUserInfo: (b: boolean) => void;
  patientInformation?: PatientInformation;
  setPatientInformation: (p: PatientInformation) => void;
  observations?: Observation[];
  setObservations: (obs: Observation[]) => void;
  signIn: (user: User) => void;
  signOut: () => void;
  darkMode: boolean;
  setDarkMode: (b: boolean) => void;
  model: Model;
  setModel: (model: Model) => void;
  messages: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
  input: string;
  setInput: (s: string) => void;
  onNewChat: () => void;
}

const initialState = {
  screen: AppScreen.Login,
  darkMode: true,
  model: Model.GPT4Turbo,
  messages: [],
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      ...initialState,
      memory: true,
      setMemory: (b) => set({ memory: b }),
      fetchingUserInfo: true,
      setScreen: (screen) => set({ screen: screen }),
      signIn: (user) => set({ user: user }),
      signOut: () => set({ user: undefined, ...initialState }),
      setDarkMode: (mode) => set({ darkMode: mode }),
      setFetchingUserInfo: (b) => set({ fetchingUserInfo: b }),
      setPatientInformation: (p) => set({ patientInformation: p }),
      setObservations: (o) => set({ observations: o }),
      setModel: (model) => set({ model: model, messages: [] }),
      addMessage: (message) =>
        set((state) => ({ messages: [...state.messages, message] })),
      input: "",
      setInput: (s) => set({ input: s }),
      onNewChat: () => set({ messages: [], input: "" }),
    }),
    {
      name: "app-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
