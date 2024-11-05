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
      learnMore: {
          display: "flex",
          width: "299.069px",
          justifyContent: "space-between",
          alignItems: "flex-start",
          color: "#115EA3"
      },
      card: {
        width: "357px",
        maxWidth: "100%",
        height: "300px",
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
const OEEByProductBarGraph = () => {
    const classes  = useStyles();
    const points: IVerticalBarChartDataPoint[] = [
        {
          x: 'P1',
          y: 678,
          color: "#637CEF",
        },
        {
          x: 'P2',
          y: 750,
          color: "#637CEF",
        },
        {
          x: 'P3',
          y: 603,
          color: "#637CEF",
        },
        {
          x: 'P4',
          y: 678,
          color: "#637CEF",
        },
        {
          x: 'P5',
          y: 603,
          color: "#637CEF",
        },
        {
          x: 'P6',
          y: 908,
          color: "#637CEF",
        },
      ];  
    const rootStyle = {
        width: `300px`,
        height: `250px`,
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

<div style={{ display: 'flex' }}>
</div>
          <VerticalBarChart
            chartTitle="Vertical bar chart axis tooltip example "
            data={points}
            height={250}
            width={650}
            hideLegend={true}
            hideTooltip={false}
            showXAxisLablesTooltip={true}
            wrapXAxisLables={true}
            enableReflow={true}
            barWidth={16}
            maxBarWidth={20}
            xAxisInnerPadding={0.8}
            xAxisOuterPadding={0}
            enableGradient={true}
            roundCorners={false}
          />
          <Text className={classes.learnMore}>Learn more</Text>
  </Card>
          
    );
  };
  
  export default OEEByProductBarGraph;