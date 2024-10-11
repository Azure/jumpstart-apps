import React from 'react';
import {
  FluentProvider,
  webLightTheme,
  Text,
  makeStyles,
} from "@fluentui/react-components";
import Header from '../../components/SuiteHeader';
import SideMenu from "../../components/MaintenanceMenu";
import { Pivot, PivotItem } from '@fluentui/react';
import { IStackProps, IStackTokens, Stack } from "@fluentui/react";

import { CopilotProvider } from "@fluentui-copilot/react-copilot";
import logo from './logo.svg';
import '../../App.css';
import Cameras from '../../components/MaintenanceCameras';
const Main = (props: IStackProps) => (
    <Stack horizontal grow={1} disableShrink {...props} />
  );
  const useStyles = makeStyles({
    categoryTextStyles: {
        gap: "36px",
        display: "flex",
        flexDirection: "column",
        flexWrap: "wrap",
      },
      pivotStyles: {
        marginTop: '60px',
      }
});
const themedMediumStackTokens: IStackTokens = {
childrenGap: "m",
padding: "m",
};
const categoryTextStyles = {
  root: {
    width: '14.28%', // 100% / 7 for equal width
    height: '100%',
    
  },
};
const CamerasZones = () => {
    const styles = useStyles();
    return (
        <FluentProvider theme={webLightTheme}>
        <CopilotProvider mode='sidecar'>
          <Header />
          <Main>
          <Stack.Item>
              <SideMenu />
          </Stack.Item>
          <Stack.Item grow={3}>
          <Pivot className={styles.pivotStyles}>
            <PivotItem headerText="Cameras">
              <div>
                {/* Content for Vegetables tab */}

                <Cameras />
              </div>
            </PivotItem>
            <PivotItem headerText="Zones">
              <div>
                {/* Content for Fruits tab */}
                <Text className={styles.categoryTextStyles}>Vegetables</Text>
              </div>
            </PivotItem>
          </Pivot>
          </Stack.Item>
          </Main>
        </CopilotProvider>
      </FluentProvider>
    );
  };
  
  export default CamerasZones;