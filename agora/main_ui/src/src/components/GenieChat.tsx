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
} from "@fluentui/react-icons";
import { useCopilotMode } from "@fluentui-copilot/react-provider";

interface ChatMessage {
  content: string;
  isUser: boolean;
  timestamp: string;
}

const SimplifiedCopilotChat = (props: CopilotChatProps) => {
  const copilotMode = useCopilotMode();
  const [inputMessage, setInputMessage] = React.useState("");
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    {
      content: "Hi, I'm here to help! You can ask me questions, and I'll do my best to provide helpful answers.",
      isUser: false,
      timestamp: "Now",
    },
  ]);

  const handleGenieApiCall = async (inputMessage: string): Promise<void> => {
    try {
      const apiUrl = process.env.REACT_APP_GENIE_API_URL || 'http://localhost:5004/Cerebral/api/classify_question';
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: inputMessage }),
      });

      const data = await response.json();

      // Add bot response to chat
      const botMessage: ChatMessage = {
        content: data ? data.response : "I apologize, but I couldn't process that request.",
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, botMessage]);
    }
    catch (error) {
      console.error('Error sending message:', error);

      // Add error message to chat
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

    // Add user message to chat
    const userMessage: ChatMessage = {
      content: inputMessage,
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, userMessage]);

    // Clear input
    setInputMessage("");

    try {
      await handleGenieApiCall(inputMessage);
    } 
    catch (error) {
      console.error('Error sending message:', error);

      // Add error message to chat
      const errorMessage: ChatMessage = {
        content: "I apologize, but there was an error processing your request.",
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  return (
    <CopilotChat {...props} style={{ margin: '30px' }}>
      {messages.map((msg, index) =>
        msg.isUser ? (
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
            {msg.content}
          </UserMessage>
        ) : (
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
            name="Genie"
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
        )
      )}

      <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
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
        />
        <Button onClick={handleSend}>Send</Button>
      </div>
    </CopilotChat>
  );
};

export default SimplifiedCopilotChat;