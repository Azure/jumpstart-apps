import React, { useState } from 'react';
import { MoreHorizontal20Regular } from "@fluentui/react-icons";
import { VerticalBarChart, IVerticalBarChartProps, IVerticalBarChartDataPoint } from '@fluentui/react-charting';
import { Checkbox, ChoiceGroup, IChoiceGroupOption, Label, Stack, TextField, PrimaryButton, IStackStyles, IStackTokens } from '@fluentui/react';
import { Panel, PanelType, DefaultButton } from '@fluentui/react';
import {
    Card,
    CardFooter,
    CardHeader,
    CardPreview,
    Text,
    makeStyles,
    Button,
    Link,
    tokens,
    Switch,
    mergeClasses,    
    MessageBar,
    MessageBarActions,
    MessageBarBody,
    MessageBarTitle,
    Subtitle1,Input,
    Caption1
  } from "@fluentui/react-components";
  interface IStyledLineChartExampleState {
    width: number;
    height: number;
  }
const useStyles = makeStyles({
    main: {
        gap: "36px",
        display: "flex",
        flexDirection: "column",
        flexWrap: "wrap",
      },
      addtocartbutton: {
        display: 'flex',
        width: '200px',
        height: '30px',
        flexShrink: 0,
        color: '#000000',
        fontFamily: 'var(--Font-family-Base, "Segoe UI")',
        fontSize: 'var(--Font-size-400, 16px)',
        fontStyle: 'normal',
        padding: 'var(--Vertical-S, 8px) var(--Horizontal-L, 16px)',
        borderRadius: '4px',
        background: '#FFFFFF00',
        fontweight: '600',
        marginLeft: '10px',
        marginTop: '20px',
        justifyContent: 'center',
        gap: '6px',
        border: 'var(--Thin, 1px) solid #D1D1D1',
      },
      cardnew: {
        width: "100%",
        maxWidth: "100%",
        marginBottom: "5px",
        marginTop: "5px",
      },
      card: {
        width: "100%",
        maxWidth: "700px",
        height: "100%",
        border: "1px solid #E0E0E0",
        borderRadius: "8px",
      },
      cardsmall: {
        display: "flex",
        width: "350px",
        height: "250px",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        flexShrink: "0",
        borderRadius: "4px",
        border: "1px solid TransparentStroke.Rest",
        background: "NeutralBackground1.Rest",
        boxShadow: "0px 2px 4px 0px rgba(0, 0, 0, 0.14), 0px 0px 2px 0px rgba(0, 0, 0, 0.12)",
        marginLeft: '93px',
        marginRight: '16px',
      },
      cardpreviewtext: {
          color: "var(--Text-Primary, #323130)",
          textAlign: "center",
          fontfeaturesettings: "'liga' off, 'clig' off",
          fontfamily: tokens.fontFamilyBase,
          fontsize: tokens.fontSizeHero800,
          fontstyle: "normal",
          fontweight: tokens.fontWeightRegular,
          lineHeight: tokens.lineHeightHero900
      },      
      cardfooter: {
        display: "flex",
        padding: "var(--card-Vertical, 12px) var(--card-Horizontal, 12px)",
        justifyContent: "center",
        alignItems: "flex-start",
        gap: "var(--card-Gap, 12px)",
        flex: "1 0 0",
        alignSelf: "stretch",
      },
      cardfootercontent: {
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: "var(--card-Gap, 12px)",
        flex: "1 0 0",
      },
      cardfootertitlecontenttext: {
        display: "flex",
        paddingBottom: "2px",
        alignItems: "flex-start",
        alignSelf: "stretch",
        color: "NeutralForeground1.Rest",
        fontFamily: "var(--Font-family-Base, 'Segoe UI')",
        fontSize: "var(--Font-size-300, 14px)",
        fontStyle: "normal",
        fontWeight: "600",
        lineHeight: "var(--Line-height-300, 20px)",
      },
      cardfootersubtitlecontenttext: {
        overflow: "hidden",
        color: "NeutralForeground3.Rest",
        textOverflow: "ellipsis",

/* Web/Caption 1 */
        fontFamily: "var(--Font-family-Base, 'Segoe UI')",
        fontSize: "var(--Font-size-200, 12px)",
        fontStyle: "normal",
        fontWeight: "400",
        lineHeight: "var(--Line-height-200, 16px)",
      },
      horizontalCardImage: {
        width: "64px",
        height: "64px",
      },
      cardheaderheader: {
        color: '#242424',
        flex: '1 0 0',
        /* Web/Body 1 Strong */
        fontFamily: 'var(--Font-family-Base, "Segoe UI")',
        fontSize: 'var(--Font-size-300, 14px)',
        fontStyle: 'normal',
        fontWeight: '600',
        lineHeight: 'var(--Line-height-300, 20px)', /* 142.857% */
        width: '300px',
        marginTop: '10px'
      },
      cardheaderdescription: {
        color: '#616161',
        flex: '1 0 0',
        /* Web/Body 1 Strong */
        fontFamily: 'var(--Font-family-Base, "Segoe UI")',
        fontSize: 'var(--Font-size-200, 12px)',
        fontStyle: 'normal',
        fontWeight: '400',
        lineHeight: 'var(--Line-height-200, 16px)', /* 142.857% */
        textOverflow: 'ellipsis'
      },  
      explorecategories: {
        width: "100%",
        height: "47px",
        flexShrink: 0,
        color: "NeutralForeground1.Rest",
        fontFamily: "var(--Font-family-Base, 'Segoe UI')",
        fontSize: "var(--Font-size-700, 28px)",
        fontStyle: "normal",
        fontWeight: "600",
        lineHeight: "var(--Line-height-700, 36px)",
        textAlign: "left",
        alignSelf: "stretch",
      },
      categories: {
        width: "200px",
        height: "340px",
        marginTop: '26px',
        gap: '26px'
      },
      categorytext: {
        color: '#242424',
        textAlign: 'center',
        alignSelf: 'stretch',
        fontFamily: 'var(--Font-family-Base, "Segoe UI")',
        fontSize: 'var(--Font-size-300, 14px)',
        fontStyle: 'normal',
        fontWeight: 400,
        lineHeight: 'var(--Line-height-300, 20px)',
      },
      explorecategoriessection: {
        marginTop: '26px',
      },
      cartbutton: {
        display: 'inline-flex',
        padding: 'var(--Vertical-XXS, 2px) var(--Horizontal-S, 8px)',
        justifyCcontent: 'center',
        alignItems: 'center',
        gap: 'var(--Horizontal-XS, 4px)',    
        borderRadius: 'var(--button-corner-radius, 4px)',
        background: '#FFFFFF00',
        width: '45px',
        height: '30px',
        flexShrink: 0,
        fontFamily: 'var(--Font-family-Base, "Segoe UI")',
        fontSize: 'var(--Font-size-200, 12px)',
        fontStyle: 'normal',
        fontweight: '400',
        marginLeft: '0px',
        color: '#424242'
      },
      ContainerBoxHeading: {
          "font-size": "14px",
          "font-family": "var(--Font-family-Base, 'Segoe UI')",
          "font-style": "normal",
          "font-weight": "600",
          "color": "#000",
          "line-height": "20px",
      },
      ContainerBoxTopDivider: {
          "width": "100%",
          "height": "1px",
          "background-color": "#C4C4C4",
          "flex-shrink": "0",
      },
        caption: {
          color: tokens.colorNeutralForeground3,
        },
});
const childStackStyles = {
  root: {
    
  },
};
const stackTokens: IStackTokens = { childrenGap: 10 };
const categoryStyles = {
  root: {
    width: '200px',
    height: '200px',
    paddingBottom: '8px',
    paddingLeft: '8px',
    paddingRight: '8px',
    paddingTop: '8px',
  },
};
interface CartPanelProps {
    isOpen: boolean;
    onDismiss: () => void;
    onSave: () => void;
  }   
const ActiveCart: React.FC = () => {
    const classes  = useStyles();
    const styles = useStyles();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);        
    const toggleDrawer = () => {
        setIsDrawerOpen(!isDrawerOpen);
      };
      const containerStyles: IStackStyles = {
        root: {
          width: '100%',
          boxSizing: 'border-box',
          background: '#F3FDF8',
          height: '50px',
          borderBottom: '1px solid #E0E0E0',
          borderTop: '1px solid #E0E0E0',
          marginBottom: '48px',
          marginTop: '8px'
        },
      };
    
      // Styles for the individual Stack items
      const itemStyles: IStackStyles = {
        root: {
          alignItems: 'flex-start',
          textAlign: 'center',
          height: '32px',
          width: '140px',
          verticalAlign: 'middle',
          padding: '10px 10px',
          background: '#FFFFFF00',
        },
      };
      const onSaveDrawer  = () => {
        // var cameraName = document.getElementById('txtCameraName')?.getAttribute('value');
        // var cameraEndpoint = document.getElementById('txtCameraEndpoint')?.getAttribute('value');
        // var jsonData = {
        //   "name": cameraName,
        //   "description": cameraName,
        //   "rtspuri": cameraEndpoint
        // }
        // const requestOptions = {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(jsonData),
        // };
  
      // // Send data to the backend via POST
  
      // fetch(storeAPI + '/cameras', {
      //   method: 'POST',
      //   headers: {
      //     'accept': 'application/json',
      //     'Content-Type': 'application/json'
      //   },
      //   // body: '{\n  "name": "Camera3",\n  "description": "Camera3",\n  "rtspuri": "rtsp://rtsp_stream_container:8554/stream"\n}',
      //   body: JSON.stringify({
      //     'name': cameraName,
      //     'description': cameraName,
      //     'rtspuri': cameraEndpoint
      //   })
      // });
        setIsDrawerOpen(false);
      }
      const onCancelDrawer = () => {
        setIsDrawerOpen(false);
      };
    const onRenderFooterContent = React.useCallback(
    () => (
        <Stack horizontal tokens={{ childrenGap: 10 }}>
        <PrimaryButton onClick={onSaveDrawer}>Go to checkout($25.45)</PrimaryButton>
        <DefaultButton onClick={onCancelDrawer}>Clear cart</DefaultButton>
        </Stack>
    ),
    []
    );  
    return (
      <Stack>
      <Stack.Item>
      <Stack horizontal styles={containerStyles} tokens={stackTokens}>
        <Stack.Item grow styles={itemStyles}>
          <Stack horizontal>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M4 1C4.36429 1 4.70583 1.09739 5 1.26757C5.29418 1.09739 5.63571 1 6 1C7.10457 1 8 1.89543 8 3V4H8.5C8.77614 4 9 4.22386 9 4.5V9C9 10.1046 8.10457 11 7 11H3C2.65312 11 2.32686 10.9117 2.04248 10.7563C1.42133 10.417 1 9.75768 1 9V4.5C1 4.22386 1.22386 4 1.5 4H2V3C2 1.89543 2.89543 1 4 1ZM3 4H5V3C5 2.44772 4.55228 2 4 2C3.44772 2 3 2.44772 3 3V4ZM6 3V4H7V3C7 2.44772 6.55228 2 6 2C5.91376 2 5.83008 2.01092 5.75025 2.03144C5.90938 2.3184 6 2.64862 6 3ZM9 3.08535V3H12.2505C13.217 3 14.0005 3.7835 14.0005 4.75V6.00006L14.8824 5.99994C15.4506 5.99986 15.9701 6.32087 16.2242 6.82912L17.8422 10.0651C17.9464 10.2734 18.0006 10.5031 18.0006 10.7359V14.4999C18.0006 15.3283 17.329 15.9999 16.5006 15.9999H14.9505C14.7189 17.141 13.71 18 12.5005 18C11.291 18 10.2821 17.1411 10.0505 16H8.95048C8.71884 17.1411 7.70997 18 6.50049 18C5.29101 18 4.28213 17.1411 4.0505 16H3.79248C2.82598 16 2.04248 15.2165 2.04248 14.25V11.8439C2.34318 11.9452 2.66518 12 3 12H7C8.65685 12 10 10.6569 10 9V4.5C10 3.84689 9.5826 3.29127 9 3.08535ZM14.0005 7.00006V9.99994H16.6916L15.3298 7.27633C15.2451 7.10692 15.0719 6.99991 14.8825 6.99994L14.0005 7.00006ZM6.50049 14C5.67206 14 5.00049 14.6716 5.00049 15.5C5.00049 16.3284 5.67206 17 6.50049 17C7.32892 17 8.00049 16.3284 8.00049 15.5C8.00049 14.6716 7.32892 14 6.50049 14ZM11.0005 15.5C11.0005 16.3284 11.6721 17 12.5005 17C13.3289 17 14.0005 16.3284 14.0005 15.5C14.0005 14.6716 13.3289 14 12.5005 14C11.6721 14 11.0005 14.6716 11.0005 15.5Z" fill="#0E700E"/>
          </svg>                                
            <Text>Good news!</Text>
            <Text>Your first delivery is free!</Text>
          </Stack>
        </Stack.Item>
      </Stack>

      </Stack.Item>
      <Stack.Item>
        <Stack id='cardlist'>
          <Stack>
              <Stack>
                <Stack horizontal className={styles.cardnew} id='cardContainer'>
                  <Stack id='imageContainer'>
                  <img
                    className={styles.horizontalCardImage}
                    src={"Tomatoesonvine.png"}
                    alt="App Name Document"
                  />
                  </Stack>
                  <Stack id='itemDescription'>
                    <Stack style={{width: '100%', marginLeft: '12px'}}>
                      <Text className={styles.cardheaderheader}>Tomatoes on vine</Text>
                      <Text className={styles.cardheaderdescription}>Qty: 2</Text>
                    </Stack>
                  </Stack>
                  <Stack id='price' horizontal style={{width: '350px', marginLeft: '12px'}}>
                    <Text> $5.99</Text>
                    <Input type='number' size='small' />
                  </Stack>
                </Stack>
              </Stack>
              <Stack id='buttons' horizontal>
              <Button className={styles.cartbutton}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M14.4432 5.56066C13.6956 4.81311 12.4836 4.81311 11.7361 5.56067L11.1853 6.11145C11.1719 6.12232 11.1589 6.134 11.1465 6.14647C11.134 6.15894 11.1223 6.17191 11.1114 6.18531L5.65036 11.6465C5.58074 11.7161 5.53323 11.8047 5.51377 11.9012L5.00987 14.4012C4.97681 14.5652 5.02796 14.7349 5.14614 14.8533C5.26432 14.9716 5.43387 15.0231 5.59792 14.9903L8.10183 14.4903C8.19868 14.471 8.28763 14.4234 8.35747 14.3536L14.4432 8.26776C15.1907 7.52021 15.1907 6.3082 14.4432 5.56066ZM11.5019 7.20904L12.7948 8.50193L7.75746 13.5394L6.13854 13.8626L6.46423 12.2468L11.5019 7.20904ZM13.5019 7.79482L12.209 6.50192L12.4432 6.26777C12.8002 5.91074 13.379 5.91074 13.7361 6.26777C14.0931 6.62479 14.0931 7.20363 13.7361 7.56066L13.5019 7.79482Z" fill="#424242"/>
                </svg>                                 
                Edit
              </Button>                                            
              <Button className={styles.cartbutton}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M9 7H11C11 6.44772 10.5523 6 10 6C9.44772 6 9 6.44772 9 7ZM8 7C8 5.89543 8.89543 5 10 5C11.1046 5 12 5.89543 12 7L14.5 7C14.7761 7 15 7.22386 15 7.5C15 7.77614 14.7761 8 14.5 8H14.059L13.6158 13.1708C13.5271 14.2054 12.6614 15 11.6231 15H8.37693C7.33857 15 6.47291 14.2054 6.38424 13.1708L5.94102 8H5.5C5.22386 8 5 7.77614 5 7.5C5 7.22386 5.22386 7 5.5 7L8 7ZM11.5 10C11.5 9.72386 11.2761 9.5 11 9.5C10.7239 9.5 10.5 9.72386 10.5 10V12C10.5 12.2761 10.7239 12.5 11 12.5C11.2761 12.5 11.5 12.2761 11.5 12V10ZM9 9.5C9.27614 9.5 9.5 9.72386 9.5 10V12C9.5 12.2761 9.27614 12.5 9 12.5C8.72386 12.5 8.5 12.2761 8.5 12V10C8.5 9.72386 8.72386 9.5 9 9.5ZM7.38058 13.0854C7.42492 13.6027 7.85775 14 8.37693 14H11.6231C12.1423 14 12.5751 13.6027 12.6194 13.0854L13.0553 8H6.94469L7.38058 13.0854Z" fill="#424242"/>
                </svg>                             
                Remove
              </Button>           
              </Stack>
              <Stack style={{width: '592px', height: '1px', backgroundColor: '#E0E0E0'}}>
              </Stack>              
          </Stack>

          <Stack>
              <Stack>
                <Stack horizontal className={styles.cardnew} id='cardContainer'>
                  <Stack id='imageContainer'>
                  <img
                    className={styles.horizontalCardImage}
                    src={"Hierloom.png"}
                    alt="App Name Document"
                  />
                  </Stack>
                  <Stack id='itemDescription'>
                    <Stack style={{width: '100%', marginLeft: '12px'}}>
                      <Text className={styles.cardheaderheader}>Tomatoes on vine</Text>
                      <Text className={styles.cardheaderdescription}>Qty: 2</Text>
                    </Stack>
                  </Stack>
                  <Stack id='price' horizontal style={{width: '350px', marginLeft: '12px'}}>
                    <Text> $5.99</Text>
                    <Input type='number' size='small' />
                  </Stack>
                </Stack>
              </Stack>
              <Stack id='buttons' horizontal>
              <Button className={styles.cartbutton}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M14.4432 5.56066C13.6956 4.81311 12.4836 4.81311 11.7361 5.56067L11.1853 6.11145C11.1719 6.12232 11.1589 6.134 11.1465 6.14647C11.134 6.15894 11.1223 6.17191 11.1114 6.18531L5.65036 11.6465C5.58074 11.7161 5.53323 11.8047 5.51377 11.9012L5.00987 14.4012C4.97681 14.5652 5.02796 14.7349 5.14614 14.8533C5.26432 14.9716 5.43387 15.0231 5.59792 14.9903L8.10183 14.4903C8.19868 14.471 8.28763 14.4234 8.35747 14.3536L14.4432 8.26776C15.1907 7.52021 15.1907 6.3082 14.4432 5.56066ZM11.5019 7.20904L12.7948 8.50193L7.75746 13.5394L6.13854 13.8626L6.46423 12.2468L11.5019 7.20904ZM13.5019 7.79482L12.209 6.50192L12.4432 6.26777C12.8002 5.91074 13.379 5.91074 13.7361 6.26777C14.0931 6.62479 14.0931 7.20363 13.7361 7.56066L13.5019 7.79482Z" fill="#424242"/>
                </svg>                                 
                Edit
              </Button>                                            
              <Button className={styles.cartbutton}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M9 7H11C11 6.44772 10.5523 6 10 6C9.44772 6 9 6.44772 9 7ZM8 7C8 5.89543 8.89543 5 10 5C11.1046 5 12 5.89543 12 7L14.5 7C14.7761 7 15 7.22386 15 7.5C15 7.77614 14.7761 8 14.5 8H14.059L13.6158 13.1708C13.5271 14.2054 12.6614 15 11.6231 15H8.37693C7.33857 15 6.47291 14.2054 6.38424 13.1708L5.94102 8H5.5C5.22386 8 5 7.77614 5 7.5C5 7.22386 5.22386 7 5.5 7L8 7ZM11.5 10C11.5 9.72386 11.2761 9.5 11 9.5C10.7239 9.5 10.5 9.72386 10.5 10V12C10.5 12.2761 10.7239 12.5 11 12.5C11.2761 12.5 11.5 12.2761 11.5 12V10ZM9 9.5C9.27614 9.5 9.5 9.72386 9.5 10V12C9.5 12.2761 9.27614 12.5 9 12.5C8.72386 12.5 8.5 12.2761 8.5 12V10C8.5 9.72386 8.72386 9.5 9 9.5ZM7.38058 13.0854C7.42492 13.6027 7.85775 14 8.37693 14H11.6231C12.1423 14 12.5751 13.6027 12.6194 13.0854L13.0553 8H6.94469L7.38058 13.0854Z" fill="#424242"/>
                </svg>                             
                Remove
              </Button>           
              </Stack>
              <Stack style={{width: '592px', height: '1px', backgroundColor: '#E0E0E0'}}>
              </Stack>              
          </Stack>

          <Stack>
              <Stack>
                <Stack horizontal className={styles.cardnew} id='cardContainer'>
                  <Stack id='imageContainer'>
                  <img
                    className={styles.horizontalCardImage}
                    src={"RotelFinelyChoppedTomatoes.png"}
                    alt="App Name Document"
                  />
                  </Stack>
                  <Stack id='itemDescription'>
                    <Stack style={{width: '100%', marginLeft: '12px'}}>
                      <Text className={styles.cardheaderheader}>Finely chopped tomatoes, canned</Text>
                      <Text className={styles.cardheaderdescription}>Qty: 2</Text>
                    </Stack>
                  </Stack>
                  <Stack id='price' horizontal style={{width: '350px', marginLeft: '12px'}}>
                    <Text> $5.99</Text>
                    <Input type='number' size='small' />
                  </Stack>
                </Stack>
              </Stack>
              <Stack id='buttons' horizontal>
              <Button className={styles.cartbutton}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M14.4432 5.56066C13.6956 4.81311 12.4836 4.81311 11.7361 5.56067L11.1853 6.11145C11.1719 6.12232 11.1589 6.134 11.1465 6.14647C11.134 6.15894 11.1223 6.17191 11.1114 6.18531L5.65036 11.6465C5.58074 11.7161 5.53323 11.8047 5.51377 11.9012L5.00987 14.4012C4.97681 14.5652 5.02796 14.7349 5.14614 14.8533C5.26432 14.9716 5.43387 15.0231 5.59792 14.9903L8.10183 14.4903C8.19868 14.471 8.28763 14.4234 8.35747 14.3536L14.4432 8.26776C15.1907 7.52021 15.1907 6.3082 14.4432 5.56066ZM11.5019 7.20904L12.7948 8.50193L7.75746 13.5394L6.13854 13.8626L6.46423 12.2468L11.5019 7.20904ZM13.5019 7.79482L12.209 6.50192L12.4432 6.26777C12.8002 5.91074 13.379 5.91074 13.7361 6.26777C14.0931 6.62479 14.0931 7.20363 13.7361 7.56066L13.5019 7.79482Z" fill="#424242"/>
                </svg>                                 
                Edit
              </Button>                                            
              <Button className={styles.cartbutton}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M9 7H11C11 6.44772 10.5523 6 10 6C9.44772 6 9 6.44772 9 7ZM8 7C8 5.89543 8.89543 5 10 5C11.1046 5 12 5.89543 12 7L14.5 7C14.7761 7 15 7.22386 15 7.5C15 7.77614 14.7761 8 14.5 8H14.059L13.6158 13.1708C13.5271 14.2054 12.6614 15 11.6231 15H8.37693C7.33857 15 6.47291 14.2054 6.38424 13.1708L5.94102 8H5.5C5.22386 8 5 7.77614 5 7.5C5 7.22386 5.22386 7 5.5 7L8 7ZM11.5 10C11.5 9.72386 11.2761 9.5 11 9.5C10.7239 9.5 10.5 9.72386 10.5 10V12C10.5 12.2761 10.7239 12.5 11 12.5C11.2761 12.5 11.5 12.2761 11.5 12V10ZM9 9.5C9.27614 9.5 9.5 9.72386 9.5 10V12C9.5 12.2761 9.27614 12.5 9 12.5C8.72386 12.5 8.5 12.2761 8.5 12V10C8.5 9.72386 8.72386 9.5 9 9.5ZM7.38058 13.0854C7.42492 13.6027 7.85775 14 8.37693 14H11.6231C12.1423 14 12.5751 13.6027 12.6194 13.0854L13.0553 8H6.94469L7.38058 13.0854Z" fill="#424242"/>
                </svg>                             
                Remove
              </Button>           
              </Stack>
              <Stack style={{width: '592px', height: '1px', backgroundColor: '#E0E0E0'}}>
              </Stack>              
          </Stack>
          <Stack>
              <Stack>
                <Stack horizontal className={styles.cardnew} id='cardContainer'>
                  <Stack id='imageContainer'>
                  <img
                    className={styles.horizontalCardImage}
                    src={"Grapetomatoes.png"}
                    alt="App Name Document"
                  />
                  </Stack>
                  <Stack id='itemDescription'>
                    <Stack style={{width: '100%', marginLeft: '12px'}}>
                      <Text className={styles.cardheaderheader}>Tomatoes on vine</Text>
                      <Text className={styles.cardheaderdescription}>Qty: 2</Text>
                    </Stack>
                  </Stack>
                  <Stack id='price' horizontal style={{width: '350px', marginLeft: '12px'}}>
                    <Text> $5.99</Text>
                    <Input type='number' size='small' />
                  </Stack>
                </Stack>
              </Stack>
              <Stack id='buttons' horizontal>
              <Button className={styles.cartbutton}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M14.4432 5.56066C13.6956 4.81311 12.4836 4.81311 11.7361 5.56067L11.1853 6.11145C11.1719 6.12232 11.1589 6.134 11.1465 6.14647C11.134 6.15894 11.1223 6.17191 11.1114 6.18531L5.65036 11.6465C5.58074 11.7161 5.53323 11.8047 5.51377 11.9012L5.00987 14.4012C4.97681 14.5652 5.02796 14.7349 5.14614 14.8533C5.26432 14.9716 5.43387 15.0231 5.59792 14.9903L8.10183 14.4903C8.19868 14.471 8.28763 14.4234 8.35747 14.3536L14.4432 8.26776C15.1907 7.52021 15.1907 6.3082 14.4432 5.56066ZM11.5019 7.20904L12.7948 8.50193L7.75746 13.5394L6.13854 13.8626L6.46423 12.2468L11.5019 7.20904ZM13.5019 7.79482L12.209 6.50192L12.4432 6.26777C12.8002 5.91074 13.379 5.91074 13.7361 6.26777C14.0931 6.62479 14.0931 7.20363 13.7361 7.56066L13.5019 7.79482Z" fill="#424242"/>
                </svg>                                 
                Edit
              </Button>                                            
              <Button className={styles.cartbutton}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M9 7H11C11 6.44772 10.5523 6 10 6C9.44772 6 9 6.44772 9 7ZM8 7C8 5.89543 8.89543 5 10 5C11.1046 5 12 5.89543 12 7L14.5 7C14.7761 7 15 7.22386 15 7.5C15 7.77614 14.7761 8 14.5 8H14.059L13.6158 13.1708C13.5271 14.2054 12.6614 15 11.6231 15H8.37693C7.33857 15 6.47291 14.2054 6.38424 13.1708L5.94102 8H5.5C5.22386 8 5 7.77614 5 7.5C5 7.22386 5.22386 7 5.5 7L8 7ZM11.5 10C11.5 9.72386 11.2761 9.5 11 9.5C10.7239 9.5 10.5 9.72386 10.5 10V12C10.5 12.2761 10.7239 12.5 11 12.5C11.2761 12.5 11.5 12.2761 11.5 12V10ZM9 9.5C9.27614 9.5 9.5 9.72386 9.5 10V12C9.5 12.2761 9.27614 12.5 9 12.5C8.72386 12.5 8.5 12.2761 8.5 12V10C8.5 9.72386 8.72386 9.5 9 9.5ZM7.38058 13.0854C7.42492 13.6027 7.85775 14 8.37693 14H11.6231C12.1423 14 12.5751 13.6027 12.6194 13.0854L13.0553 8H6.94469L7.38058 13.0854Z" fill="#424242"/>
                </svg>                             
                Remove
              </Button>           
              </Stack>
              <Stack style={{width: '592px', height: '1px', backgroundColor: '#E0E0E0'}}>
              </Stack>              
          </Stack>                                                                                                                                                                                                                      
        </Stack>
      </Stack.Item>
      <Stack.Item>
      </Stack.Item>
      <Stack.Item>
      <Stack id='youmayalsolikecontainer'>
                        <Stack style={{width: '100%'}} className={styles.explorecategoriessection}>
                            <Text className={styles.explorecategories}>You may also like</Text>
                        </Stack>
                        <Stack id='youmayalsolikecontent' style={{width: '100%', alignContent: 'center'}}>
                            <Stack horizontal id='Categories' className={styles.categories}  style={{alignContent: 'center'}}>
                                <Stack styles={childStackStyles}>
                                <img src="HaasAvocado.png" alt="Category 1" style={categoryStyles.root} />
                                <Text className={styles.categorytext}>Hass avocado</Text>
                                <Text className={styles.categorytext}>$4.99 / lb</Text>
                                <Button className={styles.addtocartbutton}>
                                  <svg xmlns="http://www.w3.org/2000/svg" width="25" height="24" viewBox="0 0 25 24" fill="none">
                                    <path d="M3 4.25C3 3.83579 3.33579 3.5 3.75 3.5H4.30826C5.25873 3.5 5.82782 4.13899 6.15325 4.73299C6.37016 5.12894 6.52708 5.58818 6.64982 6.00395C6.68306 6.00134 6.71674 6 6.7508 6H19.2481C20.0783 6 20.6778 6.79442 20.4502 7.5928L18.6224 14.0019C18.2856 15.1832 17.2062 15.9978 15.9779 15.9978H10.0298C8.79128 15.9978 7.7056 15.1699 7.37783 13.9756L6.61734 11.2045L5.35874 6.95578L5.3567 6.94834C5.201 6.38051 5.05487 5.85005 4.83773 5.4537C4.62686 5.0688 4.45877 5 4.30826 5H3.75C3.33579 5 3 4.66421 3 4.25ZM8.07283 10.8403L8.82434 13.5786C8.97333 14.1215 9.46682 14.4978 10.0298 14.4978H15.9779C16.5362 14.4978 17.0268 14.1275 17.18 13.5906L18.9168 7.5H7.08549L8.05906 10.7868C8.06434 10.8046 8.06892 10.8224 8.07283 10.8403ZM11.5 19C11.5 20.1046 10.6046 21 9.5 21C8.39543 21 7.5 20.1046 7.5 19C7.5 17.8954 8.39543 17 9.5 17C10.6046 17 11.5 17.8954 11.5 19ZM10 19C10 18.7239 9.77614 18.5 9.5 18.5C9.22386 18.5 9 18.7239 9 19C9 19.2761 9.22386 19.5 9.5 19.5C9.77614 19.5 10 19.2761 10 19ZM18.5 19C18.5 20.1046 17.6046 21 16.5 21C15.3954 21 14.5 20.1046 14.5 19C14.5 17.8954 15.3954 17 16.5 17C17.6046 17 18.5 17.8954 18.5 19ZM17 19C17 18.7239 16.7761 18.5 16.5 18.5C16.2239 18.5 16 18.7239 16 19C16 19.2761 16.2239 19.5 16.5 19.5C16.7761 19.5 17 19.2761 17 19Z" fill="#242424"/>
                                  </svg>                                  
                                  Add to cart
                                  </Button>
                                </Stack>
                                <Stack styles={childStackStyles}>
                                <img src="FrenchBread.png" alt="Category 1" style={categoryStyles.root} />
                                <Text className={styles.categorytext}>French bread</Text>
                                <Text className={styles.categorytext}>$4.99 / lb</Text>
                                <Button className={styles.addtocartbutton}>
                                  <svg xmlns="http://www.w3.org/2000/svg" width="25" height="24" viewBox="0 0 25 24" fill="none">
                                    <path d="M3 4.25C3 3.83579 3.33579 3.5 3.75 3.5H4.30826C5.25873 3.5 5.82782 4.13899 6.15325 4.73299C6.37016 5.12894 6.52708 5.58818 6.64982 6.00395C6.68306 6.00134 6.71674 6 6.7508 6H19.2481C20.0783 6 20.6778 6.79442 20.4502 7.5928L18.6224 14.0019C18.2856 15.1832 17.2062 15.9978 15.9779 15.9978H10.0298C8.79128 15.9978 7.7056 15.1699 7.37783 13.9756L6.61734 11.2045L5.35874 6.95578L5.3567 6.94834C5.201 6.38051 5.05487 5.85005 4.83773 5.4537C4.62686 5.0688 4.45877 5 4.30826 5H3.75C3.33579 5 3 4.66421 3 4.25ZM8.07283 10.8403L8.82434 13.5786C8.97333 14.1215 9.46682 14.4978 10.0298 14.4978H15.9779C16.5362 14.4978 17.0268 14.1275 17.18 13.5906L18.9168 7.5H7.08549L8.05906 10.7868C8.06434 10.8046 8.06892 10.8224 8.07283 10.8403ZM11.5 19C11.5 20.1046 10.6046 21 9.5 21C8.39543 21 7.5 20.1046 7.5 19C7.5 17.8954 8.39543 17 9.5 17C10.6046 17 11.5 17.8954 11.5 19ZM10 19C10 18.7239 9.77614 18.5 9.5 18.5C9.22386 18.5 9 18.7239 9 19C9 19.2761 9.22386 19.5 9.5 19.5C9.77614 19.5 10 19.2761 10 19ZM18.5 19C18.5 20.1046 17.6046 21 16.5 21C15.3954 21 14.5 20.1046 14.5 19C14.5 17.8954 15.3954 17 16.5 17C17.6046 17 18.5 17.8954 18.5 19ZM17 19C17 18.7239 16.7761 18.5 16.5 18.5C16.2239 18.5 16 18.7239 16 19C16 19.2761 16.2239 19.5 16.5 19.5C16.7761 19.5 17 19.2761 17 19Z" fill="#242424"/>
                                  </svg>                                  
                                  Add to cart
                                  </Button>                                
                                </Stack>   
                            </Stack>
                            <Stack horizontal id='Categories' className={styles.categories}  style={{alignContent: 'center'}}>
                                <Stack styles={childStackStyles}>
                                <img src="ItalianBasil.png" alt="Category 1" style={categoryStyles.root} />
                                <Text className={styles.categorytext}>Italian basil</Text>
                                <Text className={styles.categorytext}>$4.99 / lb</Text>
                                <Button className={styles.addtocartbutton}>
                                  <svg xmlns="http://www.w3.org/2000/svg" width="25" height="24" viewBox="0 0 25 24" fill="none">
                                    <path d="M3 4.25C3 3.83579 3.33579 3.5 3.75 3.5H4.30826C5.25873 3.5 5.82782 4.13899 6.15325 4.73299C6.37016 5.12894 6.52708 5.58818 6.64982 6.00395C6.68306 6.00134 6.71674 6 6.7508 6H19.2481C20.0783 6 20.6778 6.79442 20.4502 7.5928L18.6224 14.0019C18.2856 15.1832 17.2062 15.9978 15.9779 15.9978H10.0298C8.79128 15.9978 7.7056 15.1699 7.37783 13.9756L6.61734 11.2045L5.35874 6.95578L5.3567 6.94834C5.201 6.38051 5.05487 5.85005 4.83773 5.4537C4.62686 5.0688 4.45877 5 4.30826 5H3.75C3.33579 5 3 4.66421 3 4.25ZM8.07283 10.8403L8.82434 13.5786C8.97333 14.1215 9.46682 14.4978 10.0298 14.4978H15.9779C16.5362 14.4978 17.0268 14.1275 17.18 13.5906L18.9168 7.5H7.08549L8.05906 10.7868C8.06434 10.8046 8.06892 10.8224 8.07283 10.8403ZM11.5 19C11.5 20.1046 10.6046 21 9.5 21C8.39543 21 7.5 20.1046 7.5 19C7.5 17.8954 8.39543 17 9.5 17C10.6046 17 11.5 17.8954 11.5 19ZM10 19C10 18.7239 9.77614 18.5 9.5 18.5C9.22386 18.5 9 18.7239 9 19C9 19.2761 9.22386 19.5 9.5 19.5C9.77614 19.5 10 19.2761 10 19ZM18.5 19C18.5 20.1046 17.6046 21 16.5 21C15.3954 21 14.5 20.1046 14.5 19C14.5 17.8954 15.3954 17 16.5 17C17.6046 17 18.5 17.8954 18.5 19ZM17 19C17 18.7239 16.7761 18.5 16.5 18.5C16.2239 18.5 16 18.7239 16 19C16 19.2761 16.2239 19.5 16.5 19.5C16.7761 19.5 17 19.2761 17 19Z" fill="#242424"/>
                                  </svg>                                  
                                  Add to cart
                                  </Button>                                
                                </Stack>
                                <Stack styles={childStackStyles}>
                                <img src="GreenOlivesJar.png" alt="Category 1" style={categoryStyles.root} />
                                <Text className={styles.categorytext}>Green olives, jar</Text>
                                <Text className={styles.categorytext}>$4.99 / lb</Text>
                                <Button className={styles.addtocartbutton}>
                                  <svg xmlns="http://www.w3.org/2000/svg" width="25" height="24" viewBox="0 0 25 24" fill="none">
                                    <path d="M3 4.25C3 3.83579 3.33579 3.5 3.75 3.5H4.30826C5.25873 3.5 5.82782 4.13899 6.15325 4.73299C6.37016 5.12894 6.52708 5.58818 6.64982 6.00395C6.68306 6.00134 6.71674 6 6.7508 6H19.2481C20.0783 6 20.6778 6.79442 20.4502 7.5928L18.6224 14.0019C18.2856 15.1832 17.2062 15.9978 15.9779 15.9978H10.0298C8.79128 15.9978 7.7056 15.1699 7.37783 13.9756L6.61734 11.2045L5.35874 6.95578L5.3567 6.94834C5.201 6.38051 5.05487 5.85005 4.83773 5.4537C4.62686 5.0688 4.45877 5 4.30826 5H3.75C3.33579 5 3 4.66421 3 4.25ZM8.07283 10.8403L8.82434 13.5786C8.97333 14.1215 9.46682 14.4978 10.0298 14.4978H15.9779C16.5362 14.4978 17.0268 14.1275 17.18 13.5906L18.9168 7.5H7.08549L8.05906 10.7868C8.06434 10.8046 8.06892 10.8224 8.07283 10.8403ZM11.5 19C11.5 20.1046 10.6046 21 9.5 21C8.39543 21 7.5 20.1046 7.5 19C7.5 17.8954 8.39543 17 9.5 17C10.6046 17 11.5 17.8954 11.5 19ZM10 19C10 18.7239 9.77614 18.5 9.5 18.5C9.22386 18.5 9 18.7239 9 19C9 19.2761 9.22386 19.5 9.5 19.5C9.77614 19.5 10 19.2761 10 19ZM18.5 19C18.5 20.1046 17.6046 21 16.5 21C15.3954 21 14.5 20.1046 14.5 19C14.5 17.8954 15.3954 17 16.5 17C17.6046 17 18.5 17.8954 18.5 19ZM17 19C17 18.7239 16.7761 18.5 16.5 18.5C16.2239 18.5 16 18.7239 16 19C16 19.2761 16.2239 19.5 16.5 19.5C16.7761 19.5 17 19.2761 17 19Z" fill="#242424"/>
                                  </svg>                                  
                                  Add to cart
                                  </Button>                                
                                </Stack>   
                            </Stack>                                                
                            </Stack>                                                                          
                        </Stack>                              
      </Stack.Item>
      <Stack.Item>
      </Stack.Item>
      <Stack.Item>
      </Stack.Item>
  </Stack>
    );
  };
  
  export default ActiveCart;