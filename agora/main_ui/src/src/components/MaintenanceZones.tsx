import React, { useState, useEffect } from 'react';
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
import MaintenanceZonesGrid from "./MaintenanceZonesGrid";
import { useNavigate } from "react-router-dom";
  
  const useStyles = makeStyles({
    cardContainer: {
      margin: "auto",
      width: "572px",
      maxWidth: "100%",
    },
    searchbox: {
        width: "176px",
        height: "24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        borderRadius: "var(--Medium, 4px)",
        border: "1px solid NeutralStroke1.Rest",
        background: "NeutralBackground1.Rest",
        margin:'auto',        
        marginRight: "88px",
    },
    searchboxcontainer: {
        display: "flex",
        width: "80%",
        height: "40px",
        gap: "170px",
        flexShrink: "0",
        borderRadius: "Global.Corner.Radius.40",
        border: "1px solid TransparentStroke.Rest",
        background: "Global.Color.Grey.94",
        padding: "0px 6px",
        alignItems: "right",
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
    uploadfloorplanbuttoncenter: {
        width: "154px",
        height: "32px",
        padding: "12px 6px",
        borderRadius: "4px",
        background: "#5C2E91",
        color: "#FFFFFF",
        fontFamily: "var(--Font-family-Base, \"Segoe UI\")",
        fontSize: "var(--Font-size-300, 14px)",
        fontStyle: "normal",
        fontWeight: "600",
        lineHeight: "var(--Line-height-300, 20px)", /* 142.857% */       
        justifyContent: "center",
        gap: "6px",
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
    },
    dropdown: { 
        height: "32px",
        display: "flex",
        width: "120px",
        flexDirection: "column",
        alignItems: "flex-start",
        alignSelf: "stretch",
    },
    emptyspace: {
        height: "100vh",
        borderRadius: "8px",
        background: "#FFFFFF", 
        marginTop: "15px",       
        alignItems: "center",    
        justifyContent: "center",   
        display: "flex",
    }
  });
  interface ZoneCameraData {
    zoneId: number;
    cameraId: number;
    zoneName: string;
    zoneDescription: string;
    cameraName: string;
    cameraDescription: string;
    rtspuri: string;
  }
  interface MaintenanceZonesGridProps {
    zonesCameras: ZoneCameraData[];
  }
  const MaintenanceZones = () => {
    const classes = useStyles();
    const navigate = useNavigate();

    const navigotteToWizard = () => {
      navigate('/camerazoneswizard');
    };

    interface CameraData {
        id: number;
        name: string;
        description: string;
        rtspuri: string;
      }

    interface ZoneCameraData {
        zoneId: number;
        cameraId: number;
        zoneName: string;
        zoneDescription: string;
        cameraName: string;
        cameraDescription: string;
        rtspuri: string;
      }

    const [metrics, setMetrics] = useState<CameraData[]>();
    const [posts, setPosts] = useState([]);    
    const [completeData, setCompleteData] = useState<ZoneCameraData[]>();
    var zonesCameras: ZoneCameraData[]=[];
    var storeAPI = process.env.REACT_APP_STORE_API_URL || "/StoreApi";
    useEffect(() => {
        fetch(`${storeAPI}/zones`)
          .then(response => response.json())
          .then(posts => {
            setPosts(posts);
            let postPromises = posts.map((post: { [x: string]: string; }) => {
                var metricURLWithPost = `${storeAPI}/cameras/` + post["camera_id"];
                return fetch(metricURLWithPost)
                    .then(response => response.json())
                    .then(camera => {
                        var newZoneCameraData: ZoneCameraData = {
                            cameraId: camera["id"],
                            cameraName: camera["name"],
                            cameraDescription: camera["description"],
                            rtspuri: camera["rtspuri"],
                            zoneId:  Number(post["id"]),
                            zoneDescription:  post["description"],
                            zoneName:  post["name"]
                        }
                        zonesCameras.push(newZoneCameraData);
                        setCompleteData(zonesCameras);
                    });
            });
    
            return Promise.all(postPromises);
          })
          .then(metricsArray => {
            setMetrics(metricsArray);
          })
          .catch(error => {
            console.error(error);
          });
      }, []);

      
    return (
        <Stack id='maincontainer'>
            <Stack id='zonesheader' horizontal style={{width: "100%"}}>
                <Stack horizontal>
                    <Dropdown placeholder="Sorty by" className={classes.dropdown} options={[
                        { key: 'option1', text: 'Option 1' },
                        { key: 'option2', text: 'Option 2' },
                        { key: 'option3', text: 'Option 3' },
                    ]} /> 
                    <div className={classes.addcameracontainer}>
                    <Button appearance="primary" className={classes.addcamerabutton} onClick={navigotteToWizard}>+ Add Zone</Button>
                    </div>
                </Stack>
                <Stack id='searchboxcontainer' className={classes.searchboxcontainer}>
                <SearchBox placeholder="Search camera feeds" className={classes.searchbox} />
                </Stack>
            </Stack> 
            {(completeData && completeData.length == 0) ? (
            <Stack id='emptyspace' className={classes.emptyspace}>
                <Stack style={{height:'100%', width:'100%', marginTop:'258px'}}>
                    <Text align="center" size={500}>No floor zones to display</Text>
                    <Text align="center" size={300}>Click 'Upload floorplan' to get started</Text>
                    <div className={classes.addcameracontainer}>
                        <Button appearance="primary" className={classes.uploadfloorplanbuttoncenter} onClick={navigotteToWizard}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M15 3.00098C15.2761 3.00098 15.5 2.77712 15.5 2.50098C15.5 2.25552 15.3231 2.05137 15.0899 2.00903L15 2.00098H4C3.72386 2.00098 3.5 2.22483 3.5 2.50098C3.5 2.74644 3.67688 2.95059 3.91012 2.99292L4 3.00098H15ZM9.50014 17.9988C9.7456 17.9988 9.9497 17.8218 9.99197 17.5885L10 17.4986L9.996 5.70477L13.6414 9.3531C13.8148 9.52683 14.0842 9.54636 14.2792 9.41154L14.3485 9.35375C14.5222 9.18034 14.5418 8.91094 14.407 8.71595L14.3492 8.64664L9.85745 4.14664C9.78495 4.07401 9.69568 4.02833 9.60207 4.00962L9.49608 3.99987C9.33511 3.99987 9.19192 4.076 9.10051 4.19419L4.64386 8.64607C4.44846 8.84119 4.44823 9.15777 4.64336 9.35317C4.8168 9.52686 5.08621 9.54634 5.28117 9.41148L5.35046 9.35368L8.996 5.71277L9 17.4989C9.00008 17.7751 9.224 17.9988 9.50014 17.9988Z" fill="white"/>
                            </svg>
                            Upload floorplan</Button>
                    </div>
                </Stack>
            </Stack>
            ) : (            
            <Stack id='camerascollection'>
                <MaintenanceZonesGrid zonesCameras={completeData ? completeData : []}></MaintenanceZonesGrid>
            </Stack>
            )}            
        </Stack>
    );
  };
  
  export default MaintenanceZones;