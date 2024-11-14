import React, { useState } from 'react';
import {
  FluentProvider,
  webLightTheme,
  makeStyles,
  tokens,
  Body1,
  Breadcrumb,
  BreadcrumbItem,
  Caption1,
  useId,
  Dropdown,
  DropdownProps,
  messageBarTitleClassNames,
  Button,
  TabList,
  Tab,
} from "@fluentui/react-components";
import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
} from "@fluentui/react-components";
import Header from '../../components/ShopperHeader';
import TopNav from '../../components/ShopperTopNav';
import ShopperProdcutsInteraction from '../../components/ShopperProdcutsInteraction';
import Footer from '../../components/ShopperFooter';
import { CopilotProvider } from "@fluentui-copilot/react-copilot";
import { IDropdownOption, IImageProps, IStackProps, IStackTokens, Stack,   PrimaryButton, Image, Text} from "@fluentui/react";
import { Panel, PanelType, DefaultButton } from '@fluentui/react';
import {
  Card,
  CardFooter,
  CardHeader,
  CardPreview
} from "@fluentui/react-components";
import SideMenu from '../../components/ShopperFilterbox';
import { registerIcons } from '@fluentui/react/lib/Styling';
import { MoreHorizontal20Regular } from "@fluentui/react-icons";
import CerebralChatWithAudio from '../../components/Chatter';
import type { ChatInputProps } from "@fluentui-copilot/react-chat-input";
import CerebralHeader from '../../components/CerebralHeader';
import { initializeIcons } from "@fluentui/react/lib/Icons";
initializeIcons();

const resolveAsset = (asset: string) => {
  const ASSET_URL =
    "https://raw.githubusercontent.com/microsoft/fluentui/master/packages/react-components/react-card/stories/src/assets/";

  return `${ASSET_URL}${asset}`;
};
registerIcons({
  icons: {
    'AddToCartIcon': (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M3 4.25C3 3.83579 3.33579 3.5 3.75 3.5H4.30826C5.25873 3.5 5.82782 4.13899 6.15325 4.73299C6.37016 5.12894 6.52708 5.58818 6.64982 6.00395C6.68306 6.00134 6.71674 6 6.7508 6H19.2481C20.0783 6 20.6778 6.79442 20.4502 7.5928L18.6224 14.0019C18.2856 15.1832 17.2062 15.9978 15.9779 15.9978H10.0298C8.79128 15.9978 7.7056 15.1699 7.37783 13.9756L6.61734 11.2045L5.35874 6.95578L5.3567 6.94834C5.201 6.38051 5.05487 5.85005 4.83773 5.4537C4.62686 5.0688 4.45877 5 4.30826 5H3.75C3.33579 5 3 4.66421 3 4.25ZM8.07283 10.8403L8.82434 13.5786C8.97333 14.1215 9.46682 14.4978 10.0298 14.4978H15.9779C16.5362 14.4978 17.0268 14.1275 17.18 13.5906L18.9168 7.5H7.08549L8.05906 10.7868C8.06434 10.8046 8.06892 10.8224 8.07283 10.8403ZM11.5 19C11.5 20.1046 10.6046 21 9.5 21C8.39543 21 7.5 20.1046 7.5 19C7.5 17.8954 8.39543 17 9.5 17C10.6046 17 11.5 17.8954 11.5 19ZM10 19C10 18.7239 9.77614 18.5 9.5 18.5C9.22386 18.5 9 18.7239 9 19C9 19.2761 9.22386 19.5 9.5 19.5C9.77614 19.5 10 19.2761 10 19ZM18.5 19C18.5 20.1046 17.6046 21 16.5 21C15.3954 21 14.5 20.1046 14.5 19C14.5 17.8954 15.3954 17 16.5 17C17.6046 17 18.5 17.8954 18.5 19ZM17 19C17 18.7239 16.7761 18.5 16.5 18.5C16.2239 18.5 16 18.7239 16 19C16 19.2761 16.2239 19.5 16.5 19.5C16.7761 19.5 17 19.2761 17 19Z" fill="white"/>
      </svg>
    ),
    'DropdownIcon': (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                                            <path d="M4.21967 8.46967C4.51256 8.17678 4.98744 8.17678 5.28033 8.46967L12 15.1893L18.7197 8.46967C19.0126 8.17678 19.4874 8.17678 19.7803 8.46967C20.0732 8.76256 20.0732 9.23744 19.7803 9.53033L12.5303 16.7803C12.2374 17.0732 11.7626 17.0732 11.4697 16.7803L4.21967 9.53033C3.92678 9.23744 3.92678 8.76256 4.21967 8.46967Z" fill="#616161"/>
                                            </svg>
    ),
    'AddtoListIcon':(
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M5.85355 4.35355C6.04882 4.15829 6.04882 3.84171 5.85355 3.64645C5.65829 3.45118 5.34171 3.45118 5.14645 3.64645L3.5 5.29289L2.85355 4.64645C2.65829 4.45118 2.34171 4.45118 2.14645 4.64645C1.95118 4.84171 1.95118 5.15829 2.14645 5.35355L3.14645 6.35355C3.34171 6.54882 3.65829 6.54882 3.85355 6.35355L5.85355 4.35355ZM8.5 5C8.22386 5 8 5.22386 8 5.5C8 5.77614 8.22386 6 8.5 6H17.5C17.7761 6 18 5.77614 18 5.5C18 5.22386 17.7761 5 17.5 5H8.5ZM8.5 10C8.22386 10 8 10.2239 8 10.5C8 10.7761 8.22386 11 8.5 11H17.5C17.7761 11 18 10.7761 18 10.5C18 10.2239 17.7761 10 17.5 10H8.5ZM8 15.5C8 15.2239 8.22386 15 8.5 15H17.5C17.7761 15 18 15.2239 18 15.5C18 15.7761 17.7761 16 17.5 16H8.5C8.22386 16 8 15.7761 8 15.5ZM5.85355 9.85355C6.04882 9.65829 6.04882 9.34171 5.85355 9.14645C5.65829 8.95118 5.34171 8.95118 5.14645 9.14645L3.5 10.7929L2.85355 10.1464C2.65829 9.95118 2.34171 9.95118 2.14645 10.1464C1.95118 10.3417 1.95118 10.6583 2.14645 10.8536L3.14645 11.8536C3.34171 12.0488 3.65829 12.0488 3.85355 11.8536L5.85355 9.85355ZM5.85355 14.1464C6.04882 14.3417 6.04882 14.6583 5.85355 14.8536L3.85355 16.8536C3.65829 17.0488 3.34171 17.0488 3.14645 16.8536L2.14645 15.8536C1.95118 15.6583 1.95118 15.3417 2.14645 15.1464C2.34171 14.9512 2.65829 14.9512 2.85355 15.1464L3.5 15.7929L5.14645 14.1464C5.34171 13.9512 5.65829 13.9512 5.85355 14.1464Z" fill="#242424"/>
      </svg>
    ),
    'ShareIcon': (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M13.3298 12.8377L17.8269 8.41512L17.8841 8.34968C18.0558 8.12058 18.0367 7.78916 17.8268 7.58283L13.3297 3.16165L13.268 3.10864C12.9078 2.83964 12.3776 3.09805 12.3776 3.57782V5.70757L12.153 5.72268C8.59039 6.00547 6.50344 8.25989 6.00472 12.3501C5.94067 12.8754 6.54318 13.2042 6.93261 12.8564C8.36448 11.5779 9.84382 10.784 11.3776 10.4657C11.6236 10.4147 11.871 10.3759 12.1199 10.3493L12.3776 10.3261V12.4216L12.3829 12.5039C12.4429 12.9566 12.992 13.1699 13.3298 12.8377ZM12.2263 6.72L13.3776 6.64256V4.61104L16.8238 7.99905L13.3776 11.3882V9.23223L12.022 9.35403L12.0136 9.35493C10.3113 9.53692 8.70337 10.2189 7.18674 11.3555C7.48493 10.0174 7.99417 9.01008 8.6632 8.28852C9.49235 7.39426 10.6526 6.84605 12.2263 6.72ZM5.5 4C4.11929 4 3 5.11929 3 6.5V14.5C3 15.8807 4.11929 17 5.5 17H13.5C14.8807 17 16 15.8807 16 14.5V13.5C16 13.2239 15.7761 13 15.5 13C15.2239 13 15 13.2239 15 13.5V14.5C15 15.3284 14.3284 16 13.5 16H5.5C4.67157 16 4 15.3284 4 14.5V6.5C4 5.67157 4.67157 5 5.5 5H8.5C8.77614 5 9 4.77614 9 4.5C9 4.22386 8.77614 4 8.5 4H5.5Z" fill="#242424"/>
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
        marginBottom: '90px'
      },
      categorytext: {
        color: '#242424',
        textAlign: 'left',
        alignSelf: 'stretch',
        fontFamily: 'var(--Font-family-Base, "Segoe UI")',
        fontSize: 'var(--Font-size-700, 28px)',
        fontStyle: 'normal',
        fontWeight: 600,
        lineHeight: 'var(--Line-height-700, 36px)',
      },
      explorecategoriessection: {
        marginTop: '0px',
      },
      ordersection: {
        marginBottom: '154px',
      },
      ordersummarysection: {
        width: '340px',
        height: '266px',
        flexshrink: '0',
        borderRadius: '10px',
        border: '1px solid #E6E6E6',
        background: '#FAFAFA'
      },
      ordercontentsection: {
        width: '500px',
      },
      ordersummarysectioncontainer: {
        marginTop: '23px',
        marginBottom: '23px',
      },
      ordersummarycontent: {
        color: '#000',
        width: '50%',
        /* Web/Caption 1 Strong */
        fontFamily: 'var(--Font-family-Base, "Segoe UI")',
        fontSize: 'var(--Font-size-200, 12px)',
        fontStyle: 'normal',
        fontWeight: '600',
        lineHeight: 'var(--Line-height-200, 16px)', /* 133.333% */
        display: 'flex',
        height: '41.532px',
        flexDirection: 'column',
        justifyContent: 'center',
        flexShrink: '0',
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
      width: '471px',
      height: '47px',
      flexShrink: 0,
      color: '#000',
      fontFamily: 'var(--Font-family-Base, "Segoe UI")',
      fontSize: 'var(--Font-size-600, 24px)',
      fontStyle: 'normal',
      fontWeight: 600,
      lineHeight: 'var(--Line-height-600, 32px)',
      marginTop: '14px'
    },
    productprice: {
      width: '190px',
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
    addtolistbutton: {
      display: 'flex',
      width: '160px',
      height: '30px',
      flexShrink: 0,
      color: '#242424',
      fontFamily: 'var(--Font-family-Base, "Segoe UI")',
      fontSize: 'var(--Font-size-400, 16px)',
      fontStyle: 'normal',
      padding: 'var(--Vertical-S, 8px) var(--Horizontal-L, 16px)',
      borderRadius: '4px',
      background: '#FFFFFF',
      fontweight: '600',
      marginLeft: '10px',
    },
    sharebutton: {
      display: 'flex',
      width: '164px',
      height: '30px',
      flexShrink: 0,
      color: '#242424',
      fontFamily: 'var(--Font-family-Base, "Segoe UI")',
      fontSize: 'var(--Font-size-400, 16px)',
      fontStyle: 'normal',
      padding: 'var(--Vertical-S, 8px) var(--Horizontal-L, 16px)',
      borderRadius: '4px',
      background: '#FFFFFF',
      fontweight: '600',
      marginLeft: '10px',
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
      maxWidth: '125px',
      marginBottom: '41px'
    },
    productdetails: {
      marginRight: '100px'
    },
    interaction: {
        display: 'flex',
        padding: '0px 8px',
        alignItems: 'center',
        gap: '4px',
        alignSelf: 'stretch',
        background: '#F3FDF8',
        verticalAlign: 'middle',
        alignContent: 'center',
        width: '140px',
        height: '32px'
    },
    savingscontainer :{
      display: 'flex',
      padding: '0px 8px',
      alignitems: 'center',
      gap: '4px',
      alignself: 'stretch',
      borderRadius: '4px',
      border: '1px solid #80215D',
      background: '#FBDDF0',
      height: '32px',
      alignItems: 'center',
      width: '150px'
    },
    savingstext : {
      color: '#80215D',
      /* Web/Body 1 */
      fontfamily: 'var(--Font-family-Base, "Segoe UI")',
      fontsize: 'var(--Font-size-300, 14px)',
      fontstyle: 'normal',
      fontweight: '400',
      lineheight: 'var(--Line-height-300, 20px)', /* 142.857% */
    },
    dividercontainer: {
      display: 'flex',
      width: '300px',
      height: '1px',
      justifycontent: 'center',
      alignitems: 'center',
      flexshrink: '0',
      marginTop: '20px',
      marginBottom: '20px',
    },
    divider: {
      width: '197px',
      height: '1px',
      flexshrink: '0',
      background: 'var(--Light-theme-Rest-Border-Default-Border-2, #E0E0E0)',
      alignContent: 'center'
    },
    root: {
      alignItems: "flex-start",
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-start",
    },
    horizontalCardImage: {
      width: "64px",
      height: "64px",
    },
    qrimage: {
      width: '120px',
      height: '120px',
      flexShrink: '0',
      marginTop: '50px',
      marginBottom: '46px',
      borderRadius: '4px',
      background: 'url(MicrosoftTeams-imageQR.png) lightgray 50% / cover no-repeat',    
      marginLeft: '107px',
      marginRight: '107px', 
    },
    caption: {
      color: tokens.colorNeutralForeground3,
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
    accordion: {
      display: 'flex',
      width: '340px',
      flexDirection: 'column',
      alignItems: 'flex-start',
      flexShrink: '0',
      borderRadius: 'var(--Medium, 4px)',
      marginTop: '36px',
    },
    text: { margin: "0" },
    });
    const childStackStyles = {
      root: {
        height: '100%',
        
      },
    };

    const categoryStyles = {
      root: {
        paddingBottom: '8px',
        paddingLeft: '8px',
        paddingRight: '8px',
        paddingTop: '108px',
        marginRight: '21px'
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
      width: 500,
      height: 460,
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
    const ShopperReviewCart: React.FC<CartPanelProps> = ({ isOpen, onDismiss, onSave },props: Partial<DropdownProps>) => {
        const [isDrawerOpen, setIsDrawerOpen] = useState(false);        
        const toggleDrawer = () => {
            setIsDrawerOpen(!isDrawerOpen);
          };

        const onRenderFooterContent = React.useCallback(
        () => (
            <Stack horizontal tokens={{ childrenGap: 10 }}>
            <PrimaryButton onClick={onSave}>Save</PrimaryButton>
            <DefaultButton onClick={onDismiss}>Cancel</DefaultButton>
            </Stack>
        ),
        [onSave, onDismiss]
        );          
      const dropdownId = useId("dropdown-default");
      const options = [
        "1/2 lb",
        "1 lb",
        "1.5 lb",
        "2 lb"
      ];      
        const styles = useStyles();
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
                    <Header 
                          callParentFunction={toggleDrawer}
                          callCerebralParentFunction={toggleCerebralDrawer} 
                        />
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
                        <TopNav />
                        <Stack id='body' style={{marginLeft: '90px'}}>
                            <Breadcrumb className={styles.breadcrumb}>
                                <BreadcrumbItem className={styles.breadcrumbitem}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                        <path d="M2.99707 3.49658C2.99707 3.22044 3.22093 2.99658 3.49707 2.99658H3.93543C4.66237 2.99658 5.07976 3.46966 5.32152 3.94123C5.4872 4.26438 5.6065 4.65862 5.70508 5H15.9999C16.6634 5 17.1429 5.63441 16.9619 6.27278L15.4664 11.5473C15.2225 12.4078 14.4368 13.0017 13.5423 13.0017H8.46306C7.56125 13.0017 6.77099 12.3982 6.5336 11.5282L5.89118 9.17387C5.88723 9.16317 5.88361 9.15226 5.88034 9.14116L4.851 5.64339C4.81568 5.52734 4.78318 5.41488 4.7518 5.30629C4.65195 4.96076 4.56346 4.65454 4.43165 4.39745C4.2723 4.08662 4.12597 3.99658 3.93543 3.99658H3.49707C3.22093 3.99658 2.99707 3.77272 2.99707 3.49658ZM6.84471 8.86921L7.49833 11.265C7.61702 11.7 8.01215 12.0017 8.46306 12.0017H13.5423C13.9895 12.0017 14.3824 11.7048 14.5044 11.2745L15.9999 6H6.00063L6.84471 8.86921ZM10 15.5C10 16.3284 9.32843 17 8.5 17C7.67157 17 7 16.3284 7 15.5C7 14.6716 7.67157 14 8.5 14C9.32843 14 10 14.6716 10 15.5ZM9 15.5C9 15.2239 8.77614 15 8.5 15C8.22386 15 8 15.2239 8 15.5C8 15.7761 8.22386 16 8.5 16C8.77614 16 9 15.7761 9 15.5ZM15 15.5C15 16.3284 14.3284 17 13.5 17C12.6716 17 12 16.3284 12 15.5C12 14.6716 12.6716 14 13.5 14C14.3284 14 15 14.6716 15 15.5ZM14 15.5C14 15.2239 13.7761 15 13.5 15C13.2239 15 13 15.2239 13 15.5C13 15.7761 13.2239 16 13.5 16C13.7761 16 14 15.7761 14 15.5Z" fill="#424242"/>
                                    </svg>
                                    Back to cart
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none">
                                            <path d="M4.64645 2.14645C4.45118 2.34171 4.45118 2.65829 4.64645 2.85355L7.79289 6L4.64645 9.14645C4.45118 9.34171 4.45118 9.65829 4.64645 9.85355C4.84171 10.0488 5.15829 10.0488 5.35355 9.85355L8.85355 6.35355C9.04882 6.15829 9.04882 5.84171 8.85355 5.64645L5.35355 2.14645C5.15829 1.95118 4.84171 1.95118 4.64645 2.14645Z" fill="#424242"/>
                                        </svg>
                                    <strong>Check out</strong>                                   
                                </BreadcrumbItem>
                            </Breadcrumb>
                            <Stack id='MainContent' style={{alignItems: 'top', marginTop: '21px'}} horizontal>
                                <Stack.Item grow={4}>
                                    <Stack id='mainbody'>
                                        <Stack id='columnscontainer' horizontal>
                                            <Stack id='ordercontent' className={styles.ordercontentsection}>
                                                <Stack style={{width: '100%'}} className={styles.explorecategoriessection}>
                                                  <Text className={styles.explorecategories}>Order summary</Text>
                                                </Stack>
                                                <Stack id='tabsparent' style={{width: '100%', marginBottom: '20px'}} className={styles.explorecategoriessection}>
                                                  <div className={styles.root}>
                                                    <TabList defaultSelectedValue="tab2">
                                                      <Tab value="pickupTab" style={{alignContent: 'center', verticalAlign: 'middle'}}>
                                                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                                        <path d="M10.75 4C10.0596 4 9.5 4.55964 9.5 5.25C9.5 5.94036 10.0596 6.5 10.75 6.5C11.4404 6.5 12 5.94036 12 5.25C12 4.55964 11.4404 4 10.75 4ZM8.5 5.25C8.5 4.00736 9.50736 3 10.75 3C11.9926 3 13 4.00736 13 5.25C13 5.87597 12.7444 6.44224 12.3318 6.85011C12.5669 6.97984 12.7694 7.16868 12.9162 7.40386L13.5624 8.43921L14.8488 9.24324C15.5982 9.71157 15.8259 10.6987 15.3576 11.448C14.8893 12.1974 13.9022 12.4252 13.1528 11.9568L11.7032 11.0508L12.2809 11.8678C12.5323 12.2233 12.6904 12.6363 12.7407 13.0689L12.9901 15.2153C13.0921 16.0931 12.4632 16.8873 11.5855 16.9893C10.7077 17.0913 9.9135 16.4624 9.81151 15.5847L9.57977 13.5904L9.22506 13.0888L8.0905 15.9838C7.76808 16.8066 6.83975 17.2121 6.01702 16.8897C5.19428 16.5673 4.7887 15.639 5.11112 14.8162L6.21461 12.0004C6.01591 11.9996 5.81403 11.9616 5.6187 11.8821C4.80016 11.5492 4.40649 10.6158 4.73942 9.79722L5.70245 7.42948C5.89719 6.95069 6.31124 6.59546 6.81408 6.47578L8.63034 6.04349L8.64281 6.04058C8.55049 5.79462 8.5 5.52821 8.5 5.25ZM9.14853 7.01853C9.05448 6.9946 8.95603 6.99384 8.86162 7.01631L7.04536 7.4486C6.85679 7.49348 6.70152 7.62669 6.6285 7.80624L5.66547 10.174C5.54062 10.4809 5.68824 10.831 5.9952 10.9558C6.30215 11.0807 6.65219 10.933 6.77704 10.6261L7.53137 8.77145C7.58931 8.62901 7.71249 8.52333 7.86208 8.48773C8.23595 8.39874 8.55569 8.76664 8.41546 9.12446L6.04191 15.1811C5.92101 15.4896 6.0731 15.8378 6.38163 15.9587C6.69015 16.0796 7.03827 15.9275 7.15918 15.6189L8.28601 12.7436C8.57357 12.0098 9.55739 11.8816 10.0235 12.5171L10.4814 13.1416C10.5224 13.1975 10.5482 13.2631 10.5562 13.332L10.8046 15.4692C10.8428 15.7984 11.1406 16.0342 11.4698 15.996C11.799 15.9577 12.0348 15.6599 11.9965 15.3307L11.7482 13.1934C11.7162 12.918 11.6131 12.6555 11.4491 12.4319L10.7215 11.4397C10.5219 11.1676 10.4731 10.8132 10.5915 10.4972L10.9301 9.5944C10.9554 9.52679 10.9986 9.46729 11.055 9.42218C11.2422 9.2724 11.5182 9.31952 11.6452 9.52293L11.8916 9.9177C11.9399 9.9951 12.0052 10.0605 12.0826 10.1088L13.6825 11.1088C13.9636 11.2844 14.3337 11.199 14.5093 10.918C14.685 10.637 14.5996 10.2669 14.3185 10.0912L13.0321 9.2872C12.9032 9.20661 12.7943 9.09766 12.7138 8.96866L12.0676 7.93332C11.9857 7.80216 11.8564 7.70766 11.7066 7.66953L9.14853 7.01853Z" fill="#0B5A08"/>
                                                      </svg>
                                                        Pickup</Tab>
                                                      <Tab value="deliveryTab">Delivery</Tab>
                                                    </TabList>
                                                  </div>                                             
                                                </Stack>
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
                                                </Card>
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
                                            </Stack>    
                                            <Stack id='rightrail'>
                                                <Stack id='ordersummarysection' className={styles.ordersummarysection}>
                                                    <Stack id='ordersummarysectioncontainer' className={styles.ordersummarysectioncontainer}>
                                                      <Stack horizontal style={{width: '100%'}}>
                                                        <Text className={styles.ordersummarycontent} style={{textAlign: 'center'}}>Subtotal</Text>
                                                        <Text className={styles.ordersummarycontent} style={{textAlign: 'left'}}>$27.20</Text>
                                                      </Stack>
                                                      <Stack horizontal style={{width: '100%'}}>
                                                        <Text className={styles.ordersummarycontent} style={{textAlign: 'center'}}>Discounts</Text>
                                                        <Text className={styles.ordersummarycontent} style={{textAlign: 'left', color: '#AD2D7E'}}>$-2.20</Text>
                                                      </Stack>
                                                      <Stack horizontal style={{width: '100%'}}>
                                                        <Text className={styles.ordersummarycontent} style={{textAlign: 'center'}}>Tax</Text>
                                                        <Text className={styles.ordersummarycontent} style={{textAlign: 'left'}}>$27.20</Text>
                                                      </Stack>
                                                      <Stack style={{alignItems: 'center'}}>
                                                        <div id='divider' className={styles.divider}>
                                                        </div>                                                        
                                                      </Stack>                                                                                                   
                                                      <Stack horizontal style={{width: '100%'}}>
                                                        <Text className={styles.ordersummarycontent} style={{textAlign: 'center', fontWeight: '700'}}>Total</Text>
                                                        <Text className={styles.ordersummarycontent} style={{textAlign: 'left', fontWeight: '700'}}>$27.20</Text>
                                                      </Stack>
                                                      <Stack horizontal style={{width: '100%'}}>
                                                        <Text className={styles.ordersummarycontent} style={{textAlign: 'center', color: '#AD2D7E'}}>You saved</Text>
                                                        <Text className={styles.ordersummarycontent} style={{textAlign: 'left', color: '#AD2D7E'}}>$27.20</Text>
                                                      </Stack>                                                                                                       
                                                    </Stack>
                                                </Stack>
                                                <Stack id='accordionscontainer'>
                                                <Accordion className={styles.accordion}>
                                                  <AccordionItem value="1" style={{border: '1px solid #E6E6E6', width: '100%', background: '#FAFAFA'}}>
                                                    <AccordionHeader icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                                      <path d="M9 14C8.72386 14 8.5 14.2239 8.5 14.5C8.5 14.7761 8.72386 15 9 15H11C11.2761 15 11.5 14.7761 11.5 14.5C11.5 14.2239 11.2761 14 11 14H9ZM7 2C5.89543 2 5 2.89543 5 4V16C5 17.1046 5.89543 18 7 18H13C14.1046 18 15 17.1046 15 16V4C15 2.89543 14.1046 2 13 2H7ZM6 4C6 3.44772 6.44772 3 7 3H13C13.5523 3 14 3.44772 14 4V16C14 16.5523 13.5523 17 13 17H7C6.44772 17 6 16.5523 6 16V4Z" fill="#242424"/>
                                                      </svg>}
                                                    >
                                                      Mobile Quick Pay
                                                    </AccordionHeader>
                                                    <AccordionPanel>
                                                      <Stack>
                                                      <div>Simply scan this QR code and it will guide you through your preferred secure payment method.</div>
                                                      <img
                                                      className={styles.qrimage}
                                                      src={"MicrosoftTeams-imageQR.png"}
                                                      alt="App Name Document"
                                                    />                                                      
                                                      </Stack>
                                                    </AccordionPanel>
                                                  </AccordionItem>
                                                  <AccordionItem value="2" style={{border: '1px solid #E6E6E6', width: '100%', background: '#FAFAFA'}}>
                                                    <AccordionHeader icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                                      <path d="M11.5 2.99805C10.6716 2.99805 10 3.66962 10 4.49805C10 5.32647 10.6716 5.99805 11.5 5.99805C12.3284 5.99805 13 5.32647 13 4.49805C13 3.66962 12.3284 2.99805 11.5 2.99805ZM9 4.49805C9 3.11734 10.1193 1.99805 11.5 1.99805C12.8807 1.99805 14 3.11734 14 4.49805C14 5.29825 13.624 6.01064 13.0391 6.46823C13.5266 6.67494 13.9514 7.0211 14.2538 7.47463L14.779 8.26252L16.268 9.3261C17.0545 9.88787 17.2367 10.9808 16.6749 11.7673C16.1131 12.5538 15.0202 12.7359 14.2337 12.1742L12.4837 10.9241C12.4529 10.9022 12.4229 10.8793 12.3937 10.8554L12.3793 10.8986L13.322 12.3253C13.5725 12.7045 13.7251 13.1398 13.7663 13.5923L13.9935 16.0916C14.081 17.0541 13.3716 17.9054 12.4091 17.9929C11.4466 18.0804 10.5953 17.371 10.5078 16.4085L10.2977 14.0972L9.80411 13.3501L8.37436 16.9034C8.01357 17.8 6.99423 18.2344 6.0976 17.8736C5.20096 17.5128 4.76657 16.4935 5.12736 15.5969L6.47445 12.249C6.23443 12.2592 5.98842 12.22 5.75089 12.1249C4.85353 11.766 4.41707 10.7475 4.77603 9.85015L5.87603 7.10029C6.08472 6.5786 6.53121 6.18884 7.07631 6.05253L8.61602 5.6675C8.82492 5.61526 9.03706 5.58822 9.24829 5.58555C9.0892 5.25675 9 4.88781 9 4.49805ZM9.31751 6.52264L7.31751 7.02265C7.08394 7.08105 6.89261 7.24802 6.80313 7.47153L5.70235 10.2214C5.54842 10.6059 5.73536 11.0425 6.11991 11.1964C6.50446 11.3503 6.94099 11.1634 7.09492 10.7788L7.96053 8.61647C8.01875 8.47103 8.14325 8.36238 8.29524 8.32438C8.68191 8.22771 9.01513 8.61025 8.86635 8.98001L6.05363 15.9703C5.89901 16.3545 6.08518 16.7914 6.46945 16.946C6.85372 17.1007 7.29058 16.9145 7.4452 16.5302L8.87496 12.9769C9.17588 12.2291 10.1926 12.1264 10.637 12.799L11.2347 13.7036C11.2575 13.7381 11.2713 13.7776 11.2751 13.8188L11.5023 16.3181C11.5398 16.7306 11.9046 17.0346 12.3171 16.9971C12.7296 16.9596 13.0336 16.5948 12.9961 16.1823L12.7689 13.683C12.7427 13.395 12.6456 13.118 12.4862 12.8767L11.5618 11.4776C11.3853 11.2105 11.3474 10.875 11.4598 10.5752L11.8384 9.56557C11.8651 9.49439 11.9105 9.43174 11.9699 9.38425C12.1631 9.22972 12.4471 9.27383 12.5844 9.47967L12.8754 9.91617C12.9258 9.99177 12.9895 10.0576 13.0635 10.1104L14.8135 11.3605C15.1505 11.6013 15.6189 11.5233 15.8597 11.1862C16.1005 10.8492 16.0224 10.3808 15.6854 10.14L14.1963 9.07624C14.0977 9.00582 14.0128 8.91807 13.9456 8.81727L13.1234 7.5842C13.0199 7.42897 12.8623 7.31789 12.6813 7.27264L9.68132 6.52264C9.56189 6.49278 9.43694 6.49278 9.31751 6.52264Z" fill="#242424"/>
                                                      </svg>}
                                                    >
                                                      Who's Picking up?
                                                    </AccordionHeader>
                                                    <AccordionPanel>
                                                      <div>Accordion Panel 2</div>
                                                    </AccordionPanel>
                                                  </AccordionItem>
                                                  <AccordionItem value="3" style={{border: '1px solid #E6E6E6', width: '100%', background: '#FAFAFA'}}>
                                                    <AccordionHeader icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                                      <path d="M10 2C14.4183 2 18 5.58172 18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2ZM10 3C6.13401 3 3 6.13401 3 10C3 13.866 6.13401 17 10 17C13.866 17 17 13.866 17 10C17 6.13401 13.866 3 10 3ZM9.5 5C9.74546 5 9.94961 5.17688 9.99194 5.41012L10 5.5V10H12.5C12.7761 10 13 10.2239 13 10.5C13 10.7455 12.8231 10.9496 12.5899 10.9919L12.5 11H9.5C9.25454 11 9.05039 10.8231 9.00806 10.5899L9 10.5V5.5C9 5.22386 9.22386 5 9.5 5Z" fill="#242424"/>
                                                      </svg>}
                                                      >
                                                      Schedule pickup
                                                    </AccordionHeader>
                                                    <AccordionPanel>
                                                      <div>Accordion Panel 3</div>
                                                    </AccordionPanel>
                                                  </AccordionItem>
                                              </Accordion>
                                                </Stack>                                              
                                            </Stack>                                                           
                                        </Stack>
                                    </Stack>
                                </Stack.Item>
                                <Footer />
                            </Stack>
                        </Stack>
                    </Stack>
                </CopilotProvider>
              </FluentProvider>
    );
  };
  
  export default ShopperReviewCart;                
      