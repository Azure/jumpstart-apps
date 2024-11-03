import { Stack } from "@fluentui/react";
import {
    makeStyles,
    Body1,
    Caption1,
    Button,
  } from "@fluentui/react-components";
import { ArrowReplyRegular, ShareRegular } from "@fluentui/react-icons";  
import {
    Card,
    CardFooter,
    CardHeader,
    CardPreview,
    Text,
  } from "@fluentui/react-components";
  import { DeviceStatusGrid as DataGrid } from "./DeviceStatusGrid";  
import PanelHeader from "./PanelHeader";

  const resolveAsset = (asset: string) => {
    const ASSET_URL =
      "https://raw.githubusercontent.com/microsoft/fluentui/master/packages/react-components/react-card/stories/src/assets/";
  
    return `${ASSET_URL}${asset}`;
  };


const useStyles = makeStyles({
    card: {
      margin: "auto",
      width: "350px",
      maxWidth: "100%",
      paddingLeft: "40px"
    },
    stack: {
        marginLeft: "30px;"
    }
  });

const DeviceStatus = () => {
    const styles = useStyles();
    return (
        <Stack className={styles.stack}>
            <DataGrid />
        </Stack> 
    );
  };
  
  export default DeviceStatus;