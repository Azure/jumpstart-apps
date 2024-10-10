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
const useStyles = makeStyles({
    main: {
        gap: "36px",
        display: "flex",
        flexDirection: "column",
        flexWrap: "wrap",
      },
      card: {
        width: "339px",
        maxWidth: "100%",
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

const OEEByProductsGraph = () => {
    const classes  = useStyles();
    const points: IChartDataPoint[] = [
      {
        legend: 'Sensor',
        data: 20,
        color: getColorFromToken(DataVizPalette.color9),
        gradient: getGradientFromToken(DataVizGradientPalette.gradient4),
        xAxisCalloutData: '2020/04/30',
        callOutAccessibilityData: { ariaLabel: 'Custom XVal Custom Legend 20000h' },
      },
      {
        legend: 'Device 1',
        data: 26,
        color: getColorFromToken(DataVizPalette.color10),
        gradient: getGradientFromToken(DataVizGradientPalette.gradient5),
        xAxisCalloutData: '2020/04/20',
        callOutAccessibilityData: { ariaLabel: 'Custom XVal Custom Legend 39000h' },
      },
      { legend: 'Device 2', data: 54, color: getColorFromToken(DataVizPalette.color3) },  
    ];    
    const data: IChartProps = {
      chartTitle: 'Donut chart custom callout example',
      chartData: points,
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
        <div style={{ display: 'flex' }}>
        </div>

        <DonutChart
          data={data}
          innerRadius={65}
          href={'https://developer.microsoft.com/en-us/'}
          legendsOverflowText={'overflow Items'}
          hideLegend={false}
          height={220}
          width={176}
          hideLabels={false}
          valueInsideDonut={1000}
          showLabelsInPercent={true}
          // eslint-disable-next-line react/jsx-no-bind
          onRenderCalloutPerDataPoint={(props?: IChartDataPoint) =>
            props ? (
              <ChartHoverCard
                XValue={'Custom XVal'}
                Legend={'Custom Legend'}
                YValue={`${props.yAxisCalloutData || props.data} h`}
                color={getColorFromToken(DataVizPalette.warning)}
              />
            ) : null
          }
        />
      </>

  </Card>
          
    );
  };
  
  export default OEEByProductsGraph;