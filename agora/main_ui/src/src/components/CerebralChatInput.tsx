import * as React from "react";
import { ChatInput } from "@fluentui-copilot/react-chat-input";
import type { ChatInputProps } from "@fluentui-copilot/react-chat-input";
import { Button } from "@fluentui/react-components";
import { Mic20Regular } from "@fluentui/react-icons";

// Export the ref interface
export interface ChatInputRef {
  clear: () => void;
  focus: () => void;
}

// The component keeps all original ChatInputProps
export const CerebralChatInput = React.forwardRef<ChatInputRef, ChatInputProps>( (props, ref) => {
    const [inputValue, setInputValue] = React.useState("");

    const handleSubmit: ChatInputProps['onSubmit'] = (e, data) => {
      debugger;
      if (data.value.trim()) {
        props.onSubmit?.(e, { value: data.value });
        setInputValue("");
      }
    };

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
            />
          </span>
        }
        aria-label="Cerebral Chat"
        placeholderValue="Ask questions and interact with Cerebral"
        count={{ "data-testid": "count" } as any}
      />
    );
  }
);

// Add display name for React DevTools
CerebralChatInput.displayName = "CerebralChatInput";