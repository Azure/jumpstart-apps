import React, { useEffect, useState }  from 'react';
import { Stack } from "@fluentui/react";
import {
    makeStyles,
    Body1,
    Caption1,
    Button,
    Body2,
    tokens,
  } from "@fluentui/react-components";
import { ArrowReplyRegular, ShareRegular } from "@fluentui/react-icons";  
import {
    Card,
    CardFooter,
    CardHeader,
    CardPreview,
    Text,
  } from "@fluentui/react-components";

  const resolveAsset = (asset: string) => {
    const ASSET_URL =
      "https://raw.githubusercontent.com/microsoft/fluentui/master/packages/react-components/react-card/stories/src/assets/";
  
    return `${ASSET_URL}${asset}`;
  };


const useStyles = makeStyles({
    card: {
      margin: "auto",
      width: "471px",
      maxWidth: "100%",
      padding: " 10px 16px 20px 16px",
      borderRadius: "8px",
      background: "var(--Surfaces-Surface, #FFF)",
      marginRight: "8px"
    },
    headerText: {
        width: "63.927px",
        flexShrink: "0",
        color: "#242424",
        fontFamily: "Segoe UI",
        fontSize: "11.794px",
        fontStyle: "normal",
        fontWeight: "600",
        lineHeight: "16.849px", /* 142.857% */
    },
    mainTextContainer: {
        display: "flex",
        padding: "0px 13.479px",
        alignItems: "center",
        alignSelf: "stretch",
        borderRadius: "1.685px",
        marginBottom: "16.85px"
    },
    learnMore: {
        display: "flex",
        width: "299.069px",
        padding: "var(--card-Gap, 12px) var(--card-Horizontal, 12px) var(--card-Vertical, 12px) var(--card-Horizontal, 12px)",
        justifyContent: "space-between",
        alignItems: "flex-start",
        color: "#115EA3"
    },
    iconContainer: {
        display: "flex",
        width: "20.219px",
        height: "18.534px",
        padding: "1.685px",
        justifyContent: "center",
        alignItems: "center",
    },
    singlecard: {
        margin: "auto",
        width: "220px",
        maxWidth: "100%",
        padding: " 10px 16px 20px 16px",
        borderRadius: "8px",
        background: "var(--Surfaces-Surface, #FFF)",
        marginRight: "8px",
        height: "127px"
      },
    cardDividerContainer : {
        display: "flex",
        padding: "0px 12px 0px 41px",
        alignItems: "center",
        gap: "12px",        
        width: "82px",
        height: "80px",
        justifyContent: "center"
    },
    cardDivider : {
        width: "1px",
        height: "60px",
        background: "#A19F9D",
        alignContent: "center"
    },
    cardpreviewtext: {
        color: "var(--Text-Primary, #000000)",
        textAlign: "center",
        fontFeaturesettings: "'liga' off, 'clig' off",
        fontFamily: "Segoe UI",
        fontSize: "20.219px",
        fontStyle: "normal",
        fontWeight: "600",
        lineHeight: "26.958px",
        marginLeft: "6.74px"
    },
    cardpreviewsubtext: {
        color: "var(--Text-Primary, #323130)",
        textAlign: "center",
        fontFamily: "Segoe UI",
        fontSize: "14px",
        fontStyle: "normal",
        fontWeight: "400",
        lineHeight: "20px",
        marginLeft: "16px",
        width: "145px"
    },
    last24Hours: {
        color: "var(--Text-Primary, #616161)",
        textAlign: "left",
        fontFamily: "Segoe UI",
        fontSize: "10.109px",
        fontStyle: "normal",
        fontWeight: "400",
        lineHeight: "1.479px",
    },
    cardpreviewsubtextextended: {
        color: "var(--Text-Primary, #323130)",
        textAlign: "center",
        fontFamily: "Segoe UI",
        fontSize: "14px",
        fontStyle: "normal",
        fontWeight: "400",
        lineHeight: "20px",
        marginLeft: "16px",
        width: "175px"        ,
    },
    cabBar:{
        width: "3.37px",
        height: "20.219px",
    }

  });

const MaintenanceCards = () => {
    const styles = useStyles();
    var cerebralSimulatorAPI = process.env.REACT_APP_SIMULATOR_API_URL || "/DataSimulator";
    type AutomatedCheckoutsOpen = {
        avg_wait_time: number;
        closed_automated_checkouts: number;
        open_automated_checkouts: number;
        queue_length: number;
        total_checkouts: number;
      };    
      const automatedCheckoutsOpenItems: AutomatedCheckoutsOpen[] = [
      ];
      const [automatedCheckoutsOpen, setAutomatedCheckoutsOpenData] = useState();      
      useEffect(() => {
        var automatedCheckoutsOpenURL = cerebralSimulatorAPI + "/api/v1/automated_checkouts/open";
        fetch(automatedCheckoutsOpenURL)
        .then(response => response.json())
        .then(json => setAutomatedCheckoutsOpenData(json))
        .then()
        .catch(error => console.error(error));
        }, []);         
        if(automatedCheckoutsOpen) {
            console.log('automatedCheckoutsOpen');
            console.log(automatedCheckoutsOpen);
        }
    return (

        <Stack horizontalAlign="start" grow={1}>
            <Stack.Item align="start" grow={3}>
                <Stack horizontal>     
                <Card id="overallEquipment" className={styles.card} style={{width: '312px'}}>
                    <CardHeader
                        header={
                        <Body1>
                            <Stack horizontal>
                                <Text id="headerText" className={styles.headerText} style={{width: "207px"}}>Overall Equipment Effectiveness (OEE)</Text>
                                <div id="iconContainer"  className={styles.iconContainer}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="14" viewBox="0 0 15 14" fill="none">
                                        <path d="M7.98586 6.67877C7.98586 6.44613 7.79728 6.25755 7.56464 6.25755C7.33201 6.25755 7.14342 6.44613 7.14342 6.67877V9.20611C7.14342 9.43875 7.33201 9.62733 7.56464 9.62733C7.79728 9.62733 7.98586 9.43875 7.98586 9.20611V6.67877ZM8.19567 4.9939C8.19567 5.34241 7.91315 5.62492 7.56465 5.62492C7.21615 5.62492 6.93363 5.34241 6.93363 4.9939C6.93363 4.6454 7.21615 4.36288 7.56465 4.36288C7.91315 4.36288 8.19567 4.6454 8.19567 4.9939ZM7.56546 1.20288C4.30857 1.20288 1.66833 3.84312 1.66833 7.10001C1.66833 10.3569 4.30857 12.9971 7.56546 12.9971C10.8224 12.9971 13.4626 10.3569 13.4626 7.10001C13.4626 3.84312 10.8224 1.20288 7.56546 1.20288ZM2.51078 7.10001C2.51078 4.30839 4.77384 2.04533 7.56546 2.04533C10.3571 2.04533 12.6201 4.30839 12.6201 7.10001C12.6201 9.89163 10.3571 12.1547 7.56546 12.1547C4.77384 12.1547 2.51078 9.89163 2.51078 7.10001Z" fill="#424242"/>
                                    </svg>
                                </div>
                            </Stack>
                        </Body1>
                        }
                        description={<Caption1 className={styles.last24Hours}>Last 24 hours</Caption1>}
                    />
                    <CardPreview>
                        <Stack>
                            <Stack horizontal>
                                <Stack>
                                    <Stack horizontal className={styles.mainTextContainer}>
                                        <div className={styles.cabBar}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="4" height="21" viewBox="0 0 4 21" fill="none">
                                            <rect x="0.437622" y="0.312256" width="3.36979" height="20.2187" fill="#0E700E"/>
                                        </svg>
                                        </div>
                                        <Text className={styles.cardpreviewtext}>93%</Text>
                                    </Stack>
                                {/* <Text className={styles.learnMore}>Learn more</Text> */}
                                </Stack>
                            </Stack>
                        </Stack>
                    </CardPreview>
                </Card>                     
                <Card id="performance" className={styles.card} style={{width: '312px'}}>
                    <CardHeader
                        header={
                        <Body1>
                            <Stack horizontal>
                                <Text id="headerText" className={styles.headerText} style={{width: "70px"}}>Performance</Text>
                                <div id="iconContainer"  className={styles.iconContainer}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="14" viewBox="0 0 15 14" fill="none">
                                        <path d="M7.98586 6.67877C7.98586 6.44613 7.79728 6.25755 7.56464 6.25755C7.33201 6.25755 7.14342 6.44613 7.14342 6.67877V9.20611C7.14342 9.43875 7.33201 9.62733 7.56464 9.62733C7.79728 9.62733 7.98586 9.43875 7.98586 9.20611V6.67877ZM8.19567 4.9939C8.19567 5.34241 7.91315 5.62492 7.56465 5.62492C7.21615 5.62492 6.93363 5.34241 6.93363 4.9939C6.93363 4.6454 7.21615 4.36288 7.56465 4.36288C7.91315 4.36288 8.19567 4.6454 8.19567 4.9939ZM7.56546 1.20288C4.30857 1.20288 1.66833 3.84312 1.66833 7.10001C1.66833 10.3569 4.30857 12.9971 7.56546 12.9971C10.8224 12.9971 13.4626 10.3569 13.4626 7.10001C13.4626 3.84312 10.8224 1.20288 7.56546 1.20288ZM2.51078 7.10001C2.51078 4.30839 4.77384 2.04533 7.56546 2.04533C10.3571 2.04533 12.6201 4.30839 12.6201 7.10001C12.6201 9.89163 10.3571 12.1547 7.56546 12.1547C4.77384 12.1547 2.51078 9.89163 2.51078 7.10001Z" fill="#424242"/>
                                    </svg>
                                </div>
                            </Stack>
                        </Body1>
                        }
                        description={<Caption1 className={styles.last24Hours}>Last 24 hours</Caption1>}
                    />
                    <CardPreview>
                        <Stack>
                            <Stack horizontal>
                                <Stack>
                                    <Stack horizontal className={styles.mainTextContainer}>
                                        <div className={styles.cabBar}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="4" height="21" viewBox="0 0 4 21" fill="none">
                                            <rect x="0.437622" y="0.312256" width="3.36979" height="20.2187" fill="#0E700E"/>
                                        </svg>
                                        </div>
                                        <Text className={styles.cardpreviewtext}>93%</Text>
                                    </Stack>
                                {/* <Text className={styles.learnMore}>Learn more</Text> */}
                                </Stack>
                            </Stack>
                        </Stack>
                    </CardPreview>
                </Card>                  
                <Card id="availability" className={styles.card} style={{width: '312px'}}>
                    <CardHeader
                        header={
                        <Body1>
                            <Stack horizontal>
                                <Text id="headerText" className={styles.headerText}>Availability</Text>
                                <div id="iconContainer"  className={styles.iconContainer}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="14" viewBox="0 0 15 14" fill="none">
                                        <path d="M7.98586 6.67877C7.98586 6.44613 7.79728 6.25755 7.56464 6.25755C7.33201 6.25755 7.14342 6.44613 7.14342 6.67877V9.20611C7.14342 9.43875 7.33201 9.62733 7.56464 9.62733C7.79728 9.62733 7.98586 9.43875 7.98586 9.20611V6.67877ZM8.19567 4.9939C8.19567 5.34241 7.91315 5.62492 7.56465 5.62492C7.21615 5.62492 6.93363 5.34241 6.93363 4.9939C6.93363 4.6454 7.21615 4.36288 7.56465 4.36288C7.91315 4.36288 8.19567 4.6454 8.19567 4.9939ZM7.56546 1.20288C4.30857 1.20288 1.66833 3.84312 1.66833 7.10001C1.66833 10.3569 4.30857 12.9971 7.56546 12.9971C10.8224 12.9971 13.4626 10.3569 13.4626 7.10001C13.4626 3.84312 10.8224 1.20288 7.56546 1.20288ZM2.51078 7.10001C2.51078 4.30839 4.77384 2.04533 7.56546 2.04533C10.3571 2.04533 12.6201 4.30839 12.6201 7.10001C12.6201 9.89163 10.3571 12.1547 7.56546 12.1547C4.77384 12.1547 2.51078 9.89163 2.51078 7.10001Z" fill="#424242"/>
                                    </svg>
                                </div>
                            </Stack>
                        </Body1>
                        }
                        description={<Caption1 className={styles.last24Hours}>Last 24 hours</Caption1>}
                    />
                    <CardPreview>
                        <Stack>
                            <Stack horizontal>
                                <Stack>
                                    <Stack horizontal className={styles.mainTextContainer}>
                                        <div className={styles.cabBar}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="4" height="21" viewBox="0 0 4 21" fill="none">
                                            <rect x="0.437622" y="0.312256" width="3.36979" height="20.2187" fill="#C50F1F"/>
                                        </svg>
                                        </div>
                                        <Text className={styles.cardpreviewtext}>97%</Text>
                                    </Stack>
                                {/* <Text className={styles.learnMore}>Learn more</Text> */}
                                </Stack>
                            </Stack>
                        </Stack>
                    </CardPreview>
                </Card>                    
                <Card id="defectRate" className={styles.card} style={{width: '312px'}}>
                    <CardHeader
                        header={
                        <Body1>
                            <Stack horizontal>
                                <Text id="headerText" className={styles.headerText}>Defect rate</Text>
                                <div id="iconContainer"  className={styles.iconContainer}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="14" viewBox="0 0 15 14" fill="none">
                                        <path d="M7.98586 6.67877C7.98586 6.44613 7.79728 6.25755 7.56464 6.25755C7.33201 6.25755 7.14342 6.44613 7.14342 6.67877V9.20611C7.14342 9.43875 7.33201 9.62733 7.56464 9.62733C7.79728 9.62733 7.98586 9.43875 7.98586 9.20611V6.67877ZM8.19567 4.9939C8.19567 5.34241 7.91315 5.62492 7.56465 5.62492C7.21615 5.62492 6.93363 5.34241 6.93363 4.9939C6.93363 4.6454 7.21615 4.36288 7.56465 4.36288C7.91315 4.36288 8.19567 4.6454 8.19567 4.9939ZM7.56546 1.20288C4.30857 1.20288 1.66833 3.84312 1.66833 7.10001C1.66833 10.3569 4.30857 12.9971 7.56546 12.9971C10.8224 12.9971 13.4626 10.3569 13.4626 7.10001C13.4626 3.84312 10.8224 1.20288 7.56546 1.20288ZM2.51078 7.10001C2.51078 4.30839 4.77384 2.04533 7.56546 2.04533C10.3571 2.04533 12.6201 4.30839 12.6201 7.10001C12.6201 9.89163 10.3571 12.1547 7.56546 12.1547C4.77384 12.1547 2.51078 9.89163 2.51078 7.10001Z" fill="#424242"/>
                                    </svg>
                                </div>
                            </Stack>
                        </Body1>
                        }
                        description={<Caption1 className={styles.last24Hours}>Last 24 hours</Caption1>}
                    />
                    <CardPreview>
                        <Stack>
                            <Stack horizontal>
                                <Stack>
                                    <Stack horizontal className={styles.mainTextContainer}>
                                        <div className={styles.cabBar}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="4" height="21" viewBox="0 0 4 21" fill="none">
                                            <rect x="0.437622" y="0.312256" width="3.36979" height="20.2187" fill="#0E700E"/>
                                        </svg>
                                        </div>
                                        <Text className={styles.cardpreviewtext}>30%</Text>
                                    </Stack>
                                {/* <Text className={styles.learnMore}>Learn more</Text> */}
                                </Stack>
                            </Stack>
                        </Stack>
                    </CardPreview>
                </Card>                                     
                </Stack> 
            </Stack.Item>
        </Stack>
    );
  };
  
  export default MaintenanceCards;