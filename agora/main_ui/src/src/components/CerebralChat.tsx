import * as React from "react";
import {
  Avatar,
  Button,
  ToolbarButton,
  FluentProvider,
  webLightTheme,
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
import { CerebralChatInput } from "./CerebralChatInput";

// Declare RecordRTC types
declare const RecordRTC: any;

interface ChatMessage {
  content: string;
  isUser: boolean;
  timestamp: string;
  isAudio?: boolean;
  isCompleted: boolean;
}

const CerebralChatWithAudio = (props: CopilotChatProps) => {
  const copilotMode = useCopilotMode();
  const [inputMessage, setInputMessage] = React.useState("");
  const [isRecording, setIsRecording] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const recorderRef = React.useRef<any>(null);
  const wsRef = React.useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = React.useState(false);
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);

  // WebSocket connection setup
  const connectWebSocket = React.useCallback(() => {
    const wsUrl = process.env.REACT_APP_CEREBRAL_WS_URL || "/CerebralWS";

    try {
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = () => {
        setIsConnected(true);
        setMessages([{
          content: "Hi, I'm here to help! You can ask me questions using text or voice, and I'll do my best to provide helpful answers.",
          isUser: false,
          isCompleted: true,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }]);
      };

      wsRef.current.onclose = () => {
        setIsConnected(false);
        setMessages([{
          content: "Connection with Cerebral was not successful. Please try again later.",
          isUser: false,
          isCompleted: true,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }]);
      };

      wsRef.current.onerror = () => {
        setIsConnected(false);
        setMessages([{
          content: "Connection with Cerebral was not successful. Please try again later.",
          isUser: false,
          isCompleted: true,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }]);
      };

      wsRef.current.onmessage = (event) => {
        try {
          const response = event.data;
          if (!response) return;

          // Check if the response contains the word error
          if (response.includes('error')) {
            const errorMessage: ChatMessage = {
              content: "An error occurred while processing your request",
              isUser: false,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isCompleted: true,
            };
            setMessages(prevMessages => [...prevMessages, errorMessage]);
            return;
          }

          // Using the functional form of setMessages to avoid stale state
          setMessages(prevMessages => {
            const lastMessage = prevMessages.length > 0 ? prevMessages[prevMessages.length - 1] : null;
            const isTerminationCharPresent = response.includes('\r');

            if (lastMessage && !lastMessage.isCompleted) {
              const updatedMessages = [...prevMessages];
              updatedMessages[updatedMessages.length - 1] = {
                ...lastMessage,
                content: lastMessage.content + " " + response,
                isCompleted: isTerminationCharPresent,
              };
              return updatedMessages;
            } else {
              const botMessage: ChatMessage = {
                content: response,
                isUser: false,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isCompleted: isTerminationCharPresent,
              };
              return [...prevMessages, botMessage];
            }
          });
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      };
    }
    catch (error) {
      console.error('WebSocket connection error:', error);
      setIsConnected(false);
      setMessages([{
        content: "Connection with Cerebral was not successful. Please try again later.",
        isUser: false,
        isCompleted: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    }
  }, []);

  // Clean up WebSocket connection
  const closeWebSocket = React.useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
      setIsConnected(false);
    }
  }, []);

  // Handle message sending
  const handleSend = async (ev: React.FormEvent, data: { value: string }) => {
    let inputMessage = data.value;
    if (!inputMessage.trim() || !isConnected) return;

    const userMessage: ChatMessage = {
      content: inputMessage,
      isUser: true,
      isCompleted: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, userMessage]);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'message',
        content: inputMessage
      }));
    }
    setInputMessage("");
  };

  React.useEffect(() => {
    // Load RecordRTC script
    const script = document.createElement('script');
    script.src = `${process.env.PUBLIC_URL}/RecordRTC.min.js`;
    script.async = true;
    document.body.appendChild(script);

    connectWebSocket();
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
          isCompleted: true,
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
        isCompleted: true,
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
        isCompleted: true,
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
        isCompleted: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        content: "I apologize, but there was an error processing your request.",
        isUser: false,
        isCompleted: true,
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
    <FluentProvider theme={webLightTheme}>
      <CopilotChat {...props} style={{ margin: '30px' }}>
        {messages.map((msg, index) => renderMessage(msg, index))}

        <CerebralChatInput
          onSubmit={handleSend}
          disabled={!isConnected || isRecording || isProcessing}
          maxLength={500}
          charactersRemainingMessage={(remaining) => `${remaining} characters remaining`}
        />

        <div style={{ marginTop: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
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
    </FluentProvider>
  );
};

export default CerebralChatWithAudio;