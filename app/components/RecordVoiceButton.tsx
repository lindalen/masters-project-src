import React, { useState } from "react";
import { ActivityIndicator, TouchableOpacity } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { proxyUrl } from "../utils";
import { RECORDING_OPTIONS_PRESET_HIGH_QUALITY } from "../constants";
import * as FileSystem from "expo-file-system";

type AudioClip = {
  sound: Audio.Sound;
  file: string | null;
};

type RecordVoiceButtonProps = {
  onUserInput: (text: string) => void;
};

interface ReactNativeFile {
  uri: string;
  type: string;
  name: string;
}

const RecordVoiceButton = ({ onUserInput }: RecordVoiceButtonProps) => {
  const [recording, setRecording] = useState<Audio.Recording>(
    new Audio.Recording()
  );
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRecordToggle = async () => {
    isRecording ? await stopRecording() : await startRecording();
  };

  async function startRecording() {
    try {
      const permission = await Audio.requestPermissionsAsync();

      if (permission.status !== "granted") return;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );

      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      console.error(" Failed to start recording", err);
    }
  }

  async function stopRecording() {
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    const { sound } = await recording.createNewLoadedSoundAsync();
    const newRecording = {
      sound: sound,
      file: recording.getURI(),
    };

    setIsRecording(false);
    transcribeRecording(newRecording);
  }

  async function transcribeRecording(newRecording: AudioClip) {
    const { file: uri } = newRecording;
    if (!uri) return;

    setIsLoading(true);

    let formData = new FormData();

    const file: ReactNativeFile = {
      uri: uri,
      type: "audio/wav",
      name: "audiofile.wav",
    };
    formData.append("file", file as any);

    try {
      const response = await fetch(`${proxyUrl}/api/transcribe`, {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });

      if (response.ok) {
        const parsedResponse = await response.json();
        onUserInput(parsedResponse.response);
      } else {
        console.error("Transcription failed with status:", response.status);
      }
    } catch (error) {
      console.error("Transcription Error:", error);
    }

    setIsLoading(false);
  }

  return (
    <TouchableOpacity onPress={handleRecordToggle}>
      {isLoading ? (
        <ActivityIndicator size={20} color="white" />
      ) : (
        <FontAwesome
          name="microphone"
          size={28}
          color={isRecording ? "blue" : "white"}
        />
      )}
    </TouchableOpacity>
  );
};

export default RecordVoiceButton;
