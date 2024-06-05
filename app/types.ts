import { theme } from "./theme";
import { StyleSheet } from "react-native";

export enum Role {
  User = "user",
  AI = "assistant",
  System = "system",
}

export enum Model {
  GPT35Turbo = "gpt-3.5-turbo",
  GPT4 = "gpt-4",
  GPT4Turbo = "gpt-4-turbo",
  GPT4o = "gpt-4o",
  MistralLargeLatest = "mistral-large-latest",
  MistralMediumLatest = "mistral-medium-latest",
  MistralSmallLatest = "mistral-small-latest",
  Mixtral8x22B = "open-mixtral-8x22b",
  Mixtral8x7B = "open-mixtral-8x7b",
  Mistral7B = "open-mistral-7b",
}

export enum AppScreen {
  Chat = "chat",
  Settings = "settings",
  Profile = "profile",
  Login = "login",
  SignUp = "signup",
}

export interface ChatMessage {
  role: Role;
  content: string;
}

export function isChatMessage(obj: any): obj is ChatMessage {
  return (
    obj !== null &&
    typeof obj === "object" &&
    typeof obj.role === "string" &&
    typeof obj.content === "string"
  );
}

export interface ChatResponse {
  message: string;
}

export class NetworkError extends Error {}
export class RequestError extends Error {}

export interface User {
  id: number;
  email: string;
  full_name?: string;
}

export interface PatientInformation {
  name?: string;
  age?: number;
  weight?: number;
  height?: number;
  gender?: string;
}

export interface Observation {
  id: string;
  content: string;
}

export function isPatientInformation(obj: any): obj is PatientInformation {
  return obj !== null && typeof obj === "object";
}

export function isObservation(obj: any): obj is Observation {
  return (
    obj !== null &&
    typeof obj.id === "string" &&
    typeof obj.content === "string"
  );
}

export function isUser(obj: any): obj is User {
  return (
    obj !== null &&
    typeof obj === "object" &&
    typeof obj.id === "number" &&
    typeof obj.email === "string"
  );
}

export function isErrorWithMessage(error: any): error is { message: string } {
  return typeof error?.message === "string";
}

export const styles = StyleSheet.create({
  textInput: {
    height: 40,
    width: 300,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 4,
    paddingHorizontal: 8,
    color: theme.colors.textPrimary,
  },
});
