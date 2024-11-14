import React, { useState }  from 'react';
import {
  FluentProvider,
  webLightTheme,
  Text,
} from "@fluentui/react-components";
import Header from '../../components/MaintenanceWorkerHeader';
import Footer from '../../components/SuiteFooter';
import SideMenu from "../../components/MaintenanceMenu";
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
import CerebralChatWithAudio from '../../components/Chatter';
import { Panel, PanelType, DefaultButton, ProgressIndicator } from '@fluentui/react';
import CerebralHeader from '../../components/CerebralHeader';
import { initializeIcons } from "@fluentui/react/lib/Icons";
import type { ChatInputProps } from "@fluentui-copilot/react-chat-input";

initializeIcons();

const Main = (props: IStackProps) => (
    <Stack horizontal grow={1} disableShrink {...props} />
  );

const themedMediumStackTokens: IStackTokens = {
childrenGap: "m",
padding: "m",
};

const MaintenanceWorker = () => {
  const [isCerebralDrawerOpen, setIsCerebralDrawerOpen] = useState(false);
  const onRenderCerebralFooterContent = React.useCallback(
    () => (
      <Stack horizontal tokens={{ childrenGap: 10 }}>
        {/* <PrimaryButton onClick={onSaveDrawer}>Save</PrimaryButton> */}
        <DefaultButton onClick={onCancelCerebralDrawer}>Close</DefaultButton>
      </Stack>
    ),
    []
  );
  const onCancelCerebralDrawer = () => {
    setIsCerebralDrawerOpen(false);
  };   
  const toggleCerebralDrawer = () => {
    setIsCerebralDrawerOpen(!isCerebralDrawerOpen);
  };  
    return (
        <FluentProvider theme={webLightTheme}>
        <CopilotProvider mode='sidecar'>
          <Header callParentFunction={toggleCerebralDrawer}/>
          <Main>
          <Panel
            isOpen={isCerebralDrawerOpen}
            onDismiss={toggleCerebralDrawer}
            type={PanelType.custom}
            customWidth="30%"
            headerText=""
            onRenderHeader={() => (
              <CerebralHeader 
                title="Cerebral" 
                onClose={toggleCerebralDrawer} 
              />
            )}
            isFooterAtBottom={true}
            hasCloseButton={true}
            closeButtonAriaLabel="Close"
            isLightDismiss={true}            
            >
              <CerebralChatWithAudio {...({} as ChatInputProps)}/>
          </Panel>             
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
          <Footer />
        </CopilotProvider>
      </FluentProvider>
    );
  };
  
  export default MaintenanceWorker;