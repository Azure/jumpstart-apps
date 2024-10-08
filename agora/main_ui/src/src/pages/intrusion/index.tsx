import React from 'react';
import {
  FluentProvider,
  webLightTheme,
  Text,
} from "@fluentui/react-components";
import Header from '../../components/Header';
import SideMenu from "../../components/SideMenu";
import { Default as Banner } from "../../components/Banner";
import Greetings from "../../components/Greetings";
import { IStackProps, IStackTokens, Stack } from "@fluentui/react";

import { CopilotProvider } from "@fluentui-copilot/react-copilot";
import '../../App.css';
import VideoStream from '../../components/VideoStream';

const Main = (props: IStackProps) => (
    <Stack horizontal grow={1} disableShrink {...props} />
  );

const themedMediumStackTokens: IStackTokens = {
childrenGap: "m",
padding: "m",
};

const Intrusion = () => {
    return (
        <FluentProvider theme={webLightTheme}>
        <CopilotProvider mode='sidecar'>
          <Header />
          <Main>
          <Stack.Item>
              <SideMenu />
          </Stack.Item>
            <Stack.Item grow={3}>
            <Stack tokens={themedMediumStackTokens}>
              <Greetings />
              <Banner></Banner>
            </Stack>
            <VideoStream 
              title="Intrusion Camera" 
              videoUrl={process.env.REACT_APP_INTRUSION_VIDEO_URL || ""} 
            />
            </Stack.Item>
          </Main>
        </CopilotProvider>
      </FluentProvider>
    );
  };
  
  export default Intrusion;