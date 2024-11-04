import * as React from "react";
import {
  Avatar,
  Button,
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
  CopyRegular,
  MicRegular,
  RecordStopRegular,
} from "@fluentui/react-icons";
import { useCopilotMode } from "@fluentui-copilot/react-provider";
import { CerebralChatInput } from "./CerebralChatInput";
import { io, Socket } from "socket.io-client";

declare const RecordRTC: any;

interface ChatMessage {
  content: string;
  isUser: boolean;
  timestamp: string;
  isAudio?: boolean;
  isCompleted: boolean;
}

interface ServerConfig {
  industry: string;
  role: string;
}

const CerebralChatWithAudio = (props: CopilotChatProps) => {
  const copilotMode = useCopilotMode();
  const [isRecording, setIsRecording] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [isConnected, setIsConnected] = React.useState(false);
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const recorderRef = React.useRef<any>(null);
  const socketRef = React.useRef<Socket | null>(null);
  const serverConfig = React.useRef<ServerConfig>({
    industry: process.env.REACT_APP_CEREBRAL_INDUSTRY || 'default',
    role: process.env.REACT_APP_CEREBRAL_ROLE || 'default'
  });
  const isMounted = React.useRef(false);
  
  // Initialize buffers for storing messages by type until 'complete' is received
  let messageBuffer = {
    classification: '',
    message: '',
    query: '',
    result: '',
    recommendations: '',
  };

  const flushBufferedMessages = (isCompleted: Boolean) => {
    const formattedMessage = `
      ${messageBuffer.classification ? `<strong>Category:</strong> ${messageBuffer.classification.trim()}<br/>` : ''}
      ${messageBuffer.message ? `<strong>Message:</strong> ${messageBuffer.message.trim()}<br/>` : ''}
      ${messageBuffer.query ? `<strong>Generated Query:</strong> ${messageBuffer.query.trim()}<br/>` : ''}
      ${messageBuffer.result ? `${messageBuffer.result.trim()}<br/>` : ''}
      ${messageBuffer.recommendations ? `<strong>Recommendations:</strong> ${messageBuffer.recommendations.trim()}<br/>` : ''}
    `.trim();
  
    if (!formattedMessage) return; // Skip if nothing to update
  
    setMessages(prevMessages => {
      if (isCompleted) {
        const updatedMessages = [...prevMessages];
        const lastMessage = updatedMessages[updatedMessages.length - 1];
        if (lastMessage && !lastMessage.isCompleted) {
          lastMessage.isCompleted = true;
          return updatedMessages;
        }
        return prevMessages;
      } else {
        const lastMessage = prevMessages[prevMessages.length - 1];
        if (lastMessage && !lastMessage.isCompleted) {
          lastMessage.content = formattedMessage;
          return [...prevMessages];
        } else {
          return [
            ...prevMessages,
            {
              content: formattedMessage,
              isUser: false,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              isCompleted: false
            }
          ];
        }
      }
    });
  
    if (isCompleted) {
      messageBuffer = { classification: '', message: '', query: '', result: '', recommendations: '' };
    }
  };
  
  
  // Initialize Socket.IO connection
  React.useEffect(() => {
    const serverUrl = process.env.REACT_APP_CEREBRAL_WS_URL || 'http://localhost:8080';
    socketRef.current = io(serverUrl, {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    if (!isMounted.current){
      addBotMessage("Connecting to Jumpstart Cerebral - Please wait...");
    }
  
    const socket = socketRef.current;
    let reconnectAttempts = 0;

    socket.on('connect', () => {
      reconnectAttempts = 0; // Reset counter on successful connection
      setIsConnected(true);
      addBotMessage("Hi, I'm here to help! You can ask me questions using text or voice.");
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      addBotMessage("Connection lost. Attempting to reconnect...");
    });

    socket.on('connect_error', () => {
      reconnectAttempts++;
      if (reconnectAttempts == 5) {
        socket.io.opts.reconnection = false; // Disable further reconnections
        addBotMessage("Connection error. Please try again later.");
      }
      setIsConnected(false);
    });

    socket.on('error', (data) => {
      setIsProcessing(false);
      addBotMessage(`Error: ${data.error}`);
    });

    // Socket event handlers
    socket.on('classification', (data) => {
      setIsProcessing(false);
      messageBuffer.classification += " " + data.category;
      flushBufferedMessages(false);
    });

    socket.on('message', (data) => {
      setIsProcessing(false);
      messageBuffer.message += " " + data.message;
      flushBufferedMessages(false);
    });

    socket.on('query', (data) => {
      setIsProcessing(false);
      messageBuffer.query += " " + data.query;
      flushBufferedMessages(false);
    });

    socket.on('result', (data) => {
      setIsProcessing(false);
      messageBuffer.result += " " + data.result;
      flushBufferedMessages(false);
    });

    socket.on('recommendations', (data) => {
      setIsProcessing(false);
      messageBuffer.recommendations = data.recommendations;
      flushBufferedMessages(false);
    });

    // Handle 'complete' event to flush buffered messages
    socket.on('complete', () => {
      flushBufferedMessages(true);
    });

    // Load RecordRTC script
    const script = document.createElement('script');
    script.src = `${process.env.PUBLIC_URL}/RecordRTC.min.js`;
    script.async = true;
    document.body.appendChild(script);

    isMounted.current = true;

    return () => {
      socket.close();
      document.body.removeChild(script);
    };
  }, []);

  const addBotMessage = (content: string) => {
    const newMessage: ChatMessage = {
      content,
      isUser: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isCompleted: true
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const handleSend = (ev: React.FormEvent, data: { value: string }) => {
    setIsProcessing(true);
    const message = data.value.trim();
    if (!message || !isConnected) return;

    // Add user message to chat
    const userMessage: ChatMessage = {
      content: message,
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isCompleted: true
    };
    setMessages(prev => [...prev, userMessage]);

    // Send message to server
    socketRef.current?.emit('process_question', {
      question: message,
      industry: serverConfig.current.industry,
      role: serverConfig.current.role
    });
  };

  const startRecording = async () => {
    try {
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
    } catch (error) {
      console.error('Error accessing microphone:', error);
      addBotMessage("Error accessing microphone. Please check your permissions.");
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

        // Cleanup
        const stream = recorderRef.current.stream;
        stream?.getTracks().forEach((track: MediaStreamTrack) => track.stop());
        recorderRef.current = null;
        setIsRecording(false);
      });
    }
  };

  const processAudioWithSTT = async (audioBlob: Blob) => {
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('audio_data', audioBlob, 'recording.wav');
      formData.append('model', process.env.REACT_APP_CEREBRAL_STT_MODEL || 'azure');

      const response = await fetch(
        process.env.REACT_APP_CEREBRAL_STT_API_URL || 'http://localhost:5004/Cerebral/api/stt',
        {
          method: 'POST',
          body: formData,
        }
      );
      if (!response.ok) throw new Error('STT processing failed');

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

      // Send transcription to server
      socketRef.current?.emit('process_question', {
        question: transcription,
        industry: serverConfig.current.industry,
        role: serverConfig.current.role
      });
    } catch (error) {
      console.error('Error processing audio:', error);
      addBotMessage("Sorry, there was an error processing your audio message.");
    } finally {
      setIsProcessing(false);
    }
  };

  const renderMessage = (msg: ChatMessage, index: number) => {
    if (msg.isUser) {
      return (
        <UserMessage key={index} timestamp={msg.timestamp}>
          {msg.isAudio ? (
            <audio controls src={msg.content} className="max-w-full" />
          ) : (
            msg.content
          )}
        </UserMessage>
      );
    }

    return (
      <CopilotMessage
        key={index}
        avatar={
          <Avatar
            size={20}
            image={{
              src: "./Cerebral_round.png",
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
      <div dangerouslySetInnerHTML={{ __html: msg.content }} />
      </CopilotMessage>
    );
  };

  const renderProcessing = () => {
    return (
      <CopilotMessage
        avatar={
          <Avatar
            size={24}
            image={{
              src: "./Cerebral_round.png",
            }}
          />
        }
        name="Copilot"
        loadingState="loading"
      >
        Searching...
      </CopilotMessage>
    );
  };
  
  return (
    <FluentProvider theme={webLightTheme}>
      <CopilotChat {...props} style={{ margin: '30px' }}>
        {messages.map((msg, index) => renderMessage(msg, index))}

        {isProcessing && renderProcessing()}

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