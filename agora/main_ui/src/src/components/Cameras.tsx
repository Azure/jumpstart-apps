import React, { useEffect, useState }  from 'react';
import { Stack } from "@fluentui/react";
import cameraimage1 from '../assets/cameraimage1.png'; 
import cameraimage2 from '../assets/cameraimage2.png'; 
import VideoStream from './VideoStream';
import {
    makeStyles,
    Body1,
    Caption1,
    Button,
    Divider,  Tag,
    TagGroup,
    TagGroupProps,
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
    cameraIcon: {
        marginLeft: "16px",
        marginTop: "10px",
        marginBottom: "10px",
    },
    cameraHeader: {
        margin:"0 auto"
    },
    cameraInnerTextInIcon: {
        marginLeft: "7px",
        marginTop: "20px",
        alignContent: "start",
        color: "var(--Text-Primary, #323130)",
        fontFamily: "Segoe UI",
        fontSize: "14px",
        fontStyle: "normal",
        fontWeight: "600",
        lineHeight: "20px", /* 142.857% */       
        verticalAlign: "top", 
    },
    cameraEllipses: {
        float:"right",
        marginTop: "12px",
        marginBottom: "12x",
        width:"40px",
        height:"40px",
    },
    cameraLabel: {
        marginLeft: "7px",
        marginTop: "20px",
        alignContent: "start",
        color: "var(--Text-Primary, #323130)",
        fontFamily: "Segoe UI",
        fontSize: "12px",
        fontStyle: "normal",
        fontWeight: "400",
        lineHeight: "16px", /* 142.857% */       
        verticalAlign: "top", 
    },
    activeCameras: {
        float:"right",
        marginTop: "14px",
        marginBottom: "14x",
        marginRight: "17px",
        width:"125px",
        height:"40px",
    },
    cameraHeaderDivider : {
        width: "572px",
        height: "1px",
        flexShrink: "0",
        background: "#C4C4C4"
    },
    cameraHeaderAndIcon : {
        margin: "auto",
        width: "572px",
        maxWidth: "100%",
    },
    camerasSectionContainer: {
        margin: "auto",
        width: "572px",
        maxWidth: "100%",
        
        /* Elevation/Light/Shadow 02 */
        boxShadow: "0px 1px 2px 0px rgba(0, 0, 0, 0.14), 0px 0px 2px 0px rgba(0, 0, 0, 0.12)",
        borderRadius: "8px",
        background: "#FFF"        
    },
    card: {
        width: "268px",
      },
      cameracard: {
          maxWidth: "100%",
          padding: "0px",
          marginLeft: "5px"
        },
    text: {
        paddingTop: "30px",
    }
    ,
    textRightAlign: {
        textAlign: "right",
    }
  });
  const Cameras = () => {
    const styles = useStyles();
    var storeAPI = process.env.REACT_APP_STORE_API_URL || "/StoreApi";
    var footfallAIAPI = process.env.REACT_APP_FOOTFALL_API || "/FootfallApi";
    type DataItem = {
        id: number;
        name: string;
        description: string;
        rtspuri: string;
        currentCount: number;
        x1: number;
        y1: number;
        x2: number;
        y2: number;
      };    
      const dataItems: DataItem[] = [
      ];
      const footfallStatuses: FootfallStatus[] = [
    ];
    const cameraRegions: RegionItem[] = [
    ];    
      type RegionItem = {
        id: number;
        name: string;
        description: string;
        camerId: number;
        x1: number;
        y1: number;
        x2: number;
        y2: number;
        threshold: number;
      };   

      type FootfallStatus = {
        currentCount: number,
        debug: boolean,
        fps: string,
        name:string,
        videoUrl: string
      }

      const [data, setData] = useState([]);
      useEffect(() => {
        fetch(storeAPI + '/cameras')
          .then(response => response.json())
          .then(json => setData(json))
          .then()
          .catch(error => console.error(error));
      }, []);    
      const [statuses, setStatusData] = useState();
      const [regions, setRegions] = useState([]);
      useEffect(() => {
        var cameraRegionURL = storeAPI + "/regions";
        fetch(cameraRegionURL)
        .then(response => response.json())
        .then(json => setRegions(json))
        .then()
        .catch(error => console.error(error));
        }, []);  
        if(regions) {
            regions.forEach( region => {
                var newRegionItem: RegionItem = {
                    id: region["id"],
                    camerId: region["camera_id"],
                    name: region["name"],
                    description: region["description"],
                    x1: region["x1"],
                    y1: region["y1"],
                    x2: region["x2"],
                    y2: region["y2"],
                    threshold: region["threshold"]
                }
                cameraRegions.push(newRegionItem);
            })
        }

      useEffect(() => {
        fetch(footfallAIAPI + '/status')
          .then(response => response.json())
          .then(json => setStatusData(json))
          .then()
          .catch(error => console.error(error));
      }, []);  
      if(statuses) {
        if(Array.isArray(statuses["statuses"])) {
            var arrayedObject = Object.entries(statuses["statuses"]);
            arrayedObject.forEach(element => 
            {
                var objectFiedStatus = JSON.parse(JSON.stringify(element[1]));
                var newFootfallStatus: FootfallStatus = {
                    currentCount: objectFiedStatus.current_count,
                    videoUrl: objectFiedStatus.video_url,
                    fps: objectFiedStatus.fps,
                    name: objectFiedStatus.name,
                    debug: objectFiedStatus.debug
                }
                footfallStatuses.push(newFootfallStatus);
            }
            );
        }
      }
      if(data) {
        data.forEach(
            function(d){
            var currentCount = 0;
            var x1 = 0;
            var y1 = 0;
            var x2 = 0;
            var y2 = 0;
            if(footfallStatuses) {
                footfallStatuses.forEach(footFallStatus => {
                    if(d["rtspuri"] === footFallStatus.videoUrl) {
                        currentCount = footFallStatus.currentCount;
                    }
                });
            }
            if(cameraRegions) {
                cameraRegions.forEach(cameraRegion => {
                    if(cameraRegion.camerId === d["id"]) {
                        x1 = cameraRegion.x1;
                        x2 = cameraRegion.x2;
                        y1 = cameraRegion.y1;
                        y2 = cameraRegion.y2;
                    }
                })
            }

            var newDataItem: DataItem = {
                id: d["id"] ,
                name: d["name"],
                description: d["description"],
                rtspuri: d["rtspuri"],
                currentCount: currentCount,
                x1: x1,
                y1: y1,
                x2: x2,
                y2: y2
            };
            dataItems.push(newDataItem);     
            }
        )  
    }
    function generateDataForVideo(cameraId: number, rtspurl: string, cameraName: string, x1: number, y1: number, x2: number, y2: number) {
        var dataforVideo = footfallAIAPI +  "/video_feed?data={\"x\" : " + x1.toString() + ", \"y\" : " + y1.toString() + ",\"w\" : " + x2.toString() + ", \"h\" : " + y2.toString() + ", \"debug\" : false, \"cameraName\" : \"" + cameraName +  "\", \"video_url\": \"" + rtspurl + "\" }";           
        return dataforVideo
      }      
    return (
        <Stack>
            <Stack id="camerasSectionContainer" className={styles.camerasSectionContainer}>
                <Stack id="cameraHeaderAndIcon" horizontal className={styles.cameraHeaderAndIcon}>
                    <div id="cameraIcon" className={styles.cameraIcon}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M8 12C8 10.8954 8.89542 10 10 10C11.1046 10 12 10.8954 12 12C12 13.1046 11.1046 14 10 14C8.89542 14 8 13.1046 8 12ZM10 8C7.79086 8 6 9.79086 6 12C6 14.2091 7.79086 16 10 16C12.2091 16 14 14.2091 14 12C14 9.79086 12.2091 8 10 8ZM7 12C7 10.3431 8.34314 9 10 9C11.6569 9 13 10.3431 13 12C13 13.6569 11.6569 15 10 15C8.34314 15 7 13.6569 7 12ZM2 4.5C2 3.67157 2.67157 3 3.5 3H16.5C17.3284 3 18 3.67157 18 4.5V5.5C18 6.15311 17.5826 6.70874 17 6.91464V11C17 14.866 13.866 18 10 18C6.134 18 3 14.866 3 11V6.91464C2.41739 6.70874 2 6.15311 2 5.5V4.5ZM4 7V11C4 14.3137 6.68628 17 10 17C13.3137 17 16 14.3137 16 11V7H4ZM3.5 4C3.22386 4 3 4.22386 3 4.5V5.5C3 5.77614 3.22386 6 3.5 6H16.5C16.7761 6 17 5.77614 17 5.5V4.5C17 4.22386 16.7761 4 16.5 4H3.5Z" fill="#242424"/>
                        </svg>
                        <Text id="cameraInnerTextInIcon" className={styles.cameraInnerTextInIcon}>Cameras </Text>
                    </div>
                    <div id="cameraHeader" className={styles.cameraHeader}>
                        
                    </div>
                    <div id="cameraEllipses" className={styles.cameraEllipses}>
                        ...
                    </div>
                </Stack>
                <Stack id="cameraHeaderDivider" className={styles.cameraHeaderDivider}>

                </Stack>
                <Stack id="filtersAndActiveCameras" horizontal>
                    <div id="cameraIcon" className={styles.cameraIcon}>

                    <TagGroup aria-label="Dismiss example">
                            <Tag
                            dismissible
                            dismissIcon={{ "aria-label": "remove" }}
                            value="FilterValue"
                            key="FilterValue"
                            >
                                Filtern name: Filter Value
                            </Tag>
                    </TagGroup>
                    </div>
                    <div id="cameraHeader" className={styles.cameraHeader}>
                        
                    </div>
                    <div id="activeCameras" className={styles.activeCameras}>
                    <Text id="cameraInnerTextInIcon" className={styles.cameraInnerTextInIcon}>{dataItems.length} Cameras active</Text>
                    </div>
                </Stack>
                <Stack id='camerascollection'>
                    <div id='container' style={{display: "flex", width: "100%", flexWrap: 'wrap'}}>
                    {dataItems.map(item => (
                        <div id='inner' style={{ width: "50%"}}>
                                    <Card className={styles.cameracard}>
                                    <CardPreview>
                                        <VideoStream 
                                            title="" 
                                            videoUrl={generateDataForVideo(item.id, item.rtspuri, item.name, item.x1,item.y1, item.x2, item.y2)} />
                                    </CardPreview>
                                    <CardFooter>
                                        <Stack>
                                        <Text className={styles.cameracard} style={{fontSize: "14px", fontWeight: "600"}}>{item.name}</Text>
                                        <Stack horizontal>
                                        <Text className={styles.cameraLabel} style={{color: "#616161"}}>Zone label </Text>
                                        <Text className={styles.cameraLabel}>&nbsp; | Status: Active | </Text>
                                        <Text className={styles.cameraLabel}>&nbsp;People count: {item.currentCount}</Text>
                                        </Stack>
                                        </Stack>
                                    </CardFooter>
                                </Card>     
                                </div>  
                                ))
                            }
                    </div>
                <Stack horizontal>
                </Stack>
                </Stack>
            </Stack>
            <Stack.Item align="start" grow={3}>
                <Stack  horizontalAlign="start">
                </Stack> 
            </Stack.Item>
        </Stack>
    );
  };
  
  export default Cameras;