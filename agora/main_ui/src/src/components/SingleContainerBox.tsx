import * as React from "react";
import { ICommandBarItemProps, CommandBar, Stack } from "@fluentui/react";
import PersonaImage from '../assets/PersonaAsh.png'; 
import { Persona } from "@fluentui/react-components";
import { DismissRegular } from "@fluentui/react-icons";
import type { PersonaProps } from "@fluentui/react-components";
import logo from '../logo.svg';
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
  import { MoreHorizontal20Regular } from "@fluentui/react-icons";

  const resolveAsset = (asset: string) => {
    const ASSET_URL =
      "https://raw.githubusercontent.com/microsoft/fluentui/master/packages/react-components/react-card/stories/src/assets/";
  
    return `${ASSET_URL}${asset}`;
  };

  const useStyles = makeStyles({
    main: {
        gap: "36px",
        display: "flex",
        flexDirection: "column",
        flexWrap: "wrap",
      },
    
      card: {
        width: "360px",
        maxWidth: "100%",
        height: "fit-content",
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
        "background-color": "#f0f0f0"
    },
    bottomdiv: {
      "flex": "1",
      "display": "flex",
      "justify-content": "center",
      "align-items": "center",      
        "background-color": "#e0e0e0"
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
      caption: {
        color: tokens.colorNeutralForeground3,
      },
    
      text: { margin: "0" },          
  });  
  const Title = ({ children }: React.PropsWithChildren<{}>) => {
    const styles = useStyles();
  
    return (
      <Subtitle1 as="h4" block className={styles.title}>
        {children}
      </Subtitle1>
    );
  };

const SingleContainerBox = () => {
  const classes  = useStyles();
  const [compact, setCompact] = React.useState(true);
  return (

    <Card className={classes.card}>
    <CardHeader
      image={
        <img
          className={classes.headerImage}
          src={"Temperature.svg"}
          alt="Fridge Abc 123"
        />
      }
      header={<Text weight="semibold">Fridge Abc 123</Text>}
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
    <div className={classes.container}>
        <div className={classes.topdiv}>
            <p className={classes.ContainerBoxMainTitle}>-18 (0c)</p>
        </div>
        <div className={classes.bottomdiv}>
            <p className={classes.ContainerBoxSubTitle}>Avg. freezer temp</p>
        </div>
    </div>

    <p className={classes.text}>
      Donut chocolate bar oat cake. Dragée tiramisu lollipop bear claw.
      Marshmallow pastry jujubes toffee sugar plum.
    </p>
  </Card>
        
  );
};

export default SingleContainerBox;