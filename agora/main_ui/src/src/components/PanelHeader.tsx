import { ICommandBarItemProps, CommandBar, Stack } from "@fluentui/react";
import {
    Card,
    CardFooter,
    CardHeader,
    CardPreview,
    Text,
    makeStyles
  } from "@fluentui/react-components";

  const useStyles = makeStyles({
    stack: {
      margin: "auto",
      width: "350px",
      maxWidth: "100%",
      paddingLeft: "40px"
    },
  });  

const PanelHeader = () => {
  const styles = useStyles();
  return (
        <Stack className={styles.stack} horizontal>
            <Text>Inventory status</Text>
        </Stack>
        
  );
};

export default PanelHeader;