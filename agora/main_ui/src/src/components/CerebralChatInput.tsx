import * as React from "react";
import { ChatInput } from "@fluentui-copilot/react-chat-input";
import type { ChatInputProps } from "@fluentui-copilot/react-chat-input";
import { Button, Divider } from "@fluentui/react-components";
import {
  Apps20Regular,
  Attach20Regular,
  Mic20Regular,
} from "@fluentui/react-icons";
export const CerebralChatInput = (props: ChatInputProps) => {
  return (
    <ChatInput
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
      onSubmit={(e, data) => console.log(data.value)}
      count={{ "data-testid": "count" } as any}
      {...props}
    />
  );
};