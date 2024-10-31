import * as React from "react";
import {
  Avatar,
  Button,
  ToolbarButton,
} from "@fluentui/react-components";
import type { CopilotChatProps } from "@fluentui-copilot/react-copilot-chat";
import {
  CopilotChat,
  CopilotMessageV2 as CopilotMessage,
  UserMessageV2 as UserMessage,
} from "@fluentui-copilot/react-copilot-chat";
import {
  BookmarkRegular,
  CopyRegular,
  EditRegular,
  ShareRegular,
  MicRegular,
  RecordStopRegular,
} from "@fluentui/react-icons";
import { useCopilotMode } from "@fluentui-copilot/react-provider";

// Declare RecordRTC types
declare const RecordRTC: any;

interface ChatMessage {
  content: string;
  isUser: boolean;
  timestamp: string;
  isAudio?: boolean;
}

const CerebralChatWithAudio = (props: CopilotChatProps) => {
  const copilotMode = useCopilotMode();
  const [inputMessage, setInputMessage] = React.useState("");
  const [isRecording, setIsRecording] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const recorderRef = React.useRef<any>(null);
  
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    {
      content: "Hi, I'm here to help! You can ask me questions using text or voice, and I'll do my best to provide helpful answers.",
      isUser: false,
      timestamp: "Now",
    },
  ]);

  React.useEffect(() => {
    // Load RecordRTC script
    const script = document.createElement('script');
    script.src = `${process.env.PUBLIC_URL}/RecordRTC.min.js`;
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      recorderRef.current = new RecordRTC(stream, {
        type: 'audio',
        mimeType: 'audio/wav',
        recorderType: RecordRTC.StereoAudioRecorder,
        numberOfAudioChannels: 1, // mono audio
        desiredSampRate: 16000, // 16khz sampling rate
        timeSlice: 1000, // Get blob every second (optional)
      });
      
      recorderRef.current.startRecording();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
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
        };
        setMessages(prev => [...prev, audioMessage]);

        // Process the audio with STT
        await processAudioWithSTT(blob);

        // Stop all tracks
        const stream = recorderRef.current.stream;
        if (stream) {
          stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
        }

        recorderRef.current = null;
        setIsRecording(false);
      });
    }
  };

  const processAudioWithSTT = async (audioBlob: Blob) => {
    setIsProcessing(true);
    try {
      const model = process.env.REACT_APP_CEREBRAL_STT_MODEL || 'azure';
      const formData = new FormData();
      formData.append('audio_data', audioBlob, 'recording.wav');
      formData.append('model', model);

      const apiSttUrl = process.env.REACT_APP_CEREBRAL_STT_API_URL || 'http://localhost:5004/Cerebral/api/stt';
      const response = await fetch(apiSttUrl, {       
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('STT processing failed');
      }

      const data = await response.json();
      const transcription = data.text || "Could not transcribe audio";

      // Add transcription message
      const transcriptionMessage: ChatMessage = {
        content: `Transcription: ${transcription}`,
        isUser: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, transcriptionMessage]);

      // Process transcription with Cerebral
      await handleCerebralApiCall(transcription);
    } catch (error) {
      console.error('Error processing audio:', error);
      const errorMessage: ChatMessage = {
        content: "I apologize, but there was an error processing your audio message.",
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCerebralApiCall = async (inputMessage: string): Promise<void> => {
    try {
      const apiUrl = process.env.REACT_APP_CEREBRAL_API_URL || 'http://localhost:5004/Cerebral/api/process_question';
      const industry = process.env.REACT_APP_CEREBRAL_INDUSTRY || 'default';
      const role = process.env.REACT_APP_CEREBRAL_ROLE || 'default';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          question: inputMessage,
          industry: industry,
          role: role
        }),
      });

      const data = await response.json();
      let formattedResponse = "";
      if (!data) {
        formattedResponse = "I apologize, but I couldn't process that request.";
      } else {
        formattedResponse = `Category: ${data.category}\n` + 
        `Query: ${data.query || data.sql_query}\n` + 
        `Query Result: ${data.query_result}\n` + 
        `Recommendations: ${data.recommendations}`;
      }
 
      const botMessage: ChatMessage = {
        content: formattedResponse,
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        content: "I apologize, but there was an error processing your request.",
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleSend = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      content: inputMessage,
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");

    try {
      await handleCerebralApiCall(inputMessage);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        content: "I apologize, but there was an error processing your request.",
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const renderMessage = (msg: ChatMessage, index: number) => {
    if (msg.isUser) {
      return (
        <UserMessage
          key={index}
          timestamp={msg.timestamp}
          actionBar={
            <>
              <ToolbarButton
                aria-label="Edit"
                icon={<EditRegular />}
                appearance="transparent"
              />
              <ToolbarButton
                aria-label="Bookmark"
                icon={<BookmarkRegular />}
                appearance="transparent"
              />
              <ToolbarButton
                aria-label="Share"
                icon={<ShareRegular />}
                appearance="transparent"
              />
            </>
          }
        >
          {msg.isAudio ? (
            <audio controls src={msg.content} className="max-w-full" />
          ) : (
            msg.content
          )}
        </UserMessage>
      );
    } else {
      return (
        <CopilotMessage
          key={index}
          avatar={
            <Avatar
              size={24}
              image={{
                src: "https://res-2-sdf.cdn.office.net/files/fabric-cdn-prod_20240411.001/assets/brand-icons/product/svg/copilot_24x1.svg",
              }}
            />
          }
          name="Cerebral"
          defaultFocused={index === messages.length - 1}
          actions={
            <Button
              appearance={copilotMode === "canvas" ? "secondary" : "transparent"}
              icon={<CopyRegular />}
            >
              {copilotMode === "canvas" ? "Copy" : ""}
            </Button>
          }
        >
          {msg.content}
        </CopilotMessage>
      );
    }
  };

  return (
    <CopilotChat {...props} style={{ margin: '30px' }}>
      {messages.map((msg, index) => renderMessage(msg, index))}

      <div style={{ marginTop: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
        <input
          style={{
            flexGrow: 1,
            padding: '8px',
            border: '1px solid #ccc',
            borderRadius: '4px'
          }}
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type your question here..."
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSend();
            }
          }}
          disabled={isRecording || isProcessing}
        />
        <Button 
          onClick={handleSend}
          disabled={isRecording || isProcessing}
        >
          Send
        </Button>
        <Button 
          icon={isRecording ? <RecordStopRegular /> : <MicRegular />}
          onClick={isRecording ? stopRecording : startRecording}
          appearance={isRecording ? "primary" : "secondary"}
          disabled={isProcessing}
        >
          {isRecording ? "Stop" : isProcessing ? "Processing..." : "Record"}
        </Button>
      </div>
    </CopilotChat>
  );
};

export default CerebralChatWithAudio;