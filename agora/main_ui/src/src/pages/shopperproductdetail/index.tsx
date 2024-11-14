import React, { useState, useEffect } from 'react';
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
  messageBarTitleClassNames,
} from "@fluentui/react-components";
import Header from '../../components/ShopperHeader';
import TopNav from '../../components/ShopperTopNav';
import ShopperProdcutsInteraction from '../../components/ShopperProdcutsInteraction';
import Footer from '../../components/ShopperFooter';
import { CopilotProvider } from "@fluentui-copilot/react-copilot";
import { Panel, PanelType, DefaultButton } from '@fluentui/react';
import ActiveCart from '../../components/ActiveCart';
import { IDropdownOption, IImageProps, IStackProps, IStackTokens, Stack,   PrimaryButton, Image, Text} from "@fluentui/react";
import CerebralChatWithAudio from '../../components/Chatter';
import type { ChatInputProps } from "@fluentui-copilot/react-chat-input";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardFooter,
  CardHeader,
  CardPreview
} from "@fluentui/react-components";
import SideMenu from '../../components/ShopperFilterbox';
import { registerIcons } from '@fluentui/react/lib/Styling';
import CerebralHeader from '../../components/CerebralHeader';
import { initializeIcons } from "@fluentui/react/lib/Icons";
initializeIcons();

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
        fontSize: 'var(--Font-size-400, 16px)',
        fontStyle: 'normal',
        fontWeight: 600,
        lineHeight: 'var(--Line-height-300, 22px)',
      },
      explorecategoriessection: {
        marginTop: '26px',
      },
      ordersection: {
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
      width: '300px',
      height: '1px',
      flexshrink: '0',
      background: 'var(--Light-theme-Rest-Border-Default-Border-2, #E0E0E0)'
    },
    cartimagecontainer: {
      display: 'flex',
      width: '100%',
      height: '396px',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      flexShrink: '0',
      background: '#EBF3FC',
    },
    cartimage: {
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
        paddingTop: '8px',
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
   
    const ShopperProductDetail: React.FC<CartPanelProps> = ({ isOpen, onDismiss, onSave },props: Partial<DropdownProps>) => {
        const styles = useStyles();
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
        const navigate = useNavigate();
        const onCheckout = () => {
          navigate('/shopperreviewcart');  
        };
        const onClearCart = () => {
          setIsDrawerOpen(false);
        };
      const dropdownId = useId("dropdown-default");
      const options = [
        "1/2 lb",
        "1 lb",
        "1.5 lb",
        "2 lb"
      ];      

  const searchParams = new URLSearchParams(document.location.search);
  const productId = searchParams.get('productId');

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

data.forEach(
  function(d){
    var newDataItem: DataItem = {
      productId: d["product_id"] ,
      name: d["name"],
      stock: d["stock"],
      photoPath: d["photo_path"],
      category: d["category"],
    };
    if(newDataItem.productId.toString() === productId)
    {
      dataItems.push(newDataItem);      
    }
   }
) 
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
                    </Panel>                      
                        <Header 
                          callParentFunction={toggleDrawer}
                          callCerebralParentFunction={toggleCerebralDrawer} 
                        />
                        <TopNav />
                        <Stack id='body' style={{marginLeft: '90px'}}>
                            <Breadcrumb className={styles.breadcrumb}>
                                <BreadcrumbItem className={styles.breadcrumbitem}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                        <path d="M12.3544 15.8527C12.1594 16.0484 11.8429 16.0489 11.6472 15.854L6.16276 10.389C5.94705 10.1741 5.94705 9.82477 6.16276 9.60982L11.6472 4.14484C11.8429 3.94993 12.1594 3.95049 12.3544 4.1461C12.5493 4.34171 12.5487 4.65829 12.3531 4.85321L7.18851 9.99942L12.3531 15.1456C12.5487 15.3406 12.5493 15.6571 12.3544 15.8527Z" fill="#242424"/>
                                    </svg> 
                                    {dataItems.map(itemCategory => (
                                    <BreadcrumbButton href={"shopperproducts?Category="+ itemCategory.category} className={styles.breadcrumbitem}>Back to search results</BreadcrumbButton>
                                    ))
                                    }
                                </BreadcrumbItem>
                            </Breadcrumb>
                            <Stack id='MainContent' style={{alignItems: 'top', marginTop: '21px'}} horizontal>
                                <Stack.Item grow={4}>
                                    <Stack>
                                        <Stack>
                                        {dataItems.map(item => (
                                            <Stack id='productdetail'>
                                                <Stack horizontal>
                                                    <Stack id='productimage'>
                                                    <Image 
                                                      src={item.photoPath}
                                                      alt= 'Tomatoes on vine'
                                                      width= '500px'
                                                      height='460px'
                                                      ></Image>
                                                    </Stack>
                                                    <Stack id='productmeta' style={{marginLeft: '37px'}}>
                                                        <Stack id='interactionparent'>
                                                            <div id='interaction' className={styles.interaction}>
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                                                    <path d="M17.8535 2.85359C18.0488 2.65835 18.0488 2.34176 17.8536 2.14648C17.6583 1.9512 17.3418 1.95117 17.1465 2.14641L14 5.29226V2.5C14 2.22386 13.7761 2 13.5 2C13.2239 2 13 2.22386 13 2.5V5.37707C11.4215 4.59137 9.41094 5.03767 8.35977 6.58276L2.27314 15.5293C1.84508 16.1585 1.92734 16.9996 2.46941 17.5359C3.01926 18.0799 3.88448 18.1549 4.52155 17.7137L13.4518 11.5298C14.9643 10.4825 15.3949 8.53748 14.628 7H17.5C17.7761 7 18 6.77614 18 6.5C18 6.22386 17.7761 6 17.5 6H14.7065L17.8535 2.85359ZM9.19376 7.13816C10.1158 5.78292 12.0586 5.5969 13.2262 6.75207C14.38 7.89364 14.2122 9.78921 12.8754 10.7149L3.94509 16.8988C3.70766 17.0632 3.3852 17.0353 3.18028 16.8326C2.97826 16.6327 2.9476 16.3192 3.10714 16.0847L9.19376 7.13816Z" fill="#424242"/>
                                                                </svg>
                                                                <Text>Produce | Aisle 3</Text>
                                                            </div>
                                                            <Text variant="large" block className={styles.productname}>
                                                                {item.name}
                                                            </Text>
                                                            <Text variant="large" block className={styles.productprice}>
                                                                $4.99 / lb
                                                            </Text>
                                                            <Stack horizontal className={styles.savingscontainer}>
                                                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                                                <path d="M15.9728 9.72244C15.9907 9.89484 16 10.0762 16 10.2671C16 11.5642 15.548 12.4357 15.11 12.9817C14.8889 13.2573 14.6688 13.4528 14.507 13.5776C14.4263 13.6399 14.3607 13.6841 14.3176 13.7116C14.2961 13.7252 14.2802 13.7347 14.271 13.74L14.2621 13.7451C14.1007 13.8325 14 14.0013 14 14.1849V15.5C14 15.7761 13.7761 16 13.5 16H13C13 15.4477 12.5523 15 12 15H10C9.44772 15 9 15.4477 9 16H8.5C8.22386 16 8 15.7761 8 15.5V14.8973C8 14.6487 7.8173 14.4378 7.57128 14.4023C7.56781 14.4017 7.56088 14.4005 7.55077 14.3986C7.53053 14.3947 7.49765 14.3878 7.45425 14.3768C7.36726 14.3549 7.23928 14.3172 7.08686 14.2557C6.78107 14.1323 6.38553 13.9167 6.02262 13.5489C5.57952 13.0997 5.3087 12.5068 5.16379 12.0959C5.01965 11.6872 4.69162 11.3172 4.22323 11.1848C4.09117 11.1475 4 11.027 4 10.8898V10.0958C4 9.96633 4.08582 9.85254 4.21031 9.81695C4.69455 9.67849 5.01878 9.28551 5.15551 8.87209C5.26778 8.53262 5.46624 8.0955 5.78838 7.76895C6.1017 7.45134 6.44857 7.20883 6.721 7.04477C6.85622 6.96334 6.97055 6.90276 7.04958 6.8632C7.08903 6.84345 7.11949 6.82904 7.13913 6.81997L7.16019 6.81041L7.16441 6.80855C7.3478 6.72959 7.46667 6.54905 7.46667 6.34931V4.67533C7.67582 4.85235 7.91328 5.03634 8.16613 5.20183C8.48377 5.40971 8.85362 5.60713 9.24123 5.71139C9.35488 5.38423 9.51063 5.07219 9.7049 4.78396L9.69908 4.78337C9.42016 4.7551 9.07821 4.60363 8.71375 4.3651C8.35833 4.13249 8.02604 3.84686 7.77328 3.60807C7.52561 3.37407 7.19445 3.35731 6.94747 3.45755C6.69841 3.55862 6.46667 3.80814 6.46667 4.16162V6.03918C6.39011 6.08026 6.3018 6.12989 6.20512 6.18811C5.88611 6.38021 5.46587 6.67195 5.07648 7.06667C4.60048 7.54919 4.34075 8.15091 4.20608 8.5581C4.15091 8.72492 4.03877 8.82592 3.93541 8.85547C3.38171 9.01378 3 9.51992 3 10.0958V10.8898C3 11.4745 3.38851 11.9881 3.95122 12.1471C4.05732 12.1771 4.16631 12.2742 4.22072 12.4285C4.38694 12.8998 4.71862 13.6509 5.31072 14.2511C5.79156 14.7386 6.31269 15.0216 6.71263 15.183C6.81698 15.2252 6.91366 15.2592 7 15.2866V15.5C7 16.3284 7.67157 17 8.5 17H9C9.55228 17 10 16.5523 10 16H12C12 16.5523 12.4477 17 13 17H13.5C14.3284 17 15 16.3284 15 15.5V14.4569C15.0365 14.4309 15.076 14.4017 15.118 14.3693C15.3312 14.2047 15.6111 13.955 15.89 13.6074C16.452 12.9068 17 11.8194 17 10.2671C17 9.61712 16.9075 9.03494 16.7309 8.51548C16.5533 8.95696 16.2975 9.36677 15.9728 9.72244ZM15.7914 5.87483C16.317 7.14344 15.9077 8.56612 14.8808 9.37712C14.4645 9.70586 13.8928 9.68064 13.4027 9.47769L11.0137 8.48836C10.5236 8.28541 10.1014 7.89903 10.0394 7.37223C9.88651 6.07264 10.6029 4.77717 11.8715 4.25157C13.4022 3.61739 15.1572 4.34415 15.7914 5.87483ZM14.261 8.59233C14.9461 8.05132 15.2174 7.102 14.8675 6.25759C14.4447 5.23713 13.2747 4.75263 12.2543 5.17542C11.4099 5.52527 10.9306 6.38844 11.0326 7.25538C11.0348 7.27423 11.0436 7.31187 11.0985 7.37096C11.1582 7.4352 11.2587 7.50748 11.3963 7.56444L13.7853 8.55378C13.9229 8.61074 14.045 8.63068 14.1327 8.62746C14.2133 8.6245 14.2461 8.6041 14.261 8.59233ZM7.75 9.5C8.16421 9.5 8.5 9.16421 8.5 8.75C8.5 8.33579 8.16421 8 7.75 8C7.33579 8 7 8.33579 7 8.75C7 9.16421 7.33579 9.5 7.75 9.5Z" fill="#80215D"/>
                                                              </svg>
                                                              <Text className={styles.savingstext}>
                                                                Save $1.13 / lb
                                                              </Text>
                                                            </Stack>
                                                            <Stack horizontal style={{alignItems: 'bottom'}}>
                                                                <Stack>       
                                                                    <Stack>
                                                                        <label id={dropdownId} style={{marginTop: '23px', marginBottom: '9px'}}>Weight</label>
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
                                                                    <PrimaryButton className={styles.addtocartbutton} text="Add to cart" iconProps={{ iconName: 'AddToCartIcon' }}></PrimaryButton>
                                                                    </div>
                                                                </Stack>       
                                                            </Stack>
                                                            <Stack id='dividercontainer' className={styles.dividercontainer}>
                                                                    <div id='divider' className={styles.divider}>
                                                                    </div>
                                                            </Stack>
                                                            <Stack horizontal id='addtolilstandshare'>
                                                                <div  style={{
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                justifyContent: 'flex-end',
                                                                height: '100%'
                                                                }}>
                                                                <PrimaryButton className={styles.addtolistbutton} text="Add to list" iconProps={{ iconName: 'AddtoListIcon' }}></PrimaryButton>
                                                                </div>
                                                                <div  style={{
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                justifyContent: 'flex-end',
                                                                height: '100%'
                                                                }}>
                                                                <PrimaryButton className={styles.sharebutton} text="Share" iconProps={{ iconName: 'ShareIcon' }}></PrimaryButton>
                                                                </div>                                                            
                                                            </Stack>                                                                                                                                                  
                                                        </Stack>
                                                    </Stack>
                                                </Stack>
                                            </Stack>
                                            ))
                                          }
                                            <Stack id='youmayalsolikecontainerparent'>
                                            </Stack>
                                            <Stack id='youmayalsolikecontainer'>
                                            <Stack style={{width: '100%'}} className={styles.explorecategoriessection}>
                                                <Text className={styles.explorecategories}>You may also like</Text>
                                            </Stack>
                                            <Stack horizontal id='youmayalsolikecontent' style={{width: '100%', alignContent: 'center'}}>
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
                                                    <Stack styles={childStackStyles}>
                                                    <img src="fourgrapetomatoes.png" alt="Category 1" style={categoryStyles.root} />
                                                    <Text className={styles.categorytext}>Tomatoes, on vine</Text>
                                                    <Text className={styles.categorytext}>$4.99 / lb</Text>
                                                    </Stack>  
                                                    <Stack styles={childStackStyles}>
                                                    <img src="Grapetomatoes.png" alt="Category 1" style={categoryStyles.root} />
                                                    <Text className={styles.categorytext}>Tomatoes, on vine</Text>
                                                    <Text className={styles.categorytext}>$4.99 / lb</Text>
                                                    </Stack>  
                                                </Stack>
                                                <Stack id='CardsSection' horizontal>

                                                </Stack>
                                                </Stack>                                                                          
                                                <Stack>
                                                <Stack style={{width: '100%'}} className={styles.explorecategoriessection}>
                                                </Stack>                                                
                                            <Stack className={styles.explorecategoriessection} style={{width: '100%', marginTop: '50px'}} >
                                                <Text className={styles.explorecategories}>Explore recipes</Text>
                                            </Stack>
                                                <Stack horizontal id='OrderSection' className={styles.ordersection}>
                                                <Card className={styles.cardsmall}>
                                                <CardHeader
                                                    image={        
                                                    <img
                                                        src={"EasyToCookMealKits.png"}
                                                        alt="Fridge Abc 123"
                                                    />}
                                                    description={<Caption1></Caption1>}
                                                />
                                                <CardFooter className={styles.cardfooter}>
                                                <div className={styles.cardfootercontent}>
                                                    <Text className={styles.cardfootertitlecontenttext}>Easy to cook meal kits</Text>
                                                    <Text className={styles.cardfootersubtitlecontenttext}>Located in the deli</Text>                        
                                                </div>
                                                </CardFooter>
                                                </Card>
                                                <Card className={styles.cardsmall}>
                                                <CardHeader
                                                    image={        
                                                    <img
                                                        src={"GrabAndGoMeals.png"}
                                                        alt="Fridge Abc 123"
                                                    />}
                                                    description={<Caption1></Caption1>}
                                                />
                                                <CardFooter className={styles.cardfooter}>  
                                                <div className={styles.cardfootercontent}>
                                                <Text className={styles.cardfootertitlecontenttext}>Grab and go meals</Text>
                                                <Text className={styles.cardfootersubtitlecontenttext}>Located in the deli</Text>                        
                                                </div>
                                                </CardFooter>
                                                </Card>      
                                                <Card className={styles.cardsmall}>
                                                <CardHeader
                                                    image={        
                                                    <img
                                                        src={"CakeForAnyOccasion.png"}
                                                        alt="Fridge Abc 123"
                                                    />}
                                                    description={<Caption1></Caption1>}
                                                />
                                                <CardFooter className={styles.cardfooter}>  
                                                <div className={styles.cardfootercontent}>
                                                <Text className={styles.cardfootertitlecontenttext}>Cake for any occasion</Text>
                                                <Text className={styles.cardfootersubtitlecontenttext}>Located in the deli</Text>                        
                                                </div>
                                                </CardFooter>
                                                </Card>      
                                                </Stack>                                                    
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
  
  export default ShopperProductDetail;                
      