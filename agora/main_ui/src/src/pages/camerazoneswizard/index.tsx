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
  tokens
} from "@fluentui/react-components";
import { useNavigate } from "react-router-dom";
import Header from '../../components/MaintenanceWorkerHeader';
import SideMenu from "../../components/MaintenanceMenu";
import Footer from '../../components/SuiteFooter';
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
const CamerasZonesWizard = () => {
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

      const stackTokens: IStackTokens = { childrenGap: 10 };
      const navigate = useNavigate();
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
      const toggleCerebralDrawer = () => {
        setIsCerebralDrawerOpen(!isCerebralDrawerOpen);
      };      
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
              activeIndex = {1}
            />
          </Stack.Item>
          <Stack.Item grow={3}>
            <Stack>
                <Text className={styles.wizardheader}>Upload floor plan file</Text>
                <Text className={styles.wizardtext}>Upload a high-quality floor plan to monitor your store and prevent losses. This allows precise placement of security cameras, ensuring coverage of all areas, including high-traffic zones, entry and exit points, and vulnerable spots.</Text>
                <Stack>
                    <Stack.Item>
                        <Stack tokens={{ childrenGap: 10 }}>
                    <Label required>Upload file
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M8.49902 7.49998C8.49902 7.22384 8.27517 6.99998 7.99902 6.99998C7.72288 6.99998 7.49902 7.22384 7.49902 7.49998V10.5C7.49902 10.7761 7.72288 11 7.99902 11C8.27517 11 8.49902 10.7761 8.49902 10.5V7.49998ZM8.74807 5.50001C8.74807 5.91369 8.41271 6.24905 7.99903 6.24905C7.58535 6.24905 7.25 5.91369 7.25 5.50001C7.25 5.08633 7.58535 4.75098 7.99903 4.75098C8.41271 4.75098 8.74807 5.08633 8.74807 5.50001ZM8 1C4.13401 1 1 4.13401 1 8C1 11.866 4.13401 15 8 15C11.866 15 15 11.866 15 8C15 4.13401 11.866 1 8 1ZM2 8C2 4.68629 4.68629 2 8 2C11.3137 2 14 4.68629 14 8C14 11.3137 11.3137 14 8 14C4.68629 14 2 11.3137 2 8Z" fill="#424242"/>
                        </svg>
                        </Label>
                    <div {...getRootProps({ className: styles.dropzone })}>
                        <input {...getInputProps()} />
                    <Stack horizontalAlign="center" tokens={{ childrenGap: 10 }}>
                        <Text className={styles.icon}>📄+</Text>
                        <Text>
                        {isDragActive
                        ? 'Drop the files here'
                        : 'Drag and drop files here or'}
                        </Text>
                        <PrimaryButton disabled text="Browse files" onClick={() => {}} />
                    </Stack>
                    </div>
                        </Stack>                        
                    </Stack.Item>
                    <Stack.Item>
                    <Stack style={{border: '1px solid #ccc'}} tokens={stackTokens}>
                      {/* Preview area */}
                      <Stack.Item>
                          <Text style={{fontSize: '16px', fontWeight: '400', lineHeight: '22px', color: '#000', textAlign: 'center'}}>Preview area</Text>
                          <div style={{ flexShrink: '0', width: '865', height: 575, border: '1px solid #D9D9D9', marginBottom: 20, backgroundImage: `url('Floorplan.png')`, backgroundSize: 'cover', }} />
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
          <Button appearance="secondary" className={styles.footerpreviousbutton}>Previous</Button>
          <Button appearance="primary" className={styles.footernextbutton} onClick={() => navigate("/camerazoneswizardfloor")}>Next</Button>
          </Stack>
          </div>
          </Stack.Item>
          </Main>
          <Footer />
        </CopilotProvider>
      </FluentProvider>
    );
  };
  
  export default CamerasZonesWizard;
