import React, { useEffect, useState }  from 'react';
import { Dropdown, SearchBox, Stack } from "@fluentui/react";
import cameraimage1 from '../assets/cameraimage1.png'; 
import cameraimage2 from '../assets/cameraimage2.png'; 
import VideoStream from './VideoStream';
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
    addcamerabuttoncenter: {
        width: "123px",
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
        width: "537px",
        maxWidth: "100%",
        marginTop: "15px",
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
    }
  });

  const MaintenanceCameras: React.FC<{ callParentFunction: () => void }>  = ({ callParentFunction }) => {
    var storeAPI = process.env.REACT_APP_STORE_API_URL || "/StoreApi";
    var footfallAIAPI = process.env.REACT_APP_FOOTFALL_API || "/FootfallApi";
    const classes = useStyles();
    // API integration code
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
        console.log('dataforVideo');
        console.log(dataforVideo);
        return dataforVideo
      }    
    return (
        <Stack id='maincontainer'>
            <Stack id='camerasheader' horizontal style={{width: "100%"}}>
                <Stack horizontal>
                    {/* <Dropdown placeholder="Sorty by" className={classes.dropdown} options={[
                        { key: 'option1', text: 'Option 1' },
                        { key: 'option2', text: 'Option 2' },
                        { key: 'option3', text: 'Option 3' },
                    ]} />  */}
                    <div className={classes.addcameracontainer}>
                    <Button appearance="primary" className={classes.addcamerabutton} onClick={callParentFunction}>+ Add Camera</Button>
                    </div>
                </Stack>
                <Stack id='searchboxcontainer' className={classes.searchboxcontainer}>
                {/* <SearchBox placeholder="Search camera feeds" className={classes.searchbox} /> */}
                </Stack>
            </Stack>
            { (dataItems.length == 0) ? (
            <Stack id='emptyspace'>
                <Stack style={{height:'100%', width:'100%'}}>
                    <Text align="center" size={500} style={{marginTop: '126px'}}>No cameras to display</Text>
                    <Text align="center" size={300}>No cameras added yet. Click 'Add Camera' to get started.</Text>
                    <div className={classes.addcameracontainer}>
                        <Button appearance="primary" className={classes.addcamerabuttoncenter} onClick={callParentFunction}>+ Add Camera</Button>
                    </div>                     
                </Stack>
            </Stack>
            ) : (
            <Stack id='camerascollection'>
            <div id='container' style={{display: "flex", width: "100%", flexWrap: 'wrap'}}>
            {dataItems.map(item => (
                <div id='inner' style={{ width: "50%"}}>
                            <Card className={classes.card}>
                            <CardPreview>
                                <VideoStream 
                                    title="" 
                                    videoUrl={generateDataForVideo(item.id, item.rtspuri, item.name, item.x1,item.y1, item.x2, item.y2)} />
                            </CardPreview>
                            <CardFooter>
                                <Stack>
                                <Text><b>{item.name}</b></Text>
                                <Stack horizontal>
                                <Text>Zone label </Text>
                                <Text>&nbsp; | Status: Active | </Text>
                                <Text>&nbsp;People count: {item.currentCount}</Text>
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
            )}
        </Stack>
    );
  };
  
  export default MaintenanceCameras;