import * as React from "react";
import { ChatInput } from "@fluentui-copilot/react-chat-input";
import type { ChatInputProps } from "@fluentui-copilot/react-chat-input";
import { Button, ButtonProps } from "@fluentui/react-components";
import { Mic20Regular } from "@fluentui/react-icons";
import type { ImperativeControlPluginRef } from "@fluentui-copilot/react-chat-input-plugins";
import {
  GhostTextNode,
  ImperativeControlPlugin,
} from "@fluentui-copilot/react-chat-input-plugins";
declare const RecordRTC: any;

interface ChatMessage {
  content: string;
  isUser: boolean;
  timestamp: string;
  isAudio?: boolean;
  isCompleted: boolean;
}
// Export the ref interface
export interface ChatInputRef {
  clear: () => void;
  focus: () => void;
  currentMessages:ChatMessage[]
}

// The component keeps all original ChatInputProps
export const CerebralChatInput = React.forwardRef<ChatInputRef, ChatInputProps>( (props, ref) => {
    const [inputValue, setInputValue] = React.useState("");
    const [messages, setMessages] = React.useState<ChatMessage[]>([]);
    const controlRef = React.useRef<ImperativeControlPluginRef>(null);
    const handleSubmit: ChatInputProps['onSubmit'] = (e, data) => {
      debugger;
      if (data.value.trim()) {
        props.onSubmit?.(e, { value: data.value });
        setInputValue("");
        controlRef.current?.setInputText("");
      }
    };
    const recorderRef = React.useRef<any>(null);
    const [isRecording, setIsRecording] = React.useState(false);
    const handleOnClick = async () => {
      console.log("props");
      console.log(props);
      console.log("ref");
      console.log(ref);      
      if(!isRecording) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true }); 
        recorderRef.current = new RecordRTC(stream, {
          type: 'audio',
          mimeType: 'audio/wav',
          recorderType: RecordRTC.StereoAudioRecorder,
          numberOfAudioChannels: 1,
          desiredSampRate: 16000,
          timeSlice: 1000,
        });  
        recorderRef.current.startRecording();
        setIsRecording(true);
      }
      else {
        if (recorderRef.current && isRecording) {
          recorderRef.current.stopRecording(async () => {
            const blob = await recorderRef.current.getBlob();
            const audioUrl = URL.createObjectURL(blob);
    
            // Add audio message to chat
            const audioMessage: ChatMessage = {
              content: audioUrl,
              isUser: true,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isAudio: true,
              isCompleted: true,
            };
            console.log("prev");
            console.log(messages);
            setMessages(prev => [...prev, audioMessage]);
    
            // // Process the audio with STT
            // await processAudioWithSTT(blob);
    
            // Cleanup
            const stream = recorderRef.current.stream;
            stream?.getTracks().forEach((track: MediaStreamTrack) => track.stop());
            recorderRef.current = null;
            setIsRecording(false);
          });
        }
      }
    }

    return (
      <ChatInput
        {...props}
        onChange={(e, data) => setInputValue(data.value)}
        onSubmit={handleSubmit}
        actions={
          <span style={{ display: "flex", alignItems: "center" }}>
            <Button

              aria-label="voice-input"
              appearance="transparent"
              icon={<Mic20Regular />}
              onClick={() => handleOnClick()}
            />
          </span>
        }
        aria-label="Cerebral Chat"
        placeholderValue="Ask questions and interact with Cerebral"
        count={{ "data-testid": "count" } as any}
      >
        <ImperativeControlPlugin ref={controlRef} />
        </ChatInput>
    );
  }
);

// Add display name for React DevTools
CerebralChatInput.displayName = "CerebralChatInput";