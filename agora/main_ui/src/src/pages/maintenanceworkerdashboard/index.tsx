import React, { useState }  from 'react';
import {
  FluentProvider,
  webLightTheme,
  makeStyles,
  tokens,
  Text,
  MessageBar,
  MessageBarTitle,
  MessageBarBody,
  MessageBarActions,
  Button,
} from "@fluentui/react-components";
import { DismissRegular } from "@fluentui/react-icons";
import SuiteHeader from '../../components/MaintenanceWorkerHeader';
import Footer from '../../components/SuiteFooter';
import SideMenu from "../../components/MaintenanceMenu";
import { Default as Banner } from "../../components/Banner";
import Cards from "../../components/MaintenanceCards";
import Greetings from "../../components/Greetings";
import Greeting from "../../components/Greeting";
import InventoryStatus from "../../components/InventoryStatus";
import { EquipmentStatusGrid as EquipmentStatusGrid } from "../../components/EquipmentStatusGrid";  
import Health from "../../components/Health";
import { IStackProps, IStackTokens, Stack } from "@fluentui/react";
import NumberOfProductsManufacturedGraph from "../../components/NumberOfProductsManufacturedGraph";
import OEEPerPlantBarGraph from "../../components/OEEPerPlantBarGraph";
import OEEByProductsBarGraph from "../../components/OEEByProductBarGraph";
import OEEByProductsGraph from "../../components/OEEByProductsGraph";
import { CopilotProvider } from "@fluentui-copilot/react-copilot";
import logo from './logo.svg';
import '../../App.css';
import Cameras from '../../components/Cameras';
import CerebralChatWithAudio from '../../components/Chatter';
import type { ChatInputProps } from "@fluentui-copilot/react-chat-input";
import CerebralHeader from '../../components/CerebralHeader';
import { Panel, PanelType, DefaultButton, ProgressIndicator } from '@fluentui/react';
import { initializeIcons } from "@fluentui/react/lib/Icons";
initializeIcons();

const Main = (props: IStackProps) => (
    <Stack horizontal grow={1} disableShrink {...props} />
  );

const themedMediumStackTokens: IStackTokens = {
childrenGap: "m",
padding: "m",
};

const useStyles = makeStyles({
  frameheader: {
      color: tokens.colorNeutralForeground1Static,
      fontFamily: "var(--Font-family-Base, 'Segoe UI')",
      fontSize: "16.849px",
      fontStyle: "normal",
      fontWeight: "600",
      lineHeight: "23.589px", /* 140% */    
      marginLeft: "10px"
    },
    container: {
      gap: "36px",
      marginBottom: "13.48px"
    }
});

const MaintenanceWorkerDashboard = () => {
  const classes  = useStyles();
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
          <SuiteHeader callParentFunction={toggleCerebralDrawer}/>
          <Main>
          <Panel
            isOpen={isCerebralDrawerOpen}
            onDismiss={toggleCerebralDrawer}
            type={PanelType.custom}
            customWidth="25%"
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
          <Stack.Item grow={3} style={{backgroundColor: "#F3F2F1"}}>
            <Stack tokens={themedMediumStackTokens}>
              <Stack>
                <Greeting />
              </Stack>
              <Stack id='Dashboard'>
                <Stack className={classes.container}>
                <MessageBar intent="error">
                  <MessageBarBody>
                    <MessageBarTitle>HotMelt has errors</MessageBarTitle>
                    Copilot detects that the HotMelt sensor in FFR2 line has errors happened in 3 hours ago
                  </MessageBarBody>
                  <MessageBarActions
                    containerAction={
                      <Button appearance="transparent" icon={<DismissRegular />} />
                    }
                  >
                    {/* <Button>Ask Cerebral</Button> */}
                  </MessageBarActions>
                </MessageBar>
                </Stack>
                <Stack className={classes.container}>
                <Cards />
                </Stack>  
                <Stack className={classes.container} horizontal>
                <NumberOfProductsManufacturedGraph />
                <OEEPerPlantBarGraph />
                <OEEByProductsBarGraph />
                </Stack>                  
              </Stack>
            </Stack>
            <Stack id='Equipment'>
              <Stack>
                <Text className={classes.frameheader}>Equipments</Text>
                <EquipmentStatusGrid />
              </Stack>
            </Stack>
          </Stack.Item>
          </Main>
          <Footer />
        </CopilotProvider>
      </FluentProvider>
    );
  };
  
  export default MaintenanceWorkerDashboard;