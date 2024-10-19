import React, { useState } from 'react';
import { MoreHorizontal20Regular } from "@fluentui/react-icons";
import { VerticalBarChart, IVerticalBarChartProps, IVerticalBarChartDataPoint } from '@fluentui/react-charting';
import { Checkbox, ChoiceGroup, IChoiceGroupOption, Label, Stack, TextField, PrimaryButton } from '@fluentui/react';
import { Panel, PanelType, DefaultButton } from '@fluentui/react';
import {
    Card,
    CardFooter,
    CardHeader,
    CardPreview,
    Text,
    makeStyles,
    Button,
    Link,
    tokens,
    Switch,
    mergeClasses,    
    MessageBar,
    MessageBarActions,
    MessageBarBody,
    MessageBarTitle,
    Subtitle1,
    Caption1
  } from "@fluentui/react-components";
  interface IStyledLineChartExampleState {
    width: number;
    height: number;
  }
const useStyles = makeStyles({
    main: {
        gap: "36px",
        display: "flex",
        flexDirection: "column",
        flexWrap: "wrap",
      },
      card: {
        width: "100%",
        maxWidth: "700px",
        height: "100%",
        border: "1px solid #E0E0E0",
        borderRadius: "8px",
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
});
interface CartPanelProps {
    isOpen: boolean;
    onDismiss: () => void;
    onSave: () => void;
  }   
const ActiveCart: React.FC<CartPanelProps> = ({ isOpen, onDismiss, onSave }) =>{
    const classes  = useStyles();
    const styles = useStyles();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);        
    const toggleDrawer = () => {
        setIsDrawerOpen(!isDrawerOpen);
      };

    const onRenderFooterContent = React.useCallback(
    () => (
        <Stack horizontal tokens={{ childrenGap: 10 }}>
        <PrimaryButton onClick={onSave}>Save</PrimaryButton>
        <DefaultButton onClick={onDismiss}>Cancel</DefaultButton>
        </Stack>
    ),
    [onSave, onDismiss]
    );  
    return (
        <Panel
        isOpen={isDrawerOpen}
        onDismiss={toggleDrawer}
        type={PanelType.custom}
        customWidth="25%"
        headerText="Add camera"
        onRenderFooterContent={onRenderFooterContent}
        isFooterAtBottom={true}
    >
        <Stack>
            <Stack.Item>
            </Stack.Item>
            <Stack.Item>
            </Stack.Item>
            <Stack.Item>
            </Stack.Item>
            <Stack.Item>
            </Stack.Item>
            <Stack.Item>
            </Stack.Item>
            <Stack.Item>
            </Stack.Item>
        </Stack>
        </Panel>                        

    );
  };
  
  export default ActiveCart;