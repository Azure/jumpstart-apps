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
        color: "var(--Text-Primary, #323130)",
        textAlign: "center",
        fontFeaturesettings: "'liga' off, 'clig' off",
        fontFamily: "Segoe UI",
        fontSize: "36px",
        fontStyle: "normal",
        fontWeight: "400",
        lineHeight: "52px",
        marginLeft: "16px"
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
    cardpreviewsubtextextended: {
        color: "var(--Text-Primary, #323130)",
        textAlign: "center",
        fontFamily: "Segoe UI",
        fontSize: "14px",
        fontStyle: "normal",
        fontWeight: "400",
        lineHeight: "20px",
        marginLeft: "16px",
        width: "175px"        
    }

  });

const Cards = () => {
    const styles = useStyles();
    var cerebralSimulatorAPI = process.env.REACT_APP_CEREBRAL_SIMULATOR_API_URL || "/CerebralSimulator";
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
                <Card className={styles.card}>
                    <CardHeader
                        image={
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M6.99508 2.41326C6.94517 2.14166 6.68399 1.95884 6.41172 2.00491C6.13945 2.05097 5.95919 2.30849 6.00909 2.58009L6.01904 2.63273C4.29044 3.20531 3.27054 4.12182 2.6923 5.14568C2.12734 6.14604 2.01471 7.19621 2.00156 8.00009H2.00013V8.00479L1.33048 8.84238C0.783964 9.52596 0.936325 10.5303 1.66099 11.0211L10.3158 16.8821C11.3916 17.6107 12.6611 18.0001 13.9605 18.0001H16.7501C17.9928 18.0001 19.0001 16.9927 19.0001 15.7501C19.0001 14.4891 17.9756 13.5716 16.9304 13.24C16.3211 13.0467 15.7508 12.7314 15.4157 12.2352L12.3993 7.04431C12.4616 7.0358 12.524 7.02627 12.5864 7.01571C12.8587 6.96964 13.0389 6.71212 12.989 6.44053C12.9391 6.16893 12.6779 5.98611 12.4056 6.03217C9.84558 6.46533 7.43811 4.8242 6.99508 2.41326ZM11.269 7.08948L14.559 12.7513C14.564 12.7599 14.5693 12.7684 14.5748 12.7767C15.0898 13.5522 15.9151 13.967 16.628 14.1932C17.1133 14.3472 17.5162 14.6416 17.7572 15H13.9905C13.293 15 12.6114 14.7916 12.0331 14.4015L10.3398 13.2592L11.3724 12.6629C11.9703 12.3178 12.1752 11.5533 11.83 10.9554L11.0619 9.6251C10.7167 9.02724 9.95225 8.8224 9.35439 9.16757L6.61719 10.7479L5.66726 10.1071L6.37684 9.6974C6.9747 9.35222 7.17954 8.58773 6.83437 7.98986L4.73849 4.3597C5.14914 4.06985 5.66092 3.8078 6.30038 3.59301C7.10124 5.6044 9.06508 6.96496 11.269 7.08948ZM9.28259 13.7522L9.33337 13.8402L9.37626 13.8154L11.4739 15.2305C12.2173 15.732 13.0937 16 13.9905 16H17.9751C17.8594 16.5706 17.3549 17.0001 16.7501 17.0001H13.9605C12.861 17.0001 11.7868 16.6706 10.8765 16.0541L2.22171 10.1931C1.98016 10.0295 1.92937 9.69469 2.11154 9.46683L2.39834 9.10811L6.5509 11.9094L6.56451 11.933L6.576 11.9264L9.28259 13.7522ZM9.41745 12.637L7.53951 11.3701L9.85439 10.0336C9.97396 9.96456 10.1269 10.0055 10.1959 10.1251L10.9639 11.4554C11.033 11.575 10.992 11.7279 10.8724 11.7969L9.41745 12.637ZM3.56303 5.63744C3.67579 5.43779 3.81253 5.23869 3.97915 5.04449L5.96834 8.48986C6.03738 8.60944 5.99641 8.76234 5.87684 8.83137L4.74494 9.48487L3.00013 8.30781V8.18009C3.00013 7.4148 3.08222 6.4888 3.56303 5.63744Z" fill="#242424"/>
                            </svg>
                        }
                        header={
                        <Body1>
                            Daily foot traffic
                        </Body1>
                        }
                        description={<Caption1></Caption1>}
                    />

                    <CardPreview>
                        <Stack>
                            <Stack horizontal>
                                <Stack>
                                <Text className={styles.cardpreviewtext}>5,050</Text>
                                <Text className={styles.cardpreviewsubtext}>Shoppers per day</Text>
                                </Stack>
                                <Stack>
                                <div id="cameraHeaderDividerContainer" className={styles.cardDividerContainer}>
                                    <Stack id="cameraHeaderDivider" className={styles.cardDivider}>
                                    </Stack>
                                </div>
                                </Stack>
                                <Stack>
                                <Text className={styles.cardpreviewtext}>25,689</Text>
                                <Text className={styles.cardpreviewsubtext}>Customers per week</Text>
                                </Stack>
                            </Stack>
                        </Stack>
                    </CardPreview>
                </Card>
                <Card className={styles.card}>
                    <CardHeader
                        image={
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
<path d="M2.99707 3.49658C2.99707 3.22044 3.22093 2.99658 3.49707 2.99658H3.93543C4.66237 2.99658 5.07976 3.46966 5.32152 3.94123C5.4872 4.26438 5.6065 4.65862 5.70508 5H15.9999C16.6634 5 17.1429 5.63441 16.9619 6.27278L15.4664 11.5473C15.2225 12.4078 14.4368 13.0017 13.5423 13.0017H8.46306C7.56125 13.0017 6.77099 12.3982 6.5336 11.5282L5.89118 9.17387C5.88723 9.16317 5.88361 9.15226 5.88034 9.14116L4.851 5.64339C4.81568 5.52734 4.78318 5.41488 4.7518 5.30629C4.65195 4.96076 4.56346 4.65454 4.43165 4.39745C4.2723 4.08662 4.12597 3.99658 3.93543 3.99658H3.49707C3.22093 3.99658 2.99707 3.77272 2.99707 3.49658ZM6.84471 8.86921L7.49833 11.265C7.61702 11.7 8.01215 12.0017 8.46306 12.0017H13.5423C13.9895 12.0017 14.3824 11.7048 14.5044 11.2745L15.9999 6H6.00063L6.84471 8.86921ZM10 15.5C10 16.3284 9.32843 17 8.5 17C7.67157 17 7 16.3284 7 15.5C7 14.6716 7.67157 14 8.5 14C9.32843 14 10 14.6716 10 15.5ZM9 15.5C9 15.2239 8.77614 15 8.5 15C8.22386 15 8 15.2239 8 15.5C8 15.7761 8.22386 16 8.5 16C8.77614 16 9 15.7761 9 15.5ZM15 15.5C15 16.3284 14.3284 17 13.5 17C12.6716 17 12 16.3284 12 15.5C12 14.6716 12.6716 14 13.5 14C14.3284 14 15 14.6716 15 15.5ZM14 15.5C14 15.2239 13.7761 15 13.5 15C13.2239 15 13 15.2239 13 15.5C13 15.7761 13.2239 16 13.5 16C13.7761 16 14 15.7761 14 15.5Z" fill="#242424"/>
</svg>
                        }
                        header={
                        <Body1>
                            Checkout lanes
                        </Body1>
                        }
                        description={<Caption1></Caption1>}
                    />

                    <CardPreview>
                        <Stack>
                            <Stack horizontal>
                                <Stack>
                                <Text className={styles.cardpreviewtext}>{automatedCheckoutsOpen  ? automatedCheckoutsOpen["open_automated_checkouts"] : 0} of {automatedCheckoutsOpen  ? automatedCheckoutsOpen["total_checkouts"] : 0}</Text>
                                <Text className={styles.cardpreviewsubtext}>Open and active</Text>
                                </Stack>
                                <Stack>
                                <div id="cameraHeaderDividerContainer" className={styles.cardDividerContainer}>
                                    <Stack id="cameraHeaderDivider" className={styles.cardDivider}>
                                    </Stack>
                                </div>
                                </Stack>
                                <Stack>
                                <Text className={styles.cardpreviewtext}>{automatedCheckoutsOpen  ? automatedCheckoutsOpen["closed_automated_checkouts"] : 0} of {automatedCheckoutsOpen  ? automatedCheckoutsOpen["total_checkouts"] : 0}</Text>
                                <Text className={styles.cardpreviewsubtext}>Closed, staffing needed</Text>
                                </Stack>
                            </Stack>
                        </Stack>
                    </CardPreview>
                </Card>       
                <Card id="singleCard" className={styles.singlecard}>
                    <CardHeader
                        image={
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
<path d="M10 2C14.4183 2 18 5.58172 18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2ZM10 3C6.13401 3 3 6.13401 3 10C3 13.866 6.13401 17 10 17C13.866 17 17 13.866 17 10C17 6.13401 13.866 3 10 3ZM9.5 5C9.74546 5 9.94961 5.17688 9.99194 5.41012L10 5.5V10H12.5C12.7761 10 13 10.2239 13 10.5C13 10.7455 12.8231 10.9496 12.5899 10.9919L12.5 11H9.5C9.25454 11 9.05039 10.8231 9.00806 10.5899L9 10.5V5.5C9 5.22386 9.22386 5 9.5 5Z" fill="#242424"/>
</svg>
                        }
                        header={
                        <Body1>
                            Avg checkout wait time
                        </Body1>
                        }
                        description={<Caption1></Caption1>}
                    />

                    <CardPreview>
                        <Stack>
                            <Stack horizontal>
                                <Stack>
                                <Text className={styles.cardpreviewtext}>{automatedCheckoutsOpen  ? Math.ceil(automatedCheckoutsOpen["avg_wait_time"]) : 0}</Text>
                                <Text className={styles.cardpreviewsubtext}>Minutes</Text>
                                </Stack>
                            </Stack>
                        </Stack>
                    </CardPreview>

                </Card>       
                <Card id="queueReport" className={styles.card} style={{width: '220px'}}>
                    <CardHeader
                        image={
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
<path d="M10 3C9.17157 3 8.5 3.67157 8.5 4.5C8.5 5.32843 9.17157 6 10 6C10.8284 6 11.5 5.32843 11.5 4.5C11.5 3.67157 10.8284 3 10 3ZM7.5 4.5C7.5 3.11929 8.61929 2 10 2C11.3807 2 12.5 3.11929 12.5 4.5C12.5 5.88071 11.3807 7 10 7C8.61929 7 7.5 5.88071 7.5 4.5ZM15.5 4C14.9477 4 14.5 4.44772 14.5 5C14.5 5.55228 14.9477 6 15.5 6C16.0523 6 16.5 5.55228 16.5 5C16.5 4.44772 16.0523 4 15.5 4ZM13.5 5C13.5 3.89543 14.3954 3 15.5 3C16.6046 3 17.5 3.89543 17.5 5C17.5 6.10457 16.6046 7 15.5 7C14.3954 7 13.5 6.10457 13.5 5ZM3.5 5C3.5 4.44772 3.94772 4 4.5 4C5.05228 4 5.5 4.44772 5.5 5C5.5 5.55228 5.05228 6 4.5 6C3.94772 6 3.5 5.55228 3.5 5ZM4.5 3C3.39543 3 2.5 3.89543 2.5 5C2.5 6.10457 3.39543 7 4.5 7C5.60457 7 6.5 6.10457 6.5 5C6.5 3.89543 5.60457 3 4.5 3ZM5.09952 14.9976C5.06655 14.9992 5.03337 15 5 15C3.89543 15 3 14.1046 3 13V9.25C3 9.11193 3.11193 9 3.25 9H5.01373C5.05433 8.63279 5.18329 8.29221 5.37889 8H3.25C2.55964 8 2 8.55964 2 9.25V13C2 14.6569 3.34315 16 5 16C5.13712 16 5.27209 15.9908 5.40434 15.973C5.27099 15.6628 5.16813 15.3364 5.09952 14.9976ZM14.5957 15.973C14.7279 15.9908 14.8629 16 15 16C16.6569 16 18 14.6569 18 13V9.25C18 8.55964 17.4404 8 16.75 8H14.6211C14.8167 8.29221 14.9457 8.63279 14.9863 9H16.75C16.8881 9 17 9.11193 17 9.25V13C17 14.1046 16.1046 15 15 15C14.9666 15 14.9334 14.9992 14.9005 14.9976C14.8319 15.3364 14.729 15.6628 14.5957 15.973ZM7.25 8C6.55964 8 6 8.55964 6 9.25V14C6 16.2091 7.79086 18 10 18C12.2091 18 14 16.2091 14 14V9.25C14 8.55964 13.4404 8 12.75 8H7.25ZM7 9.25C7 9.11193 7.11193 9 7.25 9H12.75C12.8881 9 13 9.11193 13 9.25V14C13 15.6569 11.6569 17 10 17C8.34315 17 7 15.6569 7 14V9.25Z" fill="#242424"/>
</svg>
                        }
                        header={
                        <Body1>
                            Queue Report
                        </Body1>
                        }
                        description={<Caption1></Caption1>}
                    />
                    <CardPreview>
                        <Stack>
                            <Stack horizontal>
                                <Stack>
                                <Text className={styles.cardpreviewtext}>{automatedCheckoutsOpen  ? automatedCheckoutsOpen["queue_length"] : 0}</Text>
                                <Text className={styles.cardpreviewsubtextextended}>Customers in checkout line</Text>
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
  
  export default Cards;