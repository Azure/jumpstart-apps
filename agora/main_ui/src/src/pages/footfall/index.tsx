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


const Footfall = () => {
  const dataforVideo = "http://127.0.0.1:5003/video_feed?data={\"x\" : 20, \"y\" : 20,\"w\" : 300, \"h\" : 300, \"debug\" : true, \"cameraName\" : \"Nabeel\", \"video_url\": \"rtsp://rtsp_stream_container:8554/stream\" }";
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
              title="Footfall Camera" 
              videoUrl={dataforVideo} />
            </Stack.Item>
          </Main>
        </CopilotProvider>
      </FluentProvider>
    );
  };
  
  export default Footfall;