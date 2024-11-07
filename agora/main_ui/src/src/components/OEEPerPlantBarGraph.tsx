import * as React from "react";
import { MoreHorizontal20Regular } from "@fluentui/react-icons";
import {
    ChartHoverCard,
    VerticalStackedBarChart,
    VerticalBarChart,
    IDonutChartProps,
    IChartProps,
    IChartDataPoint,
    IVSChartDataPoint,
    IVerticalBarChartDataPoint,
    IVerticalStackedChartProps,
    IVerticalStackedBarChartProps,
    DataVizPalette,
    getColorFromToken,
    getGradientFromToken,
    DataVizGradientPalette,
  } from '@fluentui/react-charting';
  import { DefaultPalette, IStyle, DefaultFontStyles } from '@fluentui/react/lib/Styling';
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

interface IVerticalStackedBarState {
    width: number;
    height: number;
    barGapMax: number;
    barCornerRadius: number;
    barMinimumHeight: number;
    selectedCallout: string;
  }
  
const OEEPerPlantBarGraph = () => {
    // state = {
    //     width: 650,
    //     height: 350,
    //     barGapMax: 2,
    //     barCornerRadius: 2,
    //     barMinimumHeight: 1,
    //     selectedCallout: 'MultiCallout',
    //   };
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
      const firstChartPoints: IVSChartDataPoint[] = [
        { legend: 'E1', data: 20, color: "#637CEF" },
        { legend: 'E2', data: 25, color: "#E3008C" },
        { legend: 'E3', data: 10, color: "#2AA0A4" },
      ];
  
      const secondChartPoints: IVSChartDataPoint[] = [
        { legend: 'E1', data: 30, color: "#637CEF" },
        { legend: 'E2', data: 3, color: "#E3008C" },
        { legend: 'E3', data: 40, color: "#2AA0A4" },
      ];
  
      const thirdChartPoints: IVSChartDataPoint[] = [
        { legend: 'E1', data: 10, color: "#637CEF" },
        { legend: 'E2', data: 60, color: "#E3008C" },
        { legend: 'E3', data: 30, color: "#2AA0A4" },
      ];
  
      const data: IVerticalStackedChartProps[] = [
        {
          chartData: firstChartPoints,
          xAxisPoint: 'A1',
        },
        {
          chartData: secondChartPoints,
          xAxisPoint: 'A2',
        },
        {
          chartData: thirdChartPoints,
          xAxisPoint: 'A3',
        },
        {
          chartData: firstChartPoints,
          xAxisPoint: 'A4',
        },
        {
          chartData: thirdChartPoints,
          xAxisPoint: 'A5',
        },
        {
          chartData: firstChartPoints,
          xAxisPoint: 'A6',
        },
        {
          chartData: secondChartPoints,
          xAxisPoint: 'A7',
        },
      ];   
      const rootStyle = { width: `200px`, height: `200px` };

      const textStyle: IStyle = {
        fill: DefaultPalette.black,
        fontSize: '10px',
        lineHeight: '14px',
      };
      const timeFormat = '%m/%d';
      const newTickVaules: string[] = [
        "A1",
        "A2",
        "A3",
        "A4",
        "A5",
        "A6",
        "A7",
      ];   
    return (
      <Card className={classes.card}>
    <CardHeader
      header={<Text className={classes.ContainerBoxHeading}>OEE per plant</Text>}
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

<>
        <div style={{ display: 'flex' }}>
        </div>
        <VerticalStackedBarChart
            chartTitle="Vertical stacked bar chart axis tooltip example"
            data={data}
            height={250}
            width={650}
            wrapXAxisLables={false}
            enableReflow={true}
            barWidth={16}
            maxBarWidth={20}
            xAxisInnerPadding={0.10}
            xAxisOuterPadding={0}
            enableGradient={false}
            roundCorners={false}
          />
      </>
        <Text className={classes.learnMore}>Learn more</Text>
  </Card>
          
    );
  };
  
  export default OEEPerPlantBarGraph;