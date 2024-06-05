import { Audio } from "expo-av";

export const RECORDING_OPTIONS_PRESET_HIGH_QUALITY: any = {
  android: {
    extension: ".mp4",
    outputFormat: Audio.RecordingOptionsPresets.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
    audioEncoder: Audio.RecordingOptionsPresets.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AMR_NB,
    sampleRate: 44100,
    numberOfChannels: 2,
    bitRate: 128000,
  },
  ios: {
    extension: ".wav",
    audioQuality: Audio.RecordingOptionsPresets.RECORDING_OPTION_IOS_AUDIO_QUALITY_MIN,
    sampleRate: 16000, // remember you did this
    numberOfChannels: 2,
    bitRate: 128000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
};
