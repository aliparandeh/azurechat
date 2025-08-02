import { showError } from "@/features/globals/global-message-store";
import {
  AudioConfig,
  AutoDetectSourceLanguageConfig,
  SpeechConfig,
  SpeechRecognizer,
} from "microsoft-cognitiveservices-speech-sdk";
import { proxy, useSnapshot } from "valtio";
import { chatStore } from "../../chat-store";
import { GetSpeechToken } from "./speech-service";

let speechRecognizer: SpeechRecognizer | undefined = undefined;

class SpeechToText {
  public isMicrophoneUsed: boolean = false;
  public isMicrophoneReady: boolean = false;

  public async startRecognition() {
    const token = await GetSpeechToken();

    if (token.error) {
      showError(token.errorMessage);
      return;
    }

    this.isMicrophoneReady = true;
    this.isMicrophoneUsed = true;
    
    // If there's already a recognizer, stop it first to avoid multiple instances
    if (speechRecognizer) {
      speechRecognizer.stopContinuousRecognitionAsync();
    }

    const speechConfig = SpeechConfig.fromAuthorizationToken(
      token.token,
      token.region
    );

    const audioConfig = AudioConfig.fromDefaultMicrophoneInput();

    const autoDetectSourceLanguageConfig =
      AutoDetectSourceLanguageConfig.fromLanguages([
        "en-US",
        "zh-CN",
        "it-IT",
        "pt-BR",
      ]);

    const recognizer = SpeechRecognizer.FromConfig(
      speechConfig,
      autoDetectSourceLanguageConfig,
      audioConfig
    );

    speechRecognizer = recognizer;

    let interimText = '';
    let baseInput = chatStore.input;

    recognizer.recognizing = (s, e) => {
      interimText = e.result.text;
      chatStore.updateInput(baseInput + interimText);
    };

    recognizer.recognized = (s, e) => {
      if (e.result.text) {
        let finalText = e.result.text;
        
        if (baseInput && !baseInput.endsWith(' ') && !finalText.startsWith(' ')) {
          finalText = ' ' + finalText;
        }
        
        baseInput += finalText;
        
        chatStore.updateInput(baseInput);
      }
      interimText = '';
    };

    recognizer.canceled = (s, e) => {
      showError(e.errorDetails);
    };

    recognizer.startContinuousRecognitionAsync();
  }

  public stopRecognition() {
    if (speechRecognizer) {
      speechRecognizer.stopContinuousRecognitionAsync();
      this.isMicrophoneReady = false;
    }
  }

  public userDidUseMicrophone() {
    return this.isMicrophoneUsed;
  }

  public resetMicrophoneUsed() {
    this.isMicrophoneUsed = false;
  }
}
export const speechToTextStore = proxy(new SpeechToText());

export const useSpeechToText = () => {
  return useSnapshot(speechToTextStore);
};
