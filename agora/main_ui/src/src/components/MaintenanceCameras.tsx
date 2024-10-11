import { Dropdown, SearchBox, Stack } from "@fluentui/react";
import cameraimage1 from '../assets/cameraimage1.png'; 
import cameraimage2 from '../assets/cameraimage2.png'; 
import {
    makeStyles,
    Body1,
    Caption1,
    Button,
    Divider,
  } from "@fluentui/react-components";
import { ArrowReplyRegular, ShareRegular } from "@fluentui/react-icons";  
import {
    Card,
    CardFooter,
    CardHeader,
    CardPreview,
    Text,
  } from "@fluentui/react-components";
  
  const useStyles = makeStyles({
    cardContainer: {
      margin: "auto",
      width: "572px",
      maxWidth: "100%",
    },
    searchbox: {
        width: "468px",
        height: "24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        borderRadius: "var(--Medium, 4px)",
        border: "1px solid NeutralStroke1.Rest",
        background: "NeutralBackground1.Rest",        
    },
    searchboxcontainer: {
        display: "flex",
        width: "100%",
        height: "40px",
        gap: "170px",
        flexShrink: "0",
        borderRadius: "Global.Corner.Radius.40",
        border: "1px solid TransparentStroke.Rest",
        background: "Global.Color.Grey.94",
        padding: "0px 6px",
        alignItems: "right",
        marginRight: "96px",
        marginLeft: "649px",
    },
    addcamerabutton: {
        width: "123px",
        height: "32px",
        padding: "12px 6px",
        borderRadius: "4px",
        background: "SubtleBackground.Rest",
        color: "NeutralForeground2.Rest",
        fontFamily: "var(--Font-family-Base, \"Segoe UI\")",
        fontSize: "var(--Font-size-300, 14px)",
        fontStyle: "normal",
        fontWeight: "600",
        lineHeight: "var(--Line-height-300, 20px)", /* 142.857% */        
    },
    addcameracontainer: {
        display: "flex",
        padding: "6px 12px",
        justifyContent: "center",
        alignItems: "center",
        gap: "6px",
        borderRadius: "4px",
        background: "SubtleBackground.Rest",
    },
    card: {
        margin: "auto",
        width: "268px",
        maxWidth: "100%",
        paddingLeft: "40px"
      },
    text: {
        paddingTop: "30px",
    }
    ,
    textRightAlign: {
        textAlign: "right",
    }
  });
  const MaintenanceCameras = () => {
    const classes = useStyles();
    return (
        <Stack>
            <Stack.Item align="start" grow={3}>
                <Stack id='camerasheader' horizontal style={{width: "100%"}}>
                    <Stack horizontal tokens={{childrenGap: 'm'}}>
                        <Dropdown placeholder="Sorty by" options={[
                            { key: 'option1', text: 'Option 1' },
                            { key: 'option2', text: 'Option 2' },
                            { key: 'option3', text: 'Option 3' },
                        ]} /> 
                        <div className={classes.addcameracontainer}>
                        <Button appearance="primary" className={classes.addcamerabutton}>+ Add Camera</Button>
                        </div>
                    </Stack>
                    <Stack className={classes.searchboxcontainer}>
                    <SearchBox placeholder="Search" className={classes.searchbox} />
                    </Stack>
                </Stack> 
            </Stack.Item>
            <Stack.Item id='camerascollection'>
                <Stack horizontal>

                <Card className={classes.card}>
                    <CardPreview>
                        <img src={cameraimage1} alt="" />
                    </CardPreview>
                    <CardFooter>
                        <Stack>
                        <Text><b>Camera title</b></Text>
                        <Text>Zone label</Text>
                        <Text className={classes.text}>Status: Active</Text>
                        <Text>People count: 10</Text>
                        </Stack>
                    </CardFooter>
                </Card>
                <Card className={classes.card}>
                    <CardPreview>
                        <img src={cameraimage2} alt="" />
                    </CardPreview>
                    <CardFooter>
                        <Stack>
                        <Text><b>Camera title</b></Text>
                        <Text>Zone label</Text>
                        <Text className={classes.text}>Status: Active</Text>
                        <Text>People count: 10</Text>
                        </Stack>
                    </CardFooter>
                </Card>

                </Stack>
                <Stack horizontal>

                <Card className={classes.card}>
                    <CardPreview>
                        <img src={cameraimage1} alt="" />
                    </CardPreview>
                    <CardFooter>
                        <Stack>
                        <Text><b>Camera title</b></Text>
                        <Text>Zone label</Text>
                        <Text className={classes.text}>Status: Active</Text>
                        <Text>People count: 10</Text>
                        </Stack>
                    </CardFooter>
                </Card>
                <Card className={classes.card}>
                    <CardPreview>
                        <img src={cameraimage2} alt="" />
                    </CardPreview>
                    <CardFooter>
                        <Stack>
                        <Text><b>Camera title</b></Text>
                        <Text>Zone label</Text>
                        <Text className={classes.text}>Status: Active</Text>
                        <Text>People count: 10</Text>
                        </Stack>
                    </CardFooter>
                </Card>

                </Stack>
            </Stack.Item>
        </Stack>
    );
  };
  
  export default MaintenanceCameras;