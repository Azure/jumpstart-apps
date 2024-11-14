import React, { useState, useEffect, useRef}  from 'react';
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
  ToolbarButton,
  ToolbarDivider,
  Popover,
  PopoverSurface,
  PopoverTrigger,

} from "@fluentui/react-components";
import { Dropdown, IDropdownStyles, IDropdownOption } from '@fluentui/react/lib/Dropdown';
import {
  MathFormatLinear24Regular,
  CalligraphyPen24Regular,
  ArrowUndo24Regular,
  ArrowRedo24Regular,
  DeleteRegular,
  DrawerRegular,
} from "@fluentui/react-icons";
import type { ToolbarProps } from "@fluentui/react-components";
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
      dropDown: {
        width: '312px',
        marginLeft: '0px'
      }       
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
const CamerasZonesWizardFloor: React.FC = () => {
    var storeAPI = process.env.REACT_APP_STORE_API_URL || "/StoreApi";
    var footfallAIAPI = process.env.REACT_APP_FOOTFALL_API || "/FootfallApi";
    const styles = useStyles();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isCerebralDrawerOpen, setIsCerebralDrawerOpen] = useState(false);
    const [cameraNameInputValue, setCameraNameInputValue] = React.useState('');
    const [floorZoneX1, setfloorZoneX1] = useState(0);
    const [floorZoneY1, setfloorZoneY1] = useState(0);
    const [floorZoneX2, setfloorZoneX2] = useState(0);
    const [floorZoneY2, setfloorZoneY2] = useState(0);
    const saveAndNavigate= () => {
      navigate("/camerazoneswizardsetupcamera");      
    }
    const toggleCerebralDrawer = () => {
      setIsCerebralDrawerOpen(!isCerebralDrawerOpen);
    };  
    
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
      const handleCameraDropdownChange = (event: React.FormEvent<HTMLDivElement>, option?: IDropdownOption, index?: number) =>{
        setCameraEndpointInputValue(option?.key.toString() || '');
        document.getElementById('txtCameraStorage')?.setAttribute("value", option?.text.toString() || '');        
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
      ///TOP
      class MousePosition {
        public x: number = 0 ;
        public y: number = 0 ;
      }

      const [isDrawing, setIsDrawing] = useState(false);
      const canvasRef = useRef<HTMLCanvasElement>(null);
      //const start: MousePosition;
      let x = 0;
      let y = 0;
      let hasDrawn = false;
      let [start, setStart] = useState({});      
      const getMousePos = (e:React.MouseEvent<HTMLCanvasElement, MouseEvent>) => {
        var rect = e.currentTarget.getBoundingClientRect(),
        scaleX =  e.currentTarget.width / rect.width,
        scaleY =  e.currentTarget.height / rect.height;
    
        return {
        x: Math.floor((e.clientX - rect.left) * scaleX),
        y: Math.floor((e.clientY - rect.top) * scaleY)
        }
    }               
      useEffect(
        () => {
          // define the resize function, which uses the re
          const resize = () => {
            const canvas = canvasRef.current;
            if (canvas) {
              canvas.width = window.innerWidth;
              canvas.height = window.innerHeight;
            }
          };
    
          // call resize() once.
          resize();
    
          // attach event listeners.
          window.addEventListener("resize", resize);
    
          // remove listeners on unmount.
          return () => {
            window.removeEventListener("resize", resize);
          };
        },
        [] // no dependencies means that it will be called once on mount.
      );
      const onSaveDrawer  = () => {
        var txtZoneLabel = document.getElementById('txtZoneLabel')?.getAttribute('value');
      // Send data to the backend via POST
        setIsDrawerOpen(false);
        var txtFloorZoneX1 = document.getElementById('txtFloorZoneX1')?.getAttribute('value');
        var txtFloorZoneY1 = document.getElementById('txtFloorZoneY1')?.getAttribute('value');
        var txtFloorZoneX2 = document.getElementById('txtFloorZoneX2')?.getAttribute('value');
        var txtFloorZoneY2 = document.getElementById('txtFloorZoneY2')?.getAttribute('value');   
        var txtselectedCamera = document.getElementById('txtCameraStorage')?.getAttribute('value');  
        var txtZoneLabel = document.getElementById('txtZoneLabel')?.getAttribute('value'); 
        navigate("/camerazoneswizardsetupcamera?zoneLabel=" + txtZoneLabel + "&floorZoneX1=" + txtFloorZoneX1 + "&floorZoneY1=" + txtFloorZoneY1 + "&floorZoneX2=" + txtFloorZoneX2 + "&floorZoneY2=" + txtFloorZoneY2 + "&selectedCamera=" + txtselectedCamera + "");
      }
      const onRenderFooterContent = React.useCallback(
        () => (
          <Stack horizontal tokens={{ childrenGap: 10 }}>
            <PrimaryButton onClick={onSaveDrawer}>Done</PrimaryButton>
            <DefaultButton onClick={onCancelDrawer}>Cancel</DefaultButton>
          </Stack>
        ),
        []
      );
      const onCancelDrawer = () => {
        setIsDrawerOpen(false);
      };      
      const DropdownOptions:IDropdownOption[] = [];      
    // API integration code
    type DataItem = {
      id: number;
      name: string;
      description: string;
      rtspuri: string;
    };    
    const dataItems: DataItem[] = [
    ];
    
    const [data, setData] = useState([]);
    useEffect(() => {
      fetch( storeAPI + '/cameras')
        .then(response => response.json())
        .then(json => setData(json))
        .then()
        .catch(error => console.error(error));
    }, []);    
    data.forEach(
      function(d){
        var newDataItem: DataItem = {
          id: d["id"] ,
          name: d["name"],
          description: d["description"],
          rtspuri: d["rtspuri"],
        };
        dataItems.push(newDataItem);      
        DropdownOptions.push({key: newDataItem.rtspuri, text: newDataItem.name});
       }
    )       
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
          <Panel
            isOpen={isDrawerOpen}
            onDismiss={toggleDrawer}
            type={PanelType.custom}
            customWidth="25%"
            headerText="Zone details"
            onRenderFooterContent={onRenderFooterContent}
            isFooterAtBottom={true}
            hasCloseButton={true}
            closeButtonAriaLabel="Close"
            isLightDismiss={true}
      >
        <Stack>
            <Stack.Item style={{ marginTop: '20px', marginBottom: '20px'}}>
               
                <input type='text' id='txtFloorZoneX1' value={floorZoneX1.toString()} style={{display: 'none'}}></input>
                <input type='text' id='txtFloorZoneY1' value={floorZoneY1.toString()} style={{display: 'none'}}></input>
                <input type='text' id='txtFloorZoneX2' value={floorZoneX2.toString()} style={{display: 'none'}}></input> 
                <input type='text' id='txtFloorZoneY2' value={floorZoneY2.toString()} style={{display: 'none'}}></input>                                      
                <TextField
                  label="Zone label"
                  value={cameraNameInputValue}
                  onChange={handleCameraNameInputChange}
                  placeholder="Name your zone"
                  id="txtZoneLabel"
                />        
                <input type='text' id='txtCameraStorage' style={{display: 'none'}}></input>
            </Stack.Item>
            <Stack.Item>
            <Stack>
                          <Text>Select Camera</Text>
                          <Dropdown
                            onChange={handleCameraDropdownChange}
                            placeholder="Select a camera"
                            className={styles.dropDown}
                            options={DropdownOptions}>
                            id="selectedCamera"
                          </Dropdown>                         
                        </Stack> 
            </Stack.Item>
        </Stack>
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
              activeIndex = {2}
              />         
          </Stack.Item>
          <Stack.Item grow={3}>
            <Stack>
                <Text className={styles.wizardheader}>Draw floor zones</Text>
                <Text className={styles.wizardtext}>Use the drawing tools provided to outline different areas on the floor plan. Simply click and drag to draw shapes that represent various zones within the store.</Text>
                <Stack>
                    <Stack.Item>
                        <Stack tokens={{ childrenGap: 10 }}>
                          <Toolbar size="large">
                            <ToolbarButton aria-label="Insert image" icon={<CalligraphyPen24Regular />}>Draw</ToolbarButton>
                            <ToolbarButton
                              appearance="primary"
                              icon={<ArrowUndo24Regular />}
                              aria-label="Insert Table"
                            >
                              Undo
                            </ToolbarButton>
                            <ToolbarButton
                              aria-label="Insert Formula"
                              icon={<ArrowRedo24Regular />}
                            >Redo</ToolbarButton>
                            <ToolbarDivider />
                            <ToolbarButton
                             icon={<DeleteRegular />}
                            >
                              Delete
                            </ToolbarButton>
                          </Toolbar>
                        </Stack>                        
                    </Stack.Item>
                    <Stack.Item>
                    <Stack style={{border: '1px solid #ccc'}} tokens={stackTokens}>
                      {/* Preview area */}
                      <Stack.Item>
                          <Text style={{fontSize: '16px',  width: "865px", display: 'block',  fontWeight: '400', lineHeight: '22px', color: '#000', textAlign: 'center', backgroundColor: '#D9D9D9'}}>Preview area</Text>
                          <canvas id="videoCanvas"
                              ref={canvasRef}
                              style={{
                              width: "865px",
                              height: "575px",
                              background: "url('Floorplan.png')",
                              backgroundSize: 'cover'
                            }}
                            onMouseDown={(e) => {
                              // know that we are drawing, for future mouse movements.
                              setIsDrawing(true);
                              const context = e.currentTarget.getContext("2d");
                              if(context) {
                                const mouseValue = getMousePos(e);
                                setStart(mouseValue);
                                let {x, y} = getMousePos( e);
                                // begin path.
                                if (context) {
                                  context.beginPath();
                                  context.lineWidth = 6;
                                  context.lineCap = "round";
                                  context.strokeStyle = "#9747FF69";
                                  context.fillStyle = "#9747FF14"
                                  context.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
                                }
                              }}
                            }
                            onMouseMove={(e) => {
                            }}
                            onMouseUp={(e) => {
                              // end drawing.
                              // only handle mouse moves when the mouse is already down.
                              if (isDrawing) {
                                const context = e.currentTarget.getContext("2d");
                                if (context) {
                                  let end: MousePosition = getMousePos(e);  
                                  const values = Object.values(start);
                                  const startX = values[0];
                                  const startY = values[1];
                                  context.rect(Number(startX),Number(startY), end.x - Number(startX), end.y - Number(startY));
                                  context.fillRect(Number(startX),Number(startY), end.x - Number(startX), end.y - Number(startY));
                                  context.stroke();
                                  setfloorZoneX1(Number(startX));
                                  setfloorZoneY1(Number(startY));
                                  setfloorZoneX2(end.x - Number(startX));
                                  setfloorZoneY2(end.y - Number(startY));
                                }
                              }                             
                              setIsDrawing(false);
                              setIsDrawerOpen(true);
                            }}
                            ></canvas>
                      </Stack.Item>

                      {/* Main content area */}
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
          <Button appearance="secondary" className={styles.footerpreviousbutton} onClick={() => navigate("/camerazoneswizard")}>Previous</Button>
          <Button appearance="primary" className={styles.footernextbutton} onClick={() => saveAndNavigate()}>Next</Button>
          </Stack>
          </div>
          </Stack.Item>
          </Main>
          <Footer />
        </CopilotProvider>
      </FluentProvider>
    );
  };
  
  export default CamerasZonesWizardFloor;
