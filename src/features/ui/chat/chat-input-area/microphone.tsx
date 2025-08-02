import { Mic, Square } from "lucide-react";
import {Button} from "@/ui/button";

export const Microphone = (props: {
  isPlaying: boolean;
  isMicrophoneReady: boolean;
  stopPlaying: () => void;
  startRecognition: () => void;
  stopRecognition: () => void;
}) => {
  const toggleRecognition = () => {
    if (props.isMicrophoneReady) {
      props.stopRecognition();
    } else {
      props.startRecognition();
    }
  };

  return (
      <>
        {props.isPlaying ? (
            <Button
                size="icon"
                type="button"
                variant={"ghost"}
                onClick={props.stopPlaying}
            >
              <Square size={16}/>
            </Button>
        ) : (
            <Button
                type="button"
                size="icon"
                variant={"ghost"}
                onClick={toggleRecognition}
                className={
                  props.isMicrophoneReady ? "bg-red-400 hover:bg-red-400" : ""
                }
                aria-label="Microphone for speech input"
            >
              <Mic size={16}/>
            </Button>
        )}
      </>
  );
};

