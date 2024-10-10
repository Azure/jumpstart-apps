import React from 'react';
import {
  FluentProvider,
  webLightTheme,
  Text,
} from "@fluentui/react-components";
import Header from '../../components/SuiteHeader';
import SideMenu from "../../components/SideMenu";
import { Default as Banner } from "../../components/Banner";
import Cards from "../../components/Cards";
import Greetings from "../../components/Greetings";
import Greeting from "../../components/Greeting";
import InventoryStatus from "../../components/InventoryStatus";
import Health from "../../components/Health";
import { IStackProps, IStackTokens, Stack } from "@fluentui/react";

import { CopilotProvider } from "@fluentui-copilot/react-copilot";
import logo from './logo.svg';
import '../../App.css';
import Cameras from '../../components/Cameras';
const Main = (props: IStackProps) => (
    <Stack horizontal grow={1} disableShrink {...props} />
  );

const themedMediumStackTokens: IStackTokens = {
childrenGap: "m",
padding: "m",
};

const MaintenanceWorker = () => {
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
              <Greeting />
              <Cards />
              <Stack horizontal>
                <Cameras />
                <Stack>
                  <Health />                  
                  <Health />
                </Stack>
              </Stack>
            </Stack>
          </Stack.Item>
          </Main>
        </CopilotProvider>
      </FluentProvider>
    );
  };
  
  export default MaintenanceWorker;