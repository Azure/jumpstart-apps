import { Stack } from "@fluentui/react";
import {
    makeStyles,
    Body1,
    Caption1,
    Button,
  } from "@fluentui/react-components";
import { ArrowReplyRegular, ShareRegular } from "@fluentui/react-icons";  
import SingleContainerBox from "../components/SingleContainerBox";
import DoubleContainerBox from "../components/DoubleContainerBox";
import {
    Card,
    CardFooter,
    CardHeader,
    CardPreview,
    Text,
  } from "@fluentui/react-components";

const useStyles = makeStyles({
    card: {
      margin: "auto",
      width: "350px",
      maxWidth: "100%",
      paddingLeft: "40px"
    },
    stack: {
        margin: "10px",
        gap: "10px"
      },    
  });

const Health = () => {
    const styles = useStyles();
    return (

        <Stack>
            <Stack.Item>
                <Stack horizontal className={styles.stack}>
                <Stack>
                        <DoubleContainerBox />
                </Stack>                               
                <Stack>
                    <SingleContainerBox />
                </Stack>                     
                <Stack>
                    <SingleContainerBox />
                </Stack>                     
                </Stack> 
            </Stack.Item>
        </Stack>
    );
  };
  
  export default Health;