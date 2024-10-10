import * as React from "react";
import { MoreHorizontal20Regular } from "@fluentui/react-icons";
import { VerticalBarChart, IVerticalBarChartProps, IVerticalBarChartDataPoint } from '@fluentui/react-charting';
import { Checkbox, ChoiceGroup, IChoiceGroupOption, Label, Stack, TextField } from '@fluentui/react';
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

interface IVerticalBarState {
    selectedCallout: string;
    barWidthEnabled: boolean;
    xAxisInnerPaddingEnabled: boolean;
    xAxisOuterPaddingEnabled: boolean;
    barWidth: number;
    maxBarWidth: number;
    xAxisInnerPadding: number;
    xAxisOuterPadding: number;
    width: number;
    height: number;
    enableGradient: boolean;
    roundCorners: boolean;
  }
const StoreOrdersGraph = () => {
    const classes  = useStyles();
    const points: IVerticalBarChartDataPoint[] = [
        {
          x: 'Jan',
          y: 678,
          color: "#637CEF",
        },
        {
          x: 'Feb',
          y: 750,
          color: "#637CEF",
        },
        {
          x: 'Mar',
          y: 603,
          color: "#637CEF",
        },
        {
          x: 'Apr',
          y: 678,
          color: "#637CEF",
        },
        {
          x: 'May',
          y: 603,
          color: "#637CEF",
        },
        {
          x: 'Jun',
          y: 908,
          color: "#637CEF",
        },
      ];  
    const rootStyle = {
        width: `700px`,
        height: `300px`,
      };
    return (
      <Card className={classes.card}>
    <CardHeader
      header={<Text className={classes.ContainerBoxHeading}>OEE by products</Text>}
      description={
        <Caption1 className={classes.caption}></Caption1>
      }
      action={
        <Button
          appearance="transparent"
          icon={<MoreHorizontal20Regular />}
          aria-label="More options"
        />
      }
    />

        <Stack horizontal>
        <div style={rootStyle}>
          <VerticalBarChart
            chartTitle="Vertical bar chart axis tooltip example "
            data={points}
            height={700}
            width={300}
            hideLegend={true}
            hideTooltip={false}
            showXAxisLablesTooltip={true}
            wrapXAxisLables={true}
            enableReflow={true}
            barWidth={'auto'}
            maxBarWidth={700}
            xAxisInnerPadding={undefined}
            xAxisOuterPadding={undefined}
            enableGradient={true}
            roundCorners={false}
          />
        </div>
        </Stack>
  </Card>
          
    );
  };
  
  export default StoreOrdersGraph;