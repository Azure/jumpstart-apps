import * as React from "react";
import { ICommandBarItemProps, CommandBar, Stack } from "@fluentui/react";
import PersonaImage from '../assets/Persona.png'; 
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

const Greetings = () => {
  const styles = useStyles();
  const [compact, setCompact] = React.useState(true);
  return (
        <Stack className={styles.stack} horizontal horizontalAlign="start">
            <Stack horizontal horizontalAlign="start">
            <img src={PersonaImage} alt="" />
            <Persona
                name="Good Morning"
                secondaryText="Lisa"
                presence={{ status: "available" }}
                avatar={{
                    image: {
                    src: "../assets/Persona.png",
                    },
                }}
                />                
            </Stack>
            <Stack>
                <div>
            <MessageBar intent="info" layout="auto" shape="rounded" className={styles.messageBarStyle}>
          <MessageBarBody>
            <MessageBarTitle>Inventory insights</MessageBarTitle>
            A big event coming..{" "}
            
          </MessageBarBody>
          <MessageBarActions
            containerAction={
              <Button
                aria-label="dismiss"
                appearance="transparent"
                icon={<DismissRegular />}
              />
            }
          >
            <Button>View report</Button>
            <Button>Draft oder</Button>
          </MessageBarActions>
        </MessageBar>             
                </div>
            </Stack>
            <Stack>
            <div>
            <MessageBar intent="info" layout="auto" shape="rounded" className={styles.messageBarStyle}>
          <MessageBarBody>
            <MessageBarTitle>Product placement</MessageBarTitle>
            Ensure your popular ..{" "}
            
          </MessageBarBody>
          <MessageBarActions
            containerAction={
              <Button
                aria-label="dismiss"
                appearance="transparent"
                icon={<DismissRegular />}
              />
            }
          >
            <Button>Action</Button>
            <Button>Action</Button>
          </MessageBarActions>
        </MessageBar>             
                </div>                
            </Stack>
            <Stack>
            <div>
            <MessageBar intent="info" layout="auto" shape="rounded" className={styles.messageBarStyle}>
          <MessageBarBody>
            <MessageBarTitle>Footfall prediction available</MessageBarTitle>
            Based on historical..{" "}
            
          </MessageBarBody>
          <MessageBarActions
            containerAction={
              <Button
                aria-label="dismiss"
                appearance="transparent"
                icon={<DismissRegular />}
              />
            }
          >
            <Button>Action</Button>
            <Button>Action</Button>
          </MessageBarActions>
        </MessageBar>             
                </div>                
            </Stack>

        </Stack>
        
  );
};

export default Greetings;