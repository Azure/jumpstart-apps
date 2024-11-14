import React, { useState }  from 'react';
import {
  FluentProvider,
  webLightTheme,
  Text,
  makeStyles,
  Radio,
  Label,
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Card,
  tokens,
  Toolbar,
  Dropdown
} from "@fluentui/react-components";
import { useNavigate } from "react-router-dom";
import Header from '../../components/MaintenanceWorkerHeader';
import Footer from '../../components/SuiteFooter';
import SideMenu from "../../components/MaintenanceMenu";
import { ITag, Pivot, PivotItem, PrimaryButton, TagPicker, TextField } from '@fluentui/react';
import { IStackProps, IStackTokens, Stack } from "@fluentui/react";
import { Panel, PanelType, DefaultButton, ProgressIndicator } from '@fluentui/react';

import { ChatInputProps, CopilotProvider } from "@fluentui-copilot/react-copilot";
import logo from './logo.svg';
import '../../App.css';
import Cameras from '../../components/MaintenanceCameras';
import MaintenanceZones from '../../components/MaintenanceZones';
import {  SearchBox, IconButton } from '@fluentui/react';
import { useDropzone } from 'react-dropzone';
import { useCallback } from 'react';
import CerebralChatWithAudio from '../../components/Chatter';
import WizardNavigation from '../../components/WizardNavigationStatus';
import CerebralHeader from '../../components/CerebralHeader';
import { initializeIcons } from "@fluentui/react/lib/Icons";
initializeIcons();

const Main = (props: IStackProps) => (
    <Stack horizontal grow={1} disableShrink {...props} />
  );
  const useStyles = makeStyles({
    categoryTextStyles: {
        gap: "36px",
        display: "flex",
        flexDirection: "column",
        flexWrap: "wrap",
      },
      pivotStyles: {
        marginTop: '60px',
      },
      cameraimagecontainer: {
        display: 'flex',
        width: '100%',
        height: '396px',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        flexShrink: '0',
        background: '#EBF3FC',
      },
      cameraimage: {
        display: 'flex',
        paddingTop: '4px',
        flexDirection: 'column',
        justifyContent: 'center',
        color: '#115EA3',
        textAlign: 'center',
        leadingTrim: 'both',
        textEdge: 'cap',
        fontFamily: 'Segoe UI',
        fontSize: '10px',
        fontStyle: 'normal',
        fontWeight: '700',
        lineHeight: '14px',
        letterSpacing: '0.3px',
        },
        main: {
          background: "#F0F0F0",
        },
        breadcrumb: {
          marginTop: '16px',
          marginLeft: '22px',
      },
      breadcrumbitem: {
        display: 'flex',  
        height: '20px',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '4px',
        color: '#424242',
        fontFamily: 'Segoe UI',
        fontSize: '12px',
        fontStyle: 'normal',
        fontWeight: '400',
        lineHeight: '16px',
      },
      buttonContainer: {
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        background: '#F3FDF8',
        height: '73px',
        justifyContent: 'flex-start',
      },
      footer: {
        width: '100%', 
        height: '32px', 
        position: 'fixed', 
        bottom: '73px',
        padding: '16px 24px',
        alignItems: 'flex-start',
        gap: '8px',
        borderTop: '1px solid NeutralStroke1.Rest',
        background: '#FFFFFF',
    },
    footerpreviousbutton: {
        display: 'flex',
        padding: '5px 12px',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: '4px',
        border: '1px solid NeutralStroke1.Rest',
        background: 'NeutralBackground1.Rest',
        fontFamily: 'Segoe UI',
        fontSize: '14px',
        fontStyle: 'normal',
        fontWeight: '600',
        lineHeight: '20px',
        marginRight: '8px',        
    },
    footernextbutton: {
        display: 'flex',
        padding: '5px 12px',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: '4px',
        border: '1px solid NeutralStroke1.Rest',
        background: '#6E53BB',
        color: '#FFFFFF',
        fontFamily: 'Segoe UI',
        fontSize: '14px',
        fontStyle: 'normal',
        fontWeight: '600',
        lineHeight: '20px',
    },
    wizardContainer: {
        padding: '20px',
        width: '250px',
      },
      stepContainer: {
        marginBottom: '20px',
      },
      stepText: {
        marginBottom: '5px',
      },    
      wizardheader: {
        color: '#323130',
        fontFamily: 'Segoe UI',
        fontSize: '20px',
        fontStyle: 'normal',
        fontWeight: '600',
        lineHeight: '36px',
        fontfamily: "Segoe UI",
        fontsize: "28px",
        fontstyle: "normal",
        fontweight: "600",
        lineheight: "36px", /* 128.571% */    
        width: "701px",
        height: "36px",
        marginTop: "51px",
      },
      wizardtext: {
        color: "#605E5C",
        fontfamily: "Segoe UI",
        fontsize: "14px",
        fontstyle: "normal",
        fontweight: "400",
        lineheight: "normal",
        letterspacing: "-0.008px",
      },
      dropzone: {
        border: `2px dashed #D1D1D1`,
        borderradius: "4px",
        padding: '20px',
        textAlign: 'center',
        cursor: 'pointer',
      },
      icon: {
        fontSize: '24px',
        marginBottom: '8px',
      },      
      container: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        padding: '20px',
        maxWidth: '800px',
        margin: '0 auto',
      },
      uploadArea: {
        border: `2px dashed ${tokens.colorNeutralStroke1}`,
        borderRadius: '4px',
        padding: '20px',
        textAlign: 'center',
        cursor: 'pointer',
      },
      previewArea: {
        height: '300px',
        border: `1px solid ${tokens.colorNeutralStroke1}`,
        borderRadius: '4px',
        padding: '10px',
      },
      progressIndicator: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      },
      progressStep: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      },
      progressDot: {
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        backgroundColor: tokens.colorNeutralBackground1,
        border: `2px solid ${tokens.colorBrandBackground}`,
      },
      activeDot: {
        backgroundColor: tokens.colorBrandBackground,
      },      
      reviewitemheading: {
        display: 'inline-flex',
        alignItems: 'flex-end',
        gap: '4px',
        color: 'var(--Light-Foreground-Foreground-1, #242424)',

        /* Web/Subtitle 2 */
        fontFamily: 'var(--Font-family-Base, "Segoe UI")',
        fontSize: 'var(--Font-size-400, 16px)',
        fontStyle: 'normal',
        fontWeight: '600',
        lineHeight: 'var(--Line-height-400, 22px)',/* 137.5% */      
        marginTop: '15px',
        marginBottom: '10px',
      },
      reviewitem: {
        display: 'flex',
        height: '21px',
        alignItems: 'flex-start',
        flexShrink: '0',
        marginBottom: '10px',
      },

      reviewitemname: {
        display: 'flex',
        width: '160px',
        alignItems: 'flex-start',
        color: 'var(--Light-Theme-Text-colors-Secondary, #605E5C)',

        /* Web/Body 1 */
        fontFamily: 'var(--Font-family-Base, "Segoe UI")',
        fontSize: 'var(--Font-size-300, 14px)',
        fontStyle: 'normal',
        fontWeight: '400',
        lineHeight: 'var(--Line-height-300, 20px)', /* 142.857% */
      },
      reviewitemvalue: {
        width: '282px',
        height: '21px',
        color: '#000000',

        /* Web/Body 1 */
        fontFamily: 'var(--Font-family-Base, "Segoe UI")',
        fontSize: 'var(--Font-size-300, 14px)',
        fontStyle: 'normal',
        fontWeight: '400',
        lineHeight: 'var(--Line-height-300, 20px)', /* 142.857% */
      },
      
    }
    );

const themedMediumStackTokens: IStackTokens = {
childrenGap: "m",
padding: "m",
};
const categoryTextStyles = {
  root: {
    width: '14.28%', // 100% / 7 for equal width
    height: '100%',
    
  },
};
interface CameraPanelProps {
  isOpen: boolean;
  onDismiss: () => void;
  onSave: () => void;
}
const CamerasZonesWizardReview = () => {
    const styles = useStyles();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isCerebralDrawerOpen, setIsCerebralDrawerOpen] = useState(false);
    const [cameraNameInputValue, setCameraNameInputValue] = React.useState('');
    const handleCameraNameInputChange = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
      setCameraNameInputValue(newValue || '');
    };
    const [cameraEndpointInputValue, setCameraEndpointInputValue] = React.useState('');
    const handleCameraEndpointInputChange = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
      setCameraEndpointInputValue(newValue || '');
    };
    const [tags, setTags] = React.useState<ITag[]>([]);

    const onTagsChange = (items?: ITag[]) => {
      setTags(items || []);
    };
    const directionTags: ITag[] = [
      { key: 'upperleft', name: 'Upper Left' },
      { key: 'upperright', name: 'Upper Right' },
      { key: 'lowerleft', name: 'Lower Left' },
      { key: 'lowerright', name: 'Lower Right' },
    ];
    const onResolveSuggestions = (filterText: string, selectedItems?: ITag[]): ITag[] => {
      return filterText
        ? directionTags.filter(
            tag => tag.name.toLowerCase().indexOf(filterText.toLowerCase()) === 0 &&
            !(selectedItems || []).some(selectedItem => selectedItem.key === tag.key)
          )
        : [];
    };

    const onFilterChanged = (filterText: string, tag: ITag) => {
      return tag.name.toLowerCase().startsWith(filterText.toLowerCase());
    };
    const onEmptyInputFocus = () => {
      return true;
    };
    const toggleDrawer = () => {
      setIsDrawerOpen(!isDrawerOpen);
    };
    const onDrop = useCallback((acceptedFiles: File[]) => {
        // Handle the dropped files here
        console.log(acceptedFiles);
      }, []);
    const wizardSteps = [
        { name: 'Upload file', progress: 0 },
        { name: 'Draw zones', progress: 20 },
        { name: 'Assign cameras', progress: 40 },
        { name: 'Setup regions (Optional)', progress: 60 },
        { name: 'Finish', progress: 100 },
      ];
      const steps = [
        "Upload file",
        "Draw zones",
        "Assign cameras",
        "Setup regions (optional)",
        "Finish"
      ];      
      const [activeStep, setActiveStep] = useState(0);      
      const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });
      const navigate = useNavigate();
      const stackTokens: IStackTokens = { childrenGap: 10 };
      const toggleCerebralDrawer = () => {
        setIsCerebralDrawerOpen(!isCerebralDrawerOpen);
      };  
      const onRenderCerebralFooterContent = React.useCallback(
        () => (
          <Stack horizontal tokens={{ childrenGap: 10 }}>
            {/* <PrimaryButton onClick={onSaveDrawer}>Save</PrimaryButton> */}
            <DefaultButton onClick={onCancelCerebralDrawer}>Close</DefaultButton>
          </Stack>
        ),
        []
      );
      const onCancelCerebralDrawer = () => {
        setIsCerebralDrawerOpen(false);
      };       

      const urlParams = new URLSearchParams(window.location.search);
      const zoneLabelParameter = urlParams.get('zoneLabel');
      const floorZoneX1Parameter = urlParams.get('floorZoneX1');
      const floorZoneY1Parameter = urlParams.get('floorZoneY1');
      const floorZoneX2Parameter = urlParams.get('floorZoneX2');
      const floorZoneY2Parameter = urlParams.get('floorZoneY2');
      const selectedCameraForSetupParameter = urlParams.get('selectedCameraForSetup');
      const thresholdParameter = urlParams.get('threshold');
      const CameraSetupX1Parameter = urlParams.get('CameraSetupX1');
      const CameraSetupY1Parameter = urlParams.get('CameraSetupY1');
      const CameraSetupX2Parameter = urlParams.get('CameraSetupX2');
      const CameraSetupY2Parameter = urlParams.get('CameraSetupY2');
      const selectedCameraParameter = urlParams.get('selectedCamera');
      
      const saveDataAndNavigate   = () => {
        var storeAPI = process.env.REACT_APP_STORE_API_URL || "/StoreApi";
        
        // Send data to the backend via POST - Create Zone
        fetch(storeAPI + '/zones', {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            "name": zoneLabelParameter,
            "description": "",
            "x1": Number(floorZoneX1Parameter),
            "y1": Number(floorZoneY1Parameter),
            "x2": Number(floorZoneX2Parameter),
            "y2": Number(floorZoneY2Parameter)
          })
        });

        // Send data to the backend via POST - Create Zone
        fetch(storeAPI + '/regions', {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'Content-Type': 'application/json'
          },
          // body: '{\n  "name": "Camera3",\n  "description": "Camera3",\n  "rtspuri": "rtsp://rtsp_stream_container:8554/stream"\n}',
          body: JSON.stringify({
            "name": zoneLabelParameter,
            "description": "",
            "camera_id": 1,
            "x1": Number(CameraSetupX1Parameter),
            "y1": Number(CameraSetupY1Parameter),
            "x2": Number(CameraSetupX2Parameter),
            "y2": Number(selectedCameraParameter),
            "threshold": Number(thresholdParameter)
          })
        });

        navigate("/cameraszones");

      }
    return (
        <FluentProvider theme={webLightTheme}>
        <CopilotProvider mode='sidecar'>
          <Header callParentFunction={toggleCerebralDrawer}/>
          <Main className={styles.main}>
          <Panel
            isOpen={isCerebralDrawerOpen}
            onDismiss={toggleCerebralDrawer}
            type={PanelType.custom}
            customWidth="30%"
            headerText=""
            onRenderHeader={() => (
              <CerebralHeader 
                title="Cerebral" 
                onClose={toggleCerebralDrawer} 
              />
            )}
            isFooterAtBottom={true}
            hasCloseButton={true}
            closeButtonAriaLabel="Close"
            isLightDismiss={true}            
            >
              <CerebralChatWithAudio {...({} as ChatInputProps)}/>
          </Panel>             
          <Stack.Item>
              <SideMenu />
          </Stack.Item>
          <Stack.Item grow={4}>
          <Breadcrumb className={styles.breadcrumb}>
            <BreadcrumbItem className={styles.breadcrumbitem}>Cameras and Zones</BreadcrumbItem>
            <BreadcrumbItem className={styles.breadcrumbitem}> &gt; Zones</BreadcrumbItem>
            <BreadcrumbItem className={styles.breadcrumbitem}>&gt; Setup zones</BreadcrumbItem>
          </Breadcrumb>
            {/* Add the wizard status here */}
            <Stack horizontal>
            <Stack.Item>         
            <WizardNavigation 
              activeIndex = {4}
              />            
          </Stack.Item>
          <Stack.Item grow={3}>
          <Stack>
                <Text className={styles.wizardheader}>Review summary</Text>
                <Text className={styles.wizardtext}>Use the drawing tools provided to outline different areas on the floor plan. Simply click and drag to draw shapes that represent various zones within the store.</Text>
                <Stack>
                    <Stack.Item>           
                    </Stack.Item>
                    <Stack.Item>
                    <Stack style={{marginLeft: '30px'}} tokens={stackTokens}>
                      {/* Preview area */}
                      <Stack.Item>
                          <Text className={styles.reviewitemheading}>Floor plan</Text>
                      </Stack.Item>

                      {/* Main content area */}
                      <Stack id='zones'>
                        <Stack.Item>
                          <Text className={styles.reviewitemheading}>Zones</Text>
                          <Stack>
                            <Stack horizontal className={styles.reviewitem}>
                              <Text className={styles.reviewitemname}> Zone 1</Text>
                              <Text className={styles.reviewitemvalue}> {zoneLabelParameter}</Text>
                            </Stack>
                          </Stack>
                          {/* <Stack>
                            <Stack horizontal className={styles.reviewitem}>
                              <Text className={styles.reviewitemname}> Zone 2</Text>
                              <Text className={styles.reviewitemvalue}> Seafood</Text>
                            </Stack>
                          </Stack>    
                          <Stack>
                            <Stack horizontal className={styles.reviewitem}>
                              <Text className={styles.reviewitemname}> Zone 3</Text>
                              <Text className={styles.reviewitemvalue}> Deli</Text>
                            </Stack>
                          </Stack> 
                          <Stack>
                            <Stack horizontal className={styles.reviewitem}>
                              <Text className={styles.reviewitemname}> Zone 4</Text>
                              <Text className={styles.reviewitemvalue}> Checkout lanes</Text>
                            </Stack>
                          </Stack> 
                          <Stack>
                            <Stack horizontal className={styles.reviewitem}>
                              <Text className={styles.reviewitemname}> Zone 5</Text>
                              <Text className={styles.reviewitemvalue}> Enterance</Text>
                            </Stack>
                          </Stack>                                                                                                                                */}
                        </Stack.Item>
                      </Stack>
                      <Stack id='cameras'>
                        <Stack.Item>
                          <Text className={styles.reviewitemheading}>Cameras </Text>
                          <Stack>
                            <Stack horizontal className={styles.reviewitem}>
                              <Text className={styles.reviewitemname}> Camera 1</Text>
                              <Text className={styles.reviewitemvalue}> {selectedCameraParameter}</Text>
                            </Stack>
                          </Stack>                          
                          <Stack>
                            <Stack horizontal className={styles.reviewitem}>
                              <Text className={styles.reviewitemname}> Camera 2</Text>
                              <Text className={styles.reviewitemvalue}> {selectedCameraForSetupParameter}</Text>
                            </Stack>
                          </Stack>
                          {/* <Stack>
                            <Stack horizontal className={styles.reviewitem}>
                              <Text className={styles.reviewitemname}> Camera 3</Text>
                              <Text className={styles.reviewitemvalue}> Cam-003-north-enterance</Text>
                            </Stack>
                          </Stack>                                                                               */}
                        </Stack.Item>
                      </Stack>                      
                      {/* Footer */}
                      {/* Search and Add buttons */}
                    </Stack>                        
                    </Stack.Item>
                </Stack>
            </Stack>
          </Stack.Item>
          </Stack>
          <Stack>
            <Stack.Item></Stack.Item>

          </Stack>
          <div className={styles.footer}>
            <Stack horizontal>
            <Button appearance="secondary" className={styles.footerpreviousbutton}onClick={() => navigate("/camerazoneswizardsetupcamera")}>Previous</Button>
            <Button appearance="primary" className={styles.footernextbutton} onClick={() => saveDataAndNavigate()}>Save</Button>
          </Stack>
          </div>
          </Stack.Item>
          </Main>
          <Footer />
        </CopilotProvider>
      </FluentProvider>
    );
  };
  
  export default CamerasZonesWizardReview;
