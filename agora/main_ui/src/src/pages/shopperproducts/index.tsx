import React from 'react';
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
} from "@fluentui/react-components";
import Header from '../../components/ShopperHeader';
import TopNav from '../../components/ShopperTopNav';
import ShopperProdcutsInteraction from '../../components/ShopperProdcutsInteraction';
import Footer from '../../components/ShopperFooter';
import { CopilotProvider } from "@fluentui-copilot/react-copilot";
import { IDropdownOption, IImageProps, IStackProps, IStackTokens, Stack,   PrimaryButton, Image, Text} from "@fluentui/react";
import {
  Card,
  CardFooter,
  CardHeader,
  CardPreview
} from "@fluentui/react-components";
import SideMenu from '../../components/ShopperFilterbox';
import { registerIcons } from '@fluentui/react/lib/Styling';

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
    const ShopperProducts = (props: Partial<DropdownProps>) => {
      const dropdownId = useId("dropdown-default");
      const options = [
        "1/2 lb",
        "1 lb",
        "1.5 lb",
        "2 lb"
      ];      
        const styles = useStyles();
          return (
              <FluentProvider theme={webLightTheme}>
                <CopilotProvider mode='sidecar'>
                    <Stack>
                        <Header />
                        <TopNav />
                        <Breadcrumb className={styles.breadcrumb}>
                            <BreadcrumbItem className={styles.breadcrumbitem}>Home
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                    <path d="M7.64582 4.14708C7.84073 3.95147 8.15731 3.9509 8.35292 4.14582L13.8374 9.6108C14.0531 9.82574 14.0531 10.1751 13.8374 10.39L8.35292 15.855C8.15731 16.0499 7.84073 16.0493 7.64582 15.8537C7.4509 15.6581 7.45147 15.3415 7.64708 15.1466L12.8117 10.0004L7.64708 4.85418C7.45147 4.65927 7.4509 4.34269 7.64582 4.14708Z" fill="#424242"/>
                                </svg>
                            </BreadcrumbItem>
                            <BreadcrumbItem className={styles.breadcrumbitem}> All categories 
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                    <path d="M7.64582 4.14708C7.84073 3.95147 8.15731 3.9509 8.35292 4.14582L13.8374 9.6108C14.0531 9.82574 14.0531 10.1751 13.8374 10.39L8.35292 15.855C8.15731 16.0499 7.84073 16.0493 7.64582 15.8537C7.4509 15.6581 7.45147 15.3415 7.64708 15.1466L12.8117 10.0004L7.64708 4.85418C7.45147 4.65927 7.4509 4.34269 7.64582 4.14708Z" fill="#424242"/>
                                </svg>
                            </BreadcrumbItem>
                            <BreadcrumbItem className={styles.breadcrumbitem}>Produce 
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                    <path d="M7.64582 4.14708C7.84073 3.95147 8.15731 3.9509 8.35292 4.14582L13.8374 9.6108C14.0531 9.82574 14.0531 10.1751 13.8374 10.39L8.35292 15.855C8.15731 16.0499 7.84073 16.0493 7.64582 15.8537C7.4509 15.6581 7.45147 15.3415 7.64708 15.1466L12.8117 10.0004L7.64708 4.85418C7.45147 4.65927 7.4509 4.34269 7.64582 4.14708Z" fill="#424242"/>
                                </svg>
                            </BreadcrumbItem>
                            <BreadcrumbItem className={styles.breadcrumbitem}> Vegetables</BreadcrumbItem>
                        </Breadcrumb>
                        <Stack id='MainContent' style={{alignItems: 'top', marginTop: '21px'}} horizontal>
                            <Stack.Item>
                                <SideMenu />
                            </Stack.Item>
                            <Stack.Item grow={4}>
                                <Stack>
                                    <Stack>
                                        <ShopperProdcutsInteraction />    
                                        <Stack id='producefirstrow'>
                                            <Stack horizontal id='firstrowhorizontalcontainer'>
                                                <Stack tokens={stackTokens} id='ProductDetails'>
                                                    <Image {...imageProps} />
                                                    <Text variant="large" block className={styles.productname}>
                                                        Tomatoes, on vine
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
                                                <Stack tokens={stackTokens} id='ProductDetails'>
                                                    <Image {...imageProps} />
                                                    <Text variant="large" block className={styles.productname}>
                                                        Tomatoes, on vine
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
                                                <Stack tokens={stackTokens} id='ProductDetails'>
                                                    <Image {...imageProps} />
                                                    <Text variant="large" block className={styles.productname}>
                                                        Tomatoes, on vine
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
                                            </Stack>
                                        </Stack>     
                                        <Stack id='producesecondrow'>
                                            <Stack horizontal id='secondrowhorizontalcontainer'>
                                            
                                            </Stack>
                                        </Stack>                           
                                        <Stack tokens={stackTokens} id='ProductDetails'>
                                          <Image {...imageProps} />
                                          <Text variant="large" block className={styles.productname}>
                                            Tomatoes, on vine
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
      