import React, { useEffect, useState }  from 'react';
import {
  FluentProvider,
  webLightTheme,
  Text,
  makeStyles,
  Radio,
  Label,
} from "@fluentui/react-components";
import Header from '../../components/MaintenanceWorkerHeader';
import SideMenu from "../../components/MaintenanceMenu";
import { ITag, Pivot, PivotItem, PrimaryButton, TagPicker, TextField } from '@fluentui/react';
import { IStackProps, IStackTokens, Stack } from "@fluentui/react";
import { Panel, PanelType, DefaultButton } from '@fluentui/react';
import Footer from '../../components/SuiteFooter';
import { ChatInputProps, CopilotProvider } from "@fluentui-copilot/react-copilot";
import logo from './logo.svg';
import '../../App.css';
import MaintenanceCameras from '../../components/MaintenanceCameras';
import MaintenanceZones from '../../components/MaintenanceZones';
import VideoStream from '../../components/VideoStream';
import CerebralChatWithAudio from '../../components/Chatter';
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
        }
      });

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
const CamerasZones: React.FC<CameraPanelProps> = ({ isOpen, onDismiss, onSave }) => {
    var storeAPI = process.env.REACT_APP_STORE_API_URL || "/StoreApi";
    var footfallAIAPI = process.env.REACT_APP_FOOTFALL_API || "/FootfallApi";
    const styles = useStyles();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isCerebralDrawerOpen, setIsCerebralDrawerOpen] = useState(false);
    const [cameraNameInputValue, setCameraNameInputValue] = React.useState('');
    const handleCameraNameInputChange = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
      setCameraNameInputValue(newValue || '');
    };
    const [dataForVideo, setDataForVideo] = React.useState('');

    const [cameraEndpointInputValue, setCameraEndpointInputValue] = React.useState('');
    const handleCameraEndpointInputChange = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string) => {
      setCameraEndpointInputValue(newValue || '');
      setDataForVideo(footfallAIAPI + "/video_feed?data={\"x\" : 0, \"y\" : 0,\"w\" : 0, \"h\" : 0, \"debug\" : false, \"cameraName\" : \"Nabeel\", \"video_url\": \"" + newValue +"\" }");
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

    const onSaveDrawer  = () => {
      var cameraName = document.getElementById('txtCameraName')?.getAttribute('value');
      var cameraEndpoint = document.getElementById('txtCameraEndpoint')?.getAttribute('value');
      var jsonData = {
        "name": cameraName,
        "description": cameraName,
        "rtspuri": cameraEndpoint
      }
      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jsonData),
      };

    // Send data to the backend via POST

    fetch(storeAPI + '/cameras', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json'
      },
      // body: '{\n  "name": "Camera3",\n  "description": "Camera3",\n  "rtspuri": "rtsp://rtsp_stream_container:8554/stream"\n}',
      body: JSON.stringify({
        'name': cameraName,
        'description': cameraName,
        'rtspuri': cameraEndpoint
      })
    });
      setIsDrawerOpen(false);
    }

    const onRenderFooterContent = React.useCallback(
      () => (
        <Stack horizontal tokens={{ childrenGap: 10 }}>
          <PrimaryButton onClick={onSaveDrawer}>Save</PrimaryButton>
          <DefaultButton onClick={onCancelDrawer}>Cancel</DefaultButton>
        </Stack>
      ),
      [onSave, onDismiss]
    );

    const onRenderCerebralFooterContent = React.useCallback(
      () => (
        <Stack horizontal tokens={{ childrenGap: 10 }}>
          {/* <PrimaryButton onClick={onSaveDrawer}>Save</PrimaryButton> */}
          <DefaultButton onClick={onCancelCerebralDrawer}>Close</DefaultButton>
        </Stack>
      ),
      []
    );
    const onFilterChanged = (filterText: string, tag: ITag) => {
      return tag.name.toLowerCase().startsWith(filterText.toLowerCase());
    };
    const onEmptyInputFocus = () => {
      return true;
    };
    
    const toggleDrawer = () => {
      setIsDrawerOpen(!isDrawerOpen);
    };

    const onCancelDrawer = () => {
      setIsDrawerOpen(false);
    };

    const toggleCerebralDrawer = () => {
      setIsCerebralDrawerOpen(!isCerebralDrawerOpen);
    };

    const onCancelCerebralDrawer = () => {
      setIsCerebralDrawerOpen(false);
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
          <Panel
            isOpen={isDrawerOpen}
            onDismiss={toggleDrawer}
            type={PanelType.custom}
            customWidth="25%"
            headerText="Add camera"
            onRenderFooterContent={onRenderFooterContent}
            isFooterAtBottom={true}
            hasCloseButton={true}
            closeButtonAriaLabel="Close"
            isLightDismiss={true}
      >
        <Stack>
            <Stack.Item>
              <div className={styles.cameraimagecontainer}>
                <div className={styles.cameraimage}>Camera Feed
                <VideoStream
                  title="" 
                  videoUrl={dataForVideo} />
                </div>
              </div>
            </Stack.Item>
            <Stack.Item>
              <Radio label="Add region" type='radio' />
            </Stack.Item>
            <Stack.Item>
                <TextField
                  label="Camera name"
                  value={cameraNameInputValue}
                  onChange={handleCameraNameInputChange}
                  placeholder="Enter camera name"
                  id="txtCameraName"
                />
            </Stack.Item>
            <Stack.Item>
            <TextField
                  label="Camera endpoint"
                  value={cameraEndpointInputValue}
                  onChange={handleCameraEndpointInputChange}
                  placeholder="Enter the URL"
                  id="txtCameraEndpoint"
                />
            </Stack.Item>
            <Stack.Item>
            <Label>Direction tag</Label>
            </Stack.Item>
            <Stack.Item>
            <TagPicker
              onResolveSuggestions={onResolveSuggestions}
              selectedItems={tags}
              onChange={onTagsChange}
              pickerSuggestionsProps={{
                suggestionsHeaderText: 'Suggested tags',
                noResultsFoundText: 'No tags found',
              }}
              itemLimit={5} // Optional: set a limit to the number of tags
            />
            </Stack.Item>
        </Stack>
          </Panel>
          <Stack.Item>
              <SideMenu />
          </Stack.Item>
          <Stack.Item grow={3}>
          <Pivot className={styles.pivotStyles}>
            <PivotItem headerText="Cameras">
              <div>
                {/* Content for Cameras tab */}
                <MaintenanceCameras callParentFunction={toggleDrawer}/>
              </div>
            </PivotItem>
            <PivotItem headerText="Zones">
              <div>
                {/* Content for Zones tab */}
                <MaintenanceZones/>
              </div>
            </PivotItem>
          </Pivot>
          </Stack.Item>
          </Main>
          <Footer />
        </CopilotProvider>
      </FluentProvider>
    );
  };
  
  export default CamerasZones;
