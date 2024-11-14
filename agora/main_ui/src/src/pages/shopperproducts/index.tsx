import React, { useEffect, useState } from 'react';
import {
  FluentProvider,
  webLightTheme,
  makeStyles,
  tokens,
  Body1,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbButton,
  Caption1,
  useId,
  Dropdown,
  DropdownProps,
  Input,
  Button,
} from "@fluentui/react-components";
import { useNavigate } from "react-router-dom";
import Header from '../../components/ShopperHeader';
import TopNav from '../../components/ShopperTopNav';
import ShopperProdcutsInteraction from '../../components/ShopperProdcutsInteraction';
import Footer from '../../components/ShopperFooter';
import ActiveCart from '../../components/ActiveCart';
import { CopilotProvider } from "@fluentui-copilot/react-copilot";
import { IDropdownOption, IImageProps, IStackProps, IStackTokens, Stack,   PrimaryButton, Image, Text, IStackStyles} from "@fluentui/react";
import { Panel, PanelType, DefaultButton } from '@fluentui/react';
import {CerebralChatWithAudio} from '../../components/Chatter';
import CerebralHeader from '../../components/CerebralHeader';
import type { ChatInputProps } from "@fluentui-copilot/react-chat-input";
import {
  Card,
  CardFooter,
  CardHeader,
  CardPreview
} from "@fluentui/react-components";
import SideMenu from '../../components/ShopperFilterbox';
import { registerIcons } from '@fluentui/react/lib/Styling';
import { initializeIcons } from "@fluentui/react/lib/Icons";
initializeIcons();

registerIcons({
  icons: {
    'CustomIconName': (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M3 4.25C3 3.83579 3.33579 3.5 3.75 3.5H4.30826C5.25873 3.5 5.82782 4.13899 6.15325 4.73299C6.37016 5.12894 6.52708 5.58818 6.64982 6.00395C6.68306 6.00134 6.71674 6 6.7508 6H19.2481C20.0783 6 20.6778 6.79442 20.4502 7.5928L18.6224 14.0019C18.2856 15.1832 17.2062 15.9978 15.9779 15.9978H10.0298C8.79128 15.9978 7.7056 15.1699 7.37783 13.9756L6.61734 11.2045L5.35874 6.95578L5.3567 6.94834C5.201 6.38051 5.05487 5.85005 4.83773 5.4537C4.62686 5.0688 4.45877 5 4.30826 5H3.75C3.33579 5 3 4.66421 3 4.25ZM8.07283 10.8403L8.82434 13.5786C8.97333 14.1215 9.46682 14.4978 10.0298 14.4978H15.9779C16.5362 14.4978 17.0268 14.1275 17.18 13.5906L18.9168 7.5H7.08549L8.05906 10.7868C8.06434 10.8046 8.06892 10.8224 8.07283 10.8403ZM11.5 19C11.5 20.1046 10.6046 21 9.5 21C8.39543 21 7.5 20.1046 7.5 19C7.5 17.8954 8.39543 17 9.5 17C10.6046 17 11.5 17.8954 11.5 19ZM10 19C10 18.7239 9.77614 18.5 9.5 18.5C9.22386 18.5 9 18.7239 9 19C9 19.2761 9.22386 19.5 9.5 19.5C9.77614 19.5 10 19.2761 10 19ZM18.5 19C18.5 20.1046 17.6046 21 16.5 21C15.3954 21 14.5 20.1046 14.5 19C14.5 17.8954 15.3954 17 16.5 17C17.6046 17 18.5 17.8954 18.5 19ZM17 19C17 18.7239 16.7761 18.5 16.5 18.5C16.2239 18.5 16 18.7239 16 19C16 19.2761 16.2239 19.5 16.5 19.5C16.7761 19.5 17 19.2761 17 19Z" fill="white"/>
      </svg>
    ),
    'DropdownIcon': (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                            <path d="M4.21967 8.46967C4.51256 8.17678 4.98744 8.17678 5.28033 8.46967L12 15.1893L18.7197 8.46967C19.0126 8.17678 19.4874 8.17678 19.7803 8.46967C20.0732 8.76256 20.0732 9.23744 19.7803 9.53033L12.5303 16.7803C12.2374 17.0732 11.7626 17.0732 11.4697 16.7803L4.21967 9.53033C3.92678 9.23744 3.92678 8.76256 4.21967 8.46967Z" fill="#616161"/>
                                            </svg>
    ),
  },
});
const useStyles = makeStyles({
    main: {
        gap: "36px",
        display: "flex",
        flexDirection: "column",
        flexWrap: "wrap",
      },
      checkoutbutton: {
        display: 'flex',
        width: '250px',
        height: '30px',
        flexShrink: 0,
        color: '#FFF',
        fontFamily: 'var(--Font-family-Base, "Segoe UI")',
        fontSize: 'var(--Font-size-400, 16px)',
        fontStyle: 'normal',
        padding: 'var(--Vertical-S, 8px) var(--Horizontal-L, 16px)',
        borderRadius: '4px',
        background: '#085108',
        fontweight: '600',
        marginLeft: '10px',
      },
      cardnew: {
        width: "500px",
        maxWidth: "100%",
        height: "64px",
        marginBottom: "5px",
        boxShadow: '',
      },
      card: {
        display: "flex",
        width: "600px",
        height: "400px",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        flexShrink: "0",
        borderRadius: "4px",
        border: "1px solid TransparentStroke.Rest",
        background: "NeutralBackground1.Rest",
        boxShadow: "0px 2px 4px 0px rgba(0, 0, 0, 0.14), 0px 0px 2px 0px rgba(0, 0, 0, 0.12)",
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
        width: "100%",
        height: "154px",
        marginTop: '26px',
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
      ordersection: {
        marginTop: '71px',
        marginBottom: '154px',
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
    productname: {
      width: '300px',
      height: '28px',
      flexShrink: 0,
      color: '#000',
      fontFamily: 'var(--Font-family-Base, "Segoe UI")',
      fontSize: 'var(--Font-size-400, 16px)',
      fontStyle: 'normal',
      fontWeight: 600,
      lineHeight: 'var(--Line-height-400, 22px)',
    },
    productprice: {
      width: '177px',
      height: '30px',
      flexShrink: 0,
      color: '#000',
      fontFamily: 'var(--Font-family-Base, "Segoe UI")',
      fontSize: 'var(--Font-size-400, 16px)',
      fontStyle: 'normal',
      fontWeight: 400,
      lineHeight: 'var(--Line-height-400, 22px)',
      fontfamily: 'var(--Font-family-Base, "Segoe UI")',
      fontsize: 'var(--Font-size-400, 16px)',
      lineheight: 'var(--Line-height-400, 22px)' /* 137.5% */      
    },
    addtocartbutton: {
      display: 'flex',
      width: '164px',
      height: '30px',
      flexShrink: 0,
      color: '#FFF',
      fontFamily: 'var(--Font-family-Base, "Segoe UI")',
      fontSize: 'var(--Font-size-400, 16px)',
      fontStyle: 'normal',
      padding: 'var(--Vertical-S, 8px) var(--Horizontal-L, 16px)',
      borderRadius: '4px',
      background: '#085108',
      fontweight: '600',
      marginLeft: '10px',
    },
    cartbutton: {
      display: 'inline-flex',
      padding: 'var(--Vertical-XXS, 2px) var(--Horizontal-S, 8px)',
      justifyCcontent: 'center',
      alignItems: 'center',
      gap: 'var(--Horizontal-XS, 4px)',    
      borderRadius: 'var(--button-corner-radius, 4px)',
      background: '#FFFFFF00',
      width: '164px',
      height: '30px',
      flexShrink: 0,
      fontFamily: 'var(--Font-family-Base, "Segoe UI")',
      fontSize: 'var(--Font-size-400, 16px)',
      fontStyle: 'normal',
      fontweight: '600',
      marginLeft: '10px',
      color: '#424242'
    },
    dropdown: {
      width: '100px',
      height: '30px',
      flexShrink: 0,
      color: '#000',
      fontFamily: 'var(--Font-family-Base, "Segoe UI")',
      fontSize: 'var(--Font-size-400, 16px)',
      fontStyle: 'normal',
      fontWeight: 400,
      maxWidth: '125px'
    },
    productdetails: {
      marginRight: '100px'
    }
    });
    const childStackStyles = {
      root: {
        width: '14.28%', // 100% / 7 for equal width
        height: '100%',
        
      },
    };

    const categoryStyles = {
      root: {
        width: '152px',
        height: '100%',
        paddingBottom: '8px',
        paddingLeft: '8px',
        paddingRight: '8px',
        paddingTop: '8px',
      },
    };
    const stackTokens: IStackTokens = { childrenGap: 10 };
    const weightOptions: IDropdownOption[] = [
      { key: '0.5', text: '0.5 lb' },
      { key: '1', text: '1 lb' },
      { key: '1.5', text: '1.5 lb' },
      { key: '2', text: '2 lb' },
    ];
    
    const imageProps: IImageProps = {
      src: 'tomato-on-vine-image.png',
      alt: 'Tomatoes on vine',
      width: 300,
      height: 300,
    };


    const californiaSundriedTomatoeProps: IImageProps = {
        src: 'CaliforniaSundriedTomatoes.png',
        alt: 'CaliforniaSundriedTomatoes',
        width: 300,
        height: 300,
      };

    const rotelFinelyChoppedTomatoesProps: IImageProps = {
        src: 'RotelFinelyChoppedTomatoes.png',
        alt: 'RotelFinelyChoppedTomatoes',
        width: 300,
        height: 300,
      };
      
      const grapetomatoesProps: IImageProps = {
        src: 'Grapetomatoes.png',
        alt: 'Grapetomatoes',
        width: 300,
        height: 300,
      };
      
      const tomatoesonvineProps: IImageProps = {
        src: 'Tomatoesonvine.png',
        alt: 'Tomatoesonvine',
        width: 300,
        height: 300,
      };
      
      const HierloomProps: IImageProps = {
        src: 'Hierloom.png',
        alt: 'Hierloom',
        width: 300,
        height: 300,
      };
      interface CartPanelProps {
        isOpen: boolean;
        onDismiss: () => void;
        onSave: () => void;
      }    
      
    const ShopperProducts: React.FC<CartPanelProps> = ({ isOpen, onDismiss, onSave },props: Partial<DropdownProps>) => {
        const [isDrawerOpen, setIsDrawerOpen] = useState(false);        
        const toggleDrawer = () => {
            setIsDrawerOpen(!isDrawerOpen);
          };

          const onRenderFooterContent = React.useCallback(
            () => (
                <Stack horizontal tokens={{ childrenGap: 10 }}>
              <PrimaryButton className={styles.checkoutbutton} onClick={onCheckout}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M14.3557 2.59534C14.4445 2.48261 14.6098 2.46762 14.7175 2.56254L15.6385 3.37473L12.7383 7H14.6592L16.7648 4.36797L18.417 5.82489C18.5186 5.9145 18.5304 6.06873 18.4435 6.1727L17.7523 7H19.6965C20.1905 6.27893 20.0778 5.28948 19.4091 4.69984L15.7096 1.43749C14.9561 0.77305 13.7991 0.877958 13.1775 1.66709L8.9762 7H10.8858L14.3557 2.59534ZM16.25 14C15.8358 14 15.5 14.3358 15.5 14.75C15.5 15.1642 15.8358 15.5 16.25 15.5H18.25C18.6642 15.5 19 15.1642 19 14.75C19 14.3358 18.6642 14 18.25 14H16.25ZM4.5 7.25C4.5 6.83579 4.83579 6.5 5.25 6.5H8.37844L9.57 5H5.25C4.00736 5 3 6.00736 3 7.25V17.75C3 19.5449 4.45507 21 6.25 21H18.25C20.0449 21 21.5 19.5449 21.5 17.75V11.25C21.5 9.45507 20.0449 8 18.25 8L5.25 8C4.83579 8 4.5 7.66421 4.5 7.25ZM4.5 17.75V9.37197C4.73458 9.45488 4.98702 9.5 5.25 9.5H18.25C19.2165 9.5 20 10.2835 20 11.25V17.75C20 18.7165 19.2165 19.5 18.25 19.5H6.25C5.2835 19.5 4.5 18.7165 4.5 17.75Z" fill="white"/>
                </svg>Go to checkout ($25.45)
              </PrimaryButton>

                <DefaultButton onClick={onClearCart}>Clear cart</DefaultButton>
                </Stack>
            ),
            [onSave, onDismiss]
            );  
            const onCheckout = () => {
              navigate('/shopperreviewcart');  
            };
            const onClearCart = () => {
              setIsDrawerOpen(false);
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
      
      const dropdownId = useId("dropdown-default");
      const options = [
        "1/2 lb",
        "1 lb",
        "1.5 lb",
        "2 lb"
      ];      
        const styles = useStyles();

// API integration code
type DataItem = {
  productId: number;
  name: string;
  stock: string;
  photoPath: string;
  category: string;
};    
const dataItems: DataItem[] = [
];

const [data, setData] = useState([]);
useEffect(() => {
  fetch('/products.json')
    .then(response => response.json())
    .then(json => setData(json))
    .then()
    .catch(error => console.error(error));
}, []);    
const urlParams = new URLSearchParams(window.location.search);
const categoryParameter = urlParams.get('Category');
data.forEach(
  function(d){
    if(d["category"] === categoryParameter) {
    var newDataItem: DataItem = {
      productId: d["product_id"] ,
      name: d["name"],
      stock: d["stock"],
      photoPath: d["photo_path"],
      category: d["category"],
    };
    dataItems.push(newDataItem);      
   }
  }
) 
const navigate = useNavigate();
const productDetailsNavigation = (event: { currentTarget: { id: any; }; }) => {
  navigate('/shopperproductdetail?productId=' + event.currentTarget.id);  
}
const [isCerebralDrawerOpen, setIsCerebralDrawerOpen] = useState(false);
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

          return (
              <FluentProvider theme={webLightTheme}>
                <CopilotProvider mode='sidecar'>
                    <Stack>
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
                      customWidth="35%"
                      headerText="Cart"
                      onRenderFooterContent={onRenderFooterContent}
                      isFooterAtBottom={true}
                    >
                      <ActiveCart />
                      {/* <Stack>
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
                              <Card className={styles.cardnew} orientation="horizontal">
                                <CardPreview className={styles.horizontalCardImage}>
                                  <img
                                    className={styles.horizontalCardImage}
                                    src={"tomato-on-vine-image.png"}
                                    alt="App Name Document"
                                  />
                                </CardPreview>
                                <CardHeader
                                  header={<Stack horizontal style={{width: '100%'}}><Text className={styles.cardheaderheader}>Tomatoes on vine</Text><Text className={styles.cardheaderheader} style={{width: '50%', textAlign: 'center'}}> $5.99</Text></Stack>}
                                  description={
                                    <Caption1 className={styles.cardheaderdescription}>Qty: 2</Caption1>
                                  }>                                  
                                </CardHeader>  
                                <CardFooter>
                                <Input type='number' appearance='outline' size='small' />
                                </CardFooter>                             
                              </Card>
                              <Stack horizontal>
                                  <PrimaryButton  className={styles.cartbutton} iconProps={{ iconName: 'CustomIconName' }}>Edit</PrimaryButton>
                                  <PrimaryButton  className={styles.cartbutton} iconProps={{ iconName: 'CustomIconName'}}>Remove</PrimaryButton>                                
                              </Stack>
                              <Card className={styles.cardnew} orientation="horizontal">
                                <CardPreview className={styles.horizontalCardImage}>
                                  <img
                                    className={styles.horizontalCardImage}
                                    src={"Tomatoesonvine.png"}
                                    alt="App Name Document"
                                  />
                                </CardPreview>
                                <CardHeader
                                  header={<Stack horizontal style={{width: '100%'}}><Text className={styles.cardheaderheader}>Tomatoes on vine</Text><Text className={styles.cardheaderheader} style={{width: '50%', textAlign: 'center'}}> $5.99</Text></Stack>}
                                  description={
                                    <Caption1 className={styles.cardheaderdescription}>Qty: 2</Caption1>
                                  }>
                                </CardHeader>
                              </Card>
                              <Card className={styles.cardnew} orientation="horizontal">
                                <CardPreview className={styles.horizontalCardImage}>
                                  <img
                                    className={styles.horizontalCardImage}
                                    src={"Hierloom.png"}
                                    alt="App Name Document"
                                  />
                                </CardPreview>
                                <CardHeader
                                  header={<Stack horizontal style={{width: '100%'}}><Text className={styles.cardheaderheader}>Tomatoes on vine</Text><Text className={styles.cardheaderheader} style={{width: '50%', textAlign: 'center'}}> $5.99</Text></Stack>}
                                  description={
                                    <Caption1 className={styles.cardheaderdescription}>Qty: 3</Caption1>
                                  }>
                                </CardHeader>
                              </Card>
                              <Card className={styles.cardnew} orientation="horizontal">
                                <CardPreview className={styles.horizontalCardImage}>
                                  <img
                                    className={styles.horizontalCardImage}
                                    src={"RotelFinelyChoppedTomatoes.png"}
                                    alt="App Name Document"
                                  />
                                </CardPreview>
                                <CardHeader
                                  header={<Stack horizontal style={{width: '100%'}}><Text className={styles.cardheaderheader}>Tomatoes on vine</Text><Text className={styles.cardheaderheader} style={{width: '50%', textAlign: 'center'}}> $5.99</Text></Stack>}
                                  description={
                                    <Caption1 className={styles.cardheaderdescription}>Qty: 1</Caption1>
                                  }>
                                </CardHeader>
                              </Card>
                              <Card className={styles.cardnew} orientation="horizontal">
                                <CardPreview className={styles.horizontalCardImage}>
                                  <img
                                    className={styles.horizontalCardImage}
                                    src={"Grapetomatoes.png"}
                                    alt="App Name Document"
                                  />
                                </CardPreview>
                                <CardHeader
                                  header={<Stack horizontal style={{width: '100%'}}><Text className={styles.cardheaderheader}>Tomatoes on vine</Text><Text className={styles.cardheaderheader} style={{textAlign: 'center'}}> $5.99</Text></Stack>}
                                  description={
                                    <Caption1 className={styles.cardheaderdescription}>Qty: 1</Caption1>
                                  }>
                                </CardHeader>
                              </Card>                                                                                                                                                                                                
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
                                                <Stack horizontal id='Categories' className={styles.categories}  style={{width: '100%', alignContent: 'center'}}>
                                                    <Stack styles={childStackStyles}>
                                                    <img src="Tomatoesonvine.png" alt="Category 1" style={categoryStyles.root} />
                                                    <Text className={styles.categorytext}>Tomatoes, on vine</Text>
                                                    <Text className={styles.categorytext}>$4.99 / lb</Text>
                                                    </Stack>
                                                    <Stack styles={childStackStyles}>
                                                    <img src="Hierloom.png" alt="Category 1" style={categoryStyles.root} />
                                                    <Text className={styles.categorytext}>Tomatoes, on vine</Text>
                                                    <Text className={styles.categorytext}>$4.99 / lb</Text>
                                                    </Stack>   
                                                </Stack>
                                                <Stack horizontal id='Categories' className={styles.categories}  style={{width: '100%', alignContent: 'center'}}>
                                                    <Stack styles={childStackStyles}>
                                                    <img src="Tomatoesonvine.png" alt="Category 1" style={categoryStyles.root} />
                                                    <Text className={styles.categorytext}>Tomatoes, on vine</Text>
                                                    <Text className={styles.categorytext}>$4.99 / lb</Text>
                                                    </Stack>
                                                    <Stack styles={childStackStyles}>
                                                    <img src="Hierloom.png" alt="Category 1" style={categoryStyles.root} />
                                                    <Text className={styles.categorytext}>Tomatoes, on vine</Text>
                                                    <Text className={styles.categorytext}>$4.99 / lb</Text>
                                                    </Stack>   
                                                </Stack>                                                
                                                </Stack>                                                                          
                                            </Stack>                              
                          </Stack.Item>
                          <Stack.Item>
                          </Stack.Item>
                          <Stack.Item>
                          </Stack.Item>
                      </Stack> */}
                    </Panel>
                    <Header 
                          callParentFunction={toggleDrawer}
                          callCerebralParentFunction={toggleCerebralDrawer} 
                        />
                        <TopNav />
                        <Breadcrumb className={styles.breadcrumb}>
                            <BreadcrumbItem className={styles.breadcrumbitem}>
                            <BreadcrumbButton href={"shopper"} className={styles.breadcrumbitem}>Home</BreadcrumbButton>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                    <path d="M7.64582 4.14708C7.84073 3.95147 8.15731 3.9509 8.35292 4.14582L13.8374 9.6108C14.0531 9.82574 14.0531 10.1751 13.8374 10.39L8.35292 15.855C8.15731 16.0499 7.84073 16.0493 7.64582 15.8537C7.4509 15.6581 7.45147 15.3415 7.64708 15.1466L12.8117 10.0004L7.64708 4.85418C7.45147 4.65927 7.4509 4.34269 7.64582 4.14708Z" fill="#424242"/>
                                </svg>
                            </BreadcrumbItem>
                            <BreadcrumbItem className={styles.breadcrumbitem}>
                            <BreadcrumbButton href={"shopper"} className={styles.breadcrumbitem}>All categories </BreadcrumbButton>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                    <path d="M7.64582 4.14708C7.84073 3.95147 8.15731 3.9509 8.35292 4.14582L13.8374 9.6108C14.0531 9.82574 14.0531 10.1751 13.8374 10.39L8.35292 15.855C8.15731 16.0499 7.84073 16.0493 7.64582 15.8537C7.4509 15.6581 7.45147 15.3415 7.64708 15.1466L12.8117 10.0004L7.64708 4.85418C7.45147 4.65927 7.4509 4.34269 7.64582 4.14708Z" fill="#424242"/>
                                </svg>
                            </BreadcrumbItem>
                            <BreadcrumbItem className={styles.breadcrumbitem}> 
                            <BreadcrumbButton href={"shopper"} className={styles.breadcrumbitem}>Produce</BreadcrumbButton>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                    <path d="M7.64582 4.14708C7.84073 3.95147 8.15731 3.9509 8.35292 4.14582L13.8374 9.6108C14.0531 9.82574 14.0531 10.1751 13.8374 10.39L8.35292 15.855C8.15731 16.0499 7.84073 16.0493 7.64582 15.8537C7.4509 15.6581 7.45147 15.3415 7.64708 15.1466L12.8117 10.0004L7.64708 4.85418C7.45147 4.65927 7.4509 4.34269 7.64582 4.14708Z" fill="#424242"/>
                                </svg>
                            </BreadcrumbItem>
                            <BreadcrumbItem className={styles.breadcrumbitem}> {categoryParameter}</BreadcrumbItem>
                        </Breadcrumb>
                        <Stack id='MainContent' style={{alignItems: 'top', marginTop: '21px'}} horizontal>
                            <Stack.Item>
                                <SideMenu />
                            </Stack.Item>
                            <Stack.Item grow={4}>
                                <Stack>
                                    <Stack>
                                        <ShopperProdcutsInteraction />    
                                        <Stack id='productCollection'>
                                          <div id='container' style={{display: "flex", width: "100%", flexWrap: 'wrap'}}>
                                            {dataItems.map(item => (
                                                <div id='inner' style={{ width: "33%"}}>
                                                  <Stack tokens={stackTokens} id={item.productId.toString()} className={styles.productdetails} onClick={productDetailsNavigation}>
                                                      {/* <Image {...imageProps} /> */}
                                                      <Image  
                                                        src={item.photoPath}
                                                        alt='Tomatoes on vine'
                                                        width='300px'
                                                        height='300px' />
                                                      <Text variant="large" block className={styles.productname}>
                                                        {item.name}
                                                      </Text>
                                                      <Text variant="large" block className={styles.productprice}>
                                                      $4.99 / lb
                                                      </Text>
                                                      <Stack horizontal style={{alignItems: 'bottom'}}>
                                                          <Stack horizontal>       
                                                              <Stack>
                                                                  <label id={dropdownId}>Weight</label>
                                                                  <Dropdown
                                                                  aria-labelledby={dropdownId}
                                                                  className={styles.dropdown}
                                                                  placeholder="Select weight"
                                                                  {...props}
                                                                  >
                                                                  {options.map((option) => (
                                                                  <option key={option} value={option} disabled={option === "Ferret"}>
                                                                      {option}
                                                                  </option>
                                                                  ))}                                                  
                                                                  </Dropdown> 
                                                                  
                                                              </Stack>         
                                                              <div  style={{
                                                              display: 'flex',
                                                              flexDirection: 'column',
                                                              justifyContent: 'flex-end',
                                                              height: '100%'
                                                              }}>
                                                              <PrimaryButton className={styles.addtocartbutton} text="Add to cart" iconProps={{ iconName: 'CustomIconName' }}></PrimaryButton>
                                                              </div>
                                                          </Stack>       
                                                      </Stack>
                                                  </Stack>     
                                                </div>  
                                              ))
                                            }
                                          </div>                                          
                                        </Stack>                                                               
                                    </Stack>
                                </Stack>
                            </Stack.Item>
                            <Footer />
                        </Stack>
                    </Stack>
                </CopilotProvider>
              </FluentProvider>
    );
  };
  
  export default ShopperProducts;                
      