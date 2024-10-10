import * as React from "react";
import { MoreHorizontal20Regular } from "@fluentui/react-icons";
import {
    ChartHoverCard,
    DonutChart,
    IDonutChartProps,
    IChartProps,
    IChartDataPoint,
    DataVizPalette,
    getColorFromToken,
    getGradientFromToken,
    DataVizGradientPalette,
    ILineChartPoints,
    ILineChartProps,
    LineChart,
    ICustomizedCalloutData,
  } from '@fluentui/react-charting';
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

interface ILineChartBasicState {
    width: number;
    height: number;
    allowMultipleShapes: boolean;
    showAxisTitles: boolean;
    useUTC: boolean;
  }
const ProductInventoryGraph = () => {
    const classes  = useStyles();
    const points: ILineChartPoints[] = [
        {
          data: [
            { x: new Date('2018/01/06'), y: 10, xAxisCalloutData: 'Appointment 1' },
            { x: new Date('2018/01/16'), y: 18, xAxisCalloutData: 'Appointment 2' },
            { x: new Date('2018/01/20'), y: 24, xAxisCalloutData: 'Appointment 3' },
            { x: new Date('2018/01/24'), y: 35, xAxisCalloutData: 'Appointment 4' },
            { x: new Date('2018/01/26'), y: 35, xAxisCalloutData: 'Appointment 5' },
            { x: new Date('2018/01/29'), y: 90, xAxisCalloutData: 'Appointment 6' },
          ],
          legend: 'first legend',
          lineOptions: {
            lineBorderWidth: '4',
          },
          color: DataVizPalette.color10,
        },
      ]; 
      const data: IChartProps = {
        chartTitle: 'Line Chart',
        lineChartData: [
          {
            legend: 'From_Legacy_to_O365',
            data: [
              {
                x: new Date('2020-03-03T00:00:00.000Z'),
                y: 216000,
                onDataPointClick: () => alert('click on 217000'),
              },
              {
                x: new Date('2020-03-03T10:00:00.000Z'),
                y: 218123,
                onDataPointClick: () => alert('click on 217123'),
              },
              {
                x: new Date('2020-03-03T11:00:00.000Z'),
                y: 217124,
                onDataPointClick: () => alert('click on 217124'),
              },
              {
                x: new Date('2020-03-04T00:00:00.000Z'),
                y: 248000,
                onDataPointClick: () => alert('click on 248000'),
              },
              {
                x: new Date('2020-03-05T00:00:00.000Z'),
                y: 252000,
                onDataPointClick: () => alert('click on 252000'),
              },
              {
                x: new Date('2020-03-06T00:00:00.000Z'),
                y: 274000,
                onDataPointClick: () => alert('click on 274000'),
              },
              {
                x: new Date('2020-03-07T00:00:00.000Z'),
                y: 260000,
                onDataPointClick: () => alert('click on 260000'),
              },
              {
                x: new Date('2020-03-08T00:00:00.000Z'),
                y: 304000,
                onDataPointClick: () => alert('click on 300000'),
              },
              {
                x: new Date('2020-03-09T00:00:00.000Z'),
                y: 218000,
                onDataPointClick: () => alert('click on 218000'),
              },
            ],
            color: DataVizPalette.color3,
            lineOptions: {
              lineBorderWidth: '4',
            },
            onLineClick: () => console.log('From_Legacy_to_O365'),
          },
          {
            legend: 'All',
            data: [
              {
                x: new Date('2020-03-03T00:00:00.000Z'),
                y: 297000,
              },
              {
                x: new Date('2020-03-04T00:00:00.000Z'),
                y: 284000,
              },
              {
                x: new Date('2020-03-05T00:00:00.000Z'),
                y: 282000,
              },
              {
                x: new Date('2020-03-06T00:00:00.000Z'),
                y: 294000,
              },
              {
                x: new Date('2020-03-07T00:00:00.000Z'),
                y: 224000,
              },
              {
                x: new Date('2020-03-08T00:00:00.000Z'),
                y: 300000,
              },
              {
                x: new Date('2020-03-09T00:00:00.000Z'),
                y: 298000,
              },
            ],
            color: DataVizPalette.color4,
            lineOptions: {
              lineBorderWidth: '4',
            },
          },
          {
            legend: 'single point',
            data: [
              {
                x: new Date('2020-03-05T12:00:00.000Z'),
                y: 232000,
              },
            ],
            color: DataVizPalette.color5,
          },
        ],
      };   
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

<>
<div style={rootStyle}>
          <LineChart
            // Force rerender when any of the following states change
            key={`${true}`}
            culture={window.navigator.language}
            data={data}
            legendsOverflowText={'Overflow Items'}
            yMinValue={200}
            yMaxValue={301}
            height={300}
            width={700}
            xAxisTickCount={10}
            allowMultipleShapesForPoints={true}
            enablePerfOptimization={true}
            yAxisTitle='Different categories of mail flow'
            xAxisTitle='Values of each category'
            useUTC={true}
          />
        </div>
      </>

  </Card>
          
    );
  };
  
  export default ProductInventoryGraph;