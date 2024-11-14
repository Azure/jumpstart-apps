import React, { useState }  from 'react';
import {
  FluentProvider,
  webLightTheme,
  Text,
  makeStyles,
  tokens
} from "@fluentui/react-components";
import Header from '../../components/SuiteHeader';
import Footer from '../../components/SuiteFooter';
import SideMenu from "../../components/SideMenu";
import { Default as Banner } from "../../components/Banner";
import Cards from "../../components/Cards";
import Greetings from "../../components/Greetings";
import InventoryStatus from "../../components/InventoryStatus";
import DeviceStatus from "../../components/DeviceStatus";
import { DefaultButton, IStackProps, IStackTokens, Panel, PanelType, Stack } from "@fluentui/react";

import { CopilotProvider } from "@fluentui-copilot/react-copilot";
import logo from './logo.svg';
import '../../App.css';
import Cameras from '../../components/Cameras';
import CerebralChatWithAudio from '../../components/Chatter';
import CerebralHeader from '../../components/CerebralHeader';
import type { ChatInputProps } from "@fluentui-copilot/react-chat-input";

const Main = (props: IStackProps) => (
    <Stack horizontal grow={1} disableShrink {...props} />
  );

const themedMediumStackTokens: IStackTokens = {
childrenGap: "m",
padding: "m",
};
const useStyles = makeStyles({
  main: {
      gap: "36px",
      display: "flex",
      flexDirection: "column",
      flexWrap: "wrap",
    },
  
    card: {
      width: "184px",
      maxWidth: "100%",
      height: "252px",
      border: "1px solid #E0E0E0",
      borderRadius: "8px",
    },
  stack: {
    width: "350px",
    maxWidth: "100%",
    paddingLeft: "40px"
  },
  messageBarStyle :{
      width: "500px",        
      borderImage: "linear-gradient(to right, #1298EB 0%, #C255BB 100%) 1",
      background: "#FFFFFF",
      marginLeft: "10px",
  },
  compact: {
      width: "600px",
    },
    resizableArea: {
      display: "flex",
      flexDirection: "column",
      padding: "30px 10px",
      gap: "10px",
      border: `2px solid ${tokens.colorBrandBackground}`,
      position: "relative",
      overflow: "hidden",
  
      "::after": {
        content: `''`,
        //position: "absolute",
        padding: "1px 4px 1px",
        top: "-2px",
        left: "-2px",
        fontFamily: "monospace",
        fontSize: "15px",
        fontWeight: 900,
        lineHeight: 1,
        letterSpacing: "1px",
        color: tokens.colorNeutralForegroundOnBrand,
        backgroundColor: tokens.colorBrandBackground,
      },
  },  

  section: {
      width: "fit-content",
    },
  
    title: { margin: "0 0 12px" },
  
    horizontalCardImage: {
      width: "64px",
      height: "64px",
    },
  
    headerImage: {
      borderRadius: "4px",
      maxWidth: "44px",
      maxHeight: "44px",
    },
    container: {
      "display": "flex",
      "flex-direction": "column",
      "height": "100%",
  },
  topdiv: {
    "flex": "1",
    "display": "flex",
    "justify-content": "center",
    "align-items": "center",      
      "background-color": "#fff"
  },
  bottomdiv: {
    "flex": "1",
    "display": "flex",
    "justify-content": "center",
    "align-items": "center",      
      "background-color": "#fff"
  },
  ContainerBoxMainTitle: {
    "font-size": "var(--Font-size-900, 40px)",
    "font-family": "var(--Font-family-Base, 'Segoe UI')",
    "font-style": "normal",
    "font-weight": "600",
    "color": "#000",
    "line-height": "var(--Line-height-900, 52px)",
  },
  ContainerBoxSubTitle: {
      "font-size": "11px",
      "font-family": "var(--Font-family-Base, 'Segoe UI')",
      "font-style": "normal",
      "font-weight": "350",
      "color": "#000",
      "line-height": "18px",
  },
  ContainerBoxHeading: {
      "font-size": "14px",
      "font-family": "var(--Font-family-Base, 'Segoe UI')",
      "font-style": "normal",
      "font-weight": "600",
      "color": "#000",
      "line-height": "20px",
  },
  ContainerBoxTopDivider: {
      "width": "100%",
      "height": "1px",
      "background-color": "#C4C4C4",
      "flex-shrink": "0",
  },
    caption: {
      color: tokens.colorNeutralForeground3,
    },
  
    text: { margin: "0" },          
});  
const StoreManager = () => {
  const styles = useStyles();
  const [isCerebralDrawerOpen, setIsCerebralDrawerOpen] = useState(false);
  const toggleCerebralDrawer = () => {
    setIsCerebralDrawerOpen(!isCerebralDrawerOpen);
  }; 
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

    return (
        <FluentProvider theme={webLightTheme}>
        <CopilotProvider mode='sidecar'>
          <Header callParentFunction={toggleCerebralDrawer}/>
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
          <Main>
          <Stack.Item>
              <SideMenu />
          </Stack.Item>
          <Stack.Item grow={3} style={{backgroundColor: "#F3F2F1"}}>
            <Stack tokens={themedMediumStackTokens}>
              <Greetings />
              <Cards />
              <Stack horizontal>
                <Cameras />
                <Stack>
                  <InventoryStatus />
                  <DeviceStatus />
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
  
  export default StoreManager;