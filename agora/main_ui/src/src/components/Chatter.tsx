import * as React from "react";
import { ChatInput } from "@fluentui-copilot/react-chat-input";
import type { ChatInputProps, ChatInputSubmitEvents } from "@fluentui-copilot/react-chat-input";
import { Avatar, Button, Divider, FluentProvider, webLightTheme } from "@fluentui/react-components";
import {
  Apps20Regular,
  Apps20Filled,
  Attach20Regular,
  bundleIcon,
  CopyRegular,
  Mic20Regular,
  Mic20Filled,
  TextClearFormatting20Regular,
  RecordStopRegular,
  CheckmarkRegular
} from "@fluentui/react-icons";
import { useCopilotMode } from "@fluentui-copilot/react-provider";
import { io, Socket } from "socket.io-client";
import ReactMarkdown from 'react-markdown';
import {
  CopilotChat,
  CopilotMessageV2 as CopilotMessage,
  UserMessageV2 as UserMessage,
} from "@fluentui-copilot/react-copilot-chat";
import { EditorInputValueData } from "@fluentui-copilot/react-copilot";
import type { CopilotChatProps } from "@fluentui-copilot/react-copilot-chat";
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
interface ServerConfig {
  industry: string;
  role: string;
}

interface CopyButtonProps {
  msg: { content: string };
  copilotMode: "canvas" | "other"; // Adjust as per your actual type
}

const Apps20 = bundleIcon(Apps20Filled, Apps20Regular);
const Mic20 = bundleIcon(Mic20Filled, Mic20Regular);
export const CerebralChatWithAudio = (props: ChatInputProps) => {
  const copilotMode = useCopilotMode();
  const [isRecording, setIsRecording] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [isConnected, setIsConnected] = React.useState(false);
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [isCopied, setIsCopied] = React.useState(false);
  const recorderRef = React.useRef<any>(null);
  const socketRef = React.useRef<Socket | null>(null);
  const isMounted = React.useRef(false);
  const controlRef = React.useRef<ImperativeControlPluginRef>(null);
  
  // Initialize buffers for storing messages by type until 'complete' is received
  let messageBuffer = {
    classification: '',
    message: '',
    query: '',
    result: '',
    recommendations: '',
  };

  const getServerConfigFromUrl = (): ServerConfig => {
    const industry = "default"; // To be replaced with actual industry in the future
    //const role = window.location.pathname === "/shopper" ? "shopper" : "default";
    const role = "default";
    return { industry, role };
  };
  const serverConfig = React.useRef<ServerConfig>(getServerConfigFromUrl());
  
  function detectFormat(text: string): "HTML" | "Markdown" | "String" {
    // Patterns to detect HTML
    const htmlPatterns: RegExp[] = [
      /<\s*html[^>]*>/i,          // Matches HTML document structure
      /<\s*head[^>]*>.*<\/head>/i, // Matches <head>...</head> block
      /<\s*body[^>]*>.*<\/body>/i, // Matches <body>...</body> block
      /<\s*div[^>]*>/i,            // Matches <div> tag
      /<\s*p[^>]*>/i,              // Matches <p> tag
      /<\s*a[^>]*>.*<\/a>/i,       // Matches <a>...</a> link
      /<\s*h[1-6][^>]*>/i          // Matches <h1> to <h6> headers
    ];
  
    // Patterns to detect Markdown
    const markdownPatterns: RegExp[] = [
      /^#{1,6}\s/m,                // Matches Markdown headers (#, ##, ###, etc.)
      /\*\*[^*]+\*\*/,             // Matches bold text **bold**
      /\*[^*]+\*/,                 // Matches italic text *italic*
      /\[(.*?)\]\((.*?)\)/,        // Matches Markdown links [text](url)
      /^\s*[-+*]\s+/m,             // Matches unordered lists (-, *, +)
      /^\s*\d+\.\s+/m,             // Matches ordered lists (1., 2., 3.)
      /`[^`]+`/,                   // Matches inline code `code`
      /^>\s+/m                     // Matches blockquotes
    ];
  
    // Check if text matches any HTML patterns
    for (const pattern of htmlPatterns) {
      if (pattern.test(text)) {
        return 'HTML';
      }
    }
  
    // Check if text matches any Markdown patterns
    for (const pattern of markdownPatterns) {
      if (pattern.test(text)) {
        return 'Markdown';
      }
    }
  
    // If no patterns matched, return 'Unknown'
    return 'String';
  }

  const handleOnClick = async () => {
    if (!isRecording) {
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
          setMessages(prev => [...prev, audioMessage]);

          // // Process the audio with STT
          await processAudioWithSTT(blob);

          // Cleanup
          const stream = recorderRef.current.stream;
          stream?.getTracks().forEach((track: MediaStreamTrack) => track.stop());
          recorderRef.current = null;
          setIsRecording(false);
        });
      }
    }
  }

  const handleCopy = (msg: string) => {
    // Copy content to clipboard
    navigator.clipboard.writeText(msg).then(() => {
      // Show "copied" state
      setIsCopied(true);
      
      // Reset state after 1.5 seconds
      setTimeout(() => {
        setIsCopied(false);
      }, 1500);
    });
  };

  const flushBufferedMessages = (isCompleted: Boolean, eventName: String) => {
    const debugModeToggle = document.getElementById("debugModeToggle") as HTMLInputElement;
    const debuggerMode = debugModeToggle && debugModeToggle.checked;

    let formattedMessage = `
          ${messageBuffer.classification && debuggerMode ? `<strong>Category:</strong> ${messageBuffer.classification.trim()}<br/>` : ''}
          ${messageBuffer.message && debuggerMode ? `<strong>Message:</strong> ${messageBuffer.message.trim()}<br/>` : ''}
          ${messageBuffer.query && debuggerMode ? `<strong>Generated Query:</strong> ${messageBuffer.query.trim()}<br/>` : ''}
          ${messageBuffer.result ? `${debuggerMode ? "<strong>Result:</strong>" : ""} ${messageBuffer.result.trim()}` : ''}
          ${messageBuffer.recommendations ? `${debuggerMode ? "<strong>Recommendations:</strong>" : ""} ${messageBuffer.recommendations.trim()}` : ''}
    `.trim();

    // Remove trailing <br/> or </br> from the formatted message
    formattedMessage = formattedMessage.replace(/<br\/?>$/, '');

    if (!formattedMessage) return; // Skip if there's nothing to update

    setMessages((prevMessages) => {
        const updatedMessages = [...prevMessages];
        const lastMessage = updatedMessages[updatedMessages.length - 1];

        if (isCompleted) {
            // Mark last message as completed without adding a duplicate
            if (lastMessage && !lastMessage.isCompleted) {
                lastMessage.isCompleted = true;
            }
        } else {
            if (lastMessage && !lastMessage.isCompleted) {
                // Update content of the last message if it's not completed
                lastMessage.content = formattedMessage;
            } else {
                // Otherwise, add a new message
                updatedMessages.push({
                    content: formattedMessage,
                    isUser: false,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    isCompleted: false
                });
            }
        }

        return updatedMessages;
    });

    if (isCompleted) {
        // Clear the message buffer after completion
        messageBuffer = { classification: '', message: '', query: '', result: '', recommendations: '' };
    }
  };
  
  // Initialize Socket.IO connection
  React.useEffect(() => {
    const serverUrl = process.env.REACT_APP_CEREBRAL_WS_URL || '/';
    socketRef.current = io(serverUrl, {
      transports: ["websocket", "polling"],  // Ensures WebSocket is preferred
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    setTimeout(() => {
      if (!isMounted.current && socketRef.current && !socketRef.current.connected) {
        isMounted.current = true;
        addBotMessage("Connection is taking longer than expected. Please wait...");
      }
    }, 1000);

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
      const category = !data.category || data.category === "unknown" ? "general" : data.category;
      messageBuffer.classification += " " + category;
      flushBufferedMessages(false, 'classification');
    });

    socket.on('message', (data) => {
      messageBuffer.message += " " + data.message;
      flushBufferedMessages(false, 'message');
    });

    socket.on('query', (data) => {
      messageBuffer.query += " " + data.query;
      flushBufferedMessages(false, 'query');
    });

    socket.on('result', (data) => {
      messageBuffer.result += " " + data.result;
      flushBufferedMessages(false, 'result');
    });

    socket.on('recommendations', (data) => {
      messageBuffer.recommendations = data.recommendations;
      flushBufferedMessages(false, 'recommendations');
    });

    // Handle 'complete' event to flush buffered messages
    socket.on('complete', () => {
      setTimeout(() => {
        flushBufferedMessages(true, 'complete');
        setIsProcessing(false);
      }, 500);
    });

    // Load RecordRTC script
    const script = document.createElement('script');
    script.src = `${process.env.PUBLIC_URL}/RecordRTC.min.js`;
    script.async = true;
    document.body.appendChild(script);

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

  const handleSend = (ev: ChatInputSubmitEvents, data: EditorInputValueData) => {
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
    controlRef.current?.setInputText("");
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
        process.env.REACT_APP_CEREBRAL_STT_API_URL || '/Cerebral/api/stt',
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
          src: "LogoCerebralRound.png",
        }}
          />
        }
        name="Cerebral"
        defaultFocused={index === messages.length - 1}
        actions={
          <Button
            onClick={() => handleCopy(msg.content)}
            appearance={copilotMode === "canvas" ? "secondary" : "transparent"}
            icon={isCopied ? <CheckmarkRegular /> : <CopyRegular />}
          >
            {copilotMode === "canvas" ? (isCopied ? "Copied!" : "Copy") : ""}
          </Button>
        }
      >
        {detectFormat(msg.content) === "HTML" ? (
          <div dangerouslySetInnerHTML={{ __html: msg.content }} />
        ) : detectFormat(msg.content) === "Markdown" ? (
          <ReactMarkdown>{msg.content}</ReactMarkdown>
        ) : (
          <div>{msg.content}</div>
        )}
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
              src: "LogoCerebralRound.png",
            }}
          />
        }
        name="Cerebral"
        loadingState="loading"
      >
        Searching...
      </CopilotMessage>
    );
  };
  return (
    <FluentProvider theme={webLightTheme}>
      {messages.map((msg, index) => renderMessage(msg, index))}
      {isProcessing && renderProcessing()}
      <ChatInput
        style={{ marginTop: "15px" }}
        actions={
          <span style={{ display: "flex", alignItems: "center" }}>
            <Button
                aria-label="voice-input"
                appearance="transparent"
                icon={<TextClearFormatting20Regular />}
                onClick={() => {
                  if (!isProcessing) {
                    setMessages([]);
                    controlRef.current?.setInputText("");
                    addBotMessage("Hi, I'm here to help! You can ask me questions using text or voice.");
                  }
                }}
            />
            <Divider style={{ margin: "0 4px" }} vertical />
            <Button
              aria-label="voice-input"
              appearance="transparent"
              icon={!isRecording ? <Mic20 /> : <RecordStopRegular />}
              onClick={() => handleOnClick()}
            />
          </span>
        }
        aria-label="Copilot Chat"
        placeholderValue="Ask questions and work with this document"
        onSubmit={handleSend}
        // Slots aren't typed to allow data- attributes, but they still make it to the slot correctly
        // Cast this prop bag to any to avoid the type error
        // https://github.com/microsoft/fluentui/issues/27302
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        count={{ "data-testid": "count" } as any}
        {...props}
      >
        <ImperativeControlPlugin ref={controlRef} />
      </ChatInput>
    </FluentProvider>
  );
};

export default CerebralChatWithAudio;