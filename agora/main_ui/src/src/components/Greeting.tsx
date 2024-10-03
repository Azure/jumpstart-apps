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
  } from "@fluentui/react-components";

  const resolveAsset = (asset: string) => {
    const ASSET_URL =
      "https://raw.githubusercontent.com/microsoft/fluentui/master/packages/react-components/react-card/stories/src/assets/";
  
    return `${ASSET_URL}${asset}`;
  };

  const useStyles = makeStyles({
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
    }      
  });  

const Greeting = () => {
  const styles = useStyles();
  const [compact, setCompact] = React.useState(true);
  return (
        <Stack className={styles.stack} horizontal horizontalAlign="start">
            <Stack horizontal horizontalAlign="start">
            <Persona
                primaryText="Good afternoon"
                secondaryText="Ash"
                size="huge"
                avatar={{
                    image: {
                    src: "PersonaAsh.png",
                    },
                }}
                />                
            </Stack>
        </Stack>
        
  );
};

export default Greeting;