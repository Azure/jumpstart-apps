import { Stack, IStackTokens ,IStackProps, ITheme, IThemeRules, DefaultPalette, IconButton, IIconProps } from "@fluentui/react";
import { Avatar, Text,  tokens, makeStyles, shorthands, Button } from "@fluentui/react-components";
import { SearchBox } from "@fluentui/react-search-preview";


export interface IHeaderProps {
    themeRules?: IThemeRules;
  }
  
export interface IHeaderState {
showPanel: boolean;
jsonTheme: string;
powershellTheme: string;
themeAsCode: any;
}

const headerStackStyles = (p: IStackProps, theme: ITheme) => ({
root: {
    minHeight: 47,
    padding: '0 32px',
    boxShadow: theme.effects.elevation4,
},
});

const addIcon: IIconProps = { iconName: 'MailAlert' };
const copilotIcon: IIconProps = { iconName: 'Robot' };

const useStyles = makeStyles({
    suiteheader: {
      backgroundColor: "#063004",
      display: "flex",
      width: "100%",
      justifyContent: "space-between",
      alignItems: "center",
      flexShrink: 0,
      padding: "0px",
    },
    instance26Suiteheade: {
      backgroundColor: "#1c0e2b",
      "display": "flex",
      "width": "100%",
      "justify-content": "space-between",
      "align-items": "center",
      "flex-shrink": "0",
    },
    frame7WaffleProd: {
      "display": "flex",
      "align-items": "flex-start",
      paddingInlineStart: "14px",
      paddingInlineEnd: "14px",
      paddingBlockStart: "14px",
      paddingBlockEnd: "14px",
    },
    instance1Wafflemenu: {
      //backgroundColor: tokens.colorStrokeFocus1,
      backgroundColor: "#FFFFFF00",
      paddingInlineStart: "14px",
      paddingInlineEnd: "14px",
      paddingBlockStart: "14px",
      paddingBlockEnd: "14px",
      "display": "flex",
      "width": "68px",
      "justify-content": "center",
      "align-items": "center",
    },
    instance0Placeholde: {
      backgroundColor: "#FFFFFF00",
      "width": "20px",
      "height": "20px",
      "flex-shrink": "0",
    },
    frame6Productnam: {
      backgroundColor: "#FFFFFF00",
      paddingInlineStart: "14px",
      paddingInlineEnd: "14px",
      paddingBlockStart: "14px",
      paddingBlockEnd: "14px",
    },
    frame5Productnam: {
      "display": "flex",
      "align-items": "center",
    },
    frame4Appnamepre: {
      paddingInlineEnd: tokens.spacingHorizontalS,
      paddingBlockStart: tokens.spacingVerticalM,
      paddingBlockEnd: "14px",
      columnGap: tokens.spacingHorizontalSNudge,
      "display": "flex",
      "height": "48px",
      "align-items": "center",
    },
    text2Appname: {
      fontSize: tokens.fontSizeBase400,
      fontWeight: tokens.fontWeightSemibold,
      lineHeight: tokens.lineHeightBase400,
      color: tokens.colorBrandBackground2Pressed,
    },
    text3Previewlab: {
      fontSize: tokens.fontSizeBase400,
      fontWeight: tokens.fontWeightSemibold,
      lineHeight: tokens.lineHeightBase400,
      color: tokens.colorPalettePurpleBackground2,
    },
    instance13Searchbox: {
      backgroundColor: "##E0D3ED",
      "display": "flex",
      "width": "468px",
      "height": "32px",
      "padding": "0px var(--Horizontal-MNudge, 10px)",
      "justify-content": "center",
      "align-items": "center",
      "gap": "var(--Horizontal-XXS, 2px)",
      "flex-shrink": "0",
    },
    instance12BaseSearch: {
      backgroundColor: "#e0d3ed",
      paddingInlineStart: tokens.spacingHorizontalMNudge,
      paddingInlineEnd: tokens.spacingHorizontalMNudge,
      borderTopLeftRadius: tokens.borderRadiusMedium,
      borderTopRightRadius: tokens.borderRadiusMedium,
      borderBottomLeftRadius: tokens.borderRadiusMedium,
      borderBottomRightRadius: tokens.borderRadiusMedium,
      columnGap: tokens.spacingHorizontalXXS,
      "display": "flex",
      "width": "468px",
      "height": "32px",
      "justify-content": "center",
      "align-items": "center",
      "flex-shrink": "0",
    },
    frame11Icontext: {
      backgroundColor: "#FFFFFF00",
      columnGap: tokens.spacingHorizontalXXS,
      "display": "flex",
      "align-items": "center",
       ...shorthands.flex(1,0,0),
    },
    instance8Icon: {
      "width": "20px",
      "height": "20px",
    },
    frame10Textcontai: {
      backgroundColor: "#FFFFFF00",
      paddingInlineStart: tokens.spacingHorizontalXXS,
      paddingInlineEnd: tokens.spacingHorizontalXXS,
      columnGap: tokens.spacingHorizontalMNudge,
      "display": "flex",
      "align-items": "flex-start",
       ...shorthands.flex(1,0,0),
    },
    text9Text: {
      fontSize: tokens.fontSizeBase300,
      fontWeight: tokens.fontWeightRegular,
      lineHeight: tokens.lineHeightBase300,
      color: "#1c0e2b",
      "height": "20px",
       ...shorthands.flex(1,0,0),
       ...shorthands.overflow("hidden"),
      "text-overflow": "ellipsis",
      "white-space": "nowrap",
    },
    frame25Actiongrou: {
      "display": "flex",
      "justify-content": "flex-end",
      "align-items": "center",
    },
    instance18Notificati: {
      backgroundColor: "#FFFFFF00",
      paddingInlineStart: "14px",
      paddingInlineEnd: "14px",
      paddingBlockStart: "14px",
      paddingBlockEnd: "14px",
      "display": "flex",
      "align-items": "flex-start",
    },
    instance14Alert: {
      "width": "20px",
      "height": "20px",
    },
    instance17Badge: {
      backgroundColor: "#117865",
      paddingInlineStart: tokens.spacingHorizontalXXS,
      paddingInlineEnd: tokens.spacingHorizontalXXS,
      borderTopLeftRadius: "9999px",
      borderTopRightRadius: "9999px",
      borderBottomLeftRadius: "9999px",
      borderBottomRightRadius: "9999px",
      "display": "flex",
      "width": "16px",
      "height": "16px",
      "justify-content": "center",
      "align-items": "center",
      "position": "absolute",
      "right": "8px",
      "top": "8px",
    },
    frame16ContentCon: {
      paddingInlineStart: tokens.spacingHorizontalXXS,
      paddingInlineEnd: tokens.spacingHorizontalXXS,
      "display": "flex",
      "flex-direction": "column",
      "align-items": "flex-start",
    },
    text15Content: {
      fontSize: tokens.fontSizeBase100,
      fontWeight: tokens.fontWeightSemibold,
      lineHeight: tokens.lineHeightBase100,
      color: tokens.colorStrokeFocus1,
      "text-align": "center",
    },
    instance22Helpsuppor: {
      backgroundColor: "#FFFFFF00",
      paddingInlineStart: "14px",
      paddingInlineEnd: "14px",
      paddingBlockStart: "14px",
      paddingBlockEnd: "14px",
      "display": "flex",
      "align-items": "flex-start",
    },
    instance21GenieBy: {
      "width": "20px",
      "height": "20px",
    },
    ellipse19Ellipse267: {
      color: tokens.colorStrokeFocus1,
      "width": "20px",
      "height": "20px",
      "flex-shrink": "0",
      "fill": "#FFF",
    },
    rectangle20GenieBe: {
      "width": "25.333px",
      "height": "25.333px",
      "flex-shrink": "0",
    },
    instance24Accountman: {
      backgroundColor: "#FFFFFF00",
      paddingInlineStart: tokens.spacingHorizontalSNudge,
      paddingInlineEnd: tokens.spacingHorizontalSNudge,
      paddingBlockStart: tokens.spacingVerticalSNudge,
      paddingBlockEnd: tokens.spacingVerticalSNudge,
      "display": "flex",
      "align-items": "flex-start",
    },
    instance23Meicon: {
      backgroundColor: "#FFFFFF00",
      "display": "flex",
      "width": "var(--Line-height-700, 36px)",
      "height": "var(--Line-height-700, 36px)",
      "justify-content": "center",
      "align-items": "center",
    },
    productnameandbreadcrumb: {
      "display": "flex",
      "padding": "0px 8px 0px 20px",
      "align-items": "flex-start",
      "gap": "4px",
    },    
    productname: {
      "display": "flex",
      "align-items": "center",
      marginLeft: "45px",
      marginBottom: "11px"
    },
    contosohypermarketdark: {
      "width": "79.127px",
      "height": "35px",
    },
    appnameandpreviewlabel: {
      "display": "flex",
      "height": "48px",
      "padding": "0px 8px 0px 20px",
      "align-items": "center",
      "gap": "6px"
    },
    searchboxcontainer: {
      "display": "flex",
      "width": "auto",
      "height": "32px",
      "justify-content": "center",
      "align-items": "center",
      "gap": "var(--Horizontal-XXS, 2px)",
      "flex-shrink": "0",
    },
    jumpstartbanner: {
      "display": "flex",
      "width": "87.6px",
      "height": "30px",
      "justify-content": "flex-end",
      "align-items": "center",
    },
    searchbox: {
      "width": "468px",
      "height": "32px",
      "justify-content": "center",
      "align-items": "center",
      "gap": "var(--Horizontal-XXS, 2px)",
      "flex-shrink": "0",
    },
    actiongroup: {
      "display": "flex",
      "justify-content": "flex-end",
      "align-items": "center",
    },
    notification: {
      "display": "flex",
      "alignItems": "flex-start",
      "background": "var(--Neutral-Background-Subtle-Rest, rgba(255, 255, 255, 0.00))",
    },
    accountmanager: {
      "display": "flex",
      "align-items": "flex-start",
      "padding": "6px",
      "background": "var(--Neutral-Background-Subtle-Rest, rgba(255, 255, 255, 0.00))",
    },
    accountmanagerimage: {
      "width": "36px",
      "height": "36px",
      "display": "flex",
      "justify-content": "center",
      "align-items": "center",
      "background-image": "url('Footprint.png')"
    },
  });

const ShopperHeader: React.FC<{ callParentFunction: () => void; callCerebralParentFunction: () => void } > = ({ callParentFunction, callCerebralParentFunction }) => {
    const classes = useStyles();
    const horizontalStackTokens: IStackTokens = {
      childrenGap: 10,
      padding: 10,
    };
    return(
      <Stack horizontal tokens={horizontalStackTokens} className={classes.suiteheader} id='SuiteHeader'>
      <Stack.Item align="start">
        <Stack horizontal>
          <div id='ProductName+Breadcrumb' className={classes.productnameandbreadcrumb}>
            <div id='ProduceName' className={classes.productname}>
              <div id='ContosoHypermarketDark' className={classes.contosohypermarketdark}>

              </div>
              <div id='AppnameAndPreviewLabel' className={classes.appnameandpreviewlabel}>
                <div id='JumpstartBanner' className={classes.jumpstartbanner}>
                  <img src="Group 1321317568.svg" alt="Jumpstart Banner v2 White"/>
                </div>
              </div>
            </div>
          </div>
        </Stack>
      </Stack.Item>
      <Stack.Item align="center" grow={1}>
        <div className={classes.searchboxcontainer}>
          <SearchBox placeholder="Search" className={classes.searchbox} />
        </div>
      </Stack.Item>
      <Stack horizontal tokens={{ childrenGap: 5 }}>
        <Stack.Item align="end" className={classes.actiongroup}>
          <div className={classes.notification}  onClick={callCerebralParentFunction}>
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" fill="none">
            <rect width="48" height="48" fill="#A7E3A5"/>
            <path d="M28.4469 15.2509L28.7565 16.2027C28.8527 16.492 29.0152 16.755 29.231 16.9706C29.4468 17.1862 29.7099 17.3486 29.9995 17.4448L30.9521 17.7541L30.9711 17.7589C31.0446 17.7848 31.1081 17.8327 31.1531 17.8962C31.1981 17.9597 31.2222 18.0356 31.2222 18.1134C31.2222 18.1912 31.1981 18.2671 31.1531 18.3306C31.1081 18.3941 31.0446 18.4421 30.9711 18.468L30.0186 18.7773C29.729 18.8735 29.4658 19.0358 29.2501 19.2515C29.0343 19.4671 28.8718 19.73 28.7755 20.0194L28.4659 20.9712C28.44 21.0445 28.392 21.1081 28.3284 21.153C28.2649 21.1979 28.189 21.2221 28.1111 21.2221C28.0333 21.2221 27.9573 21.1979 27.8938 21.153C27.8875 21.1486 27.8814 21.144 27.8754 21.1392C27.821 21.0954 27.7796 21.0373 27.7563 20.9712L27.4467 20.0194C27.4301 19.9689 27.4114 19.9192 27.3908 19.8704C27.293 19.6387 27.1513 19.4276 26.973 19.2488C26.9391 19.2148 26.9041 19.1821 26.8679 19.1508C26.6738 18.9827 26.4482 18.854 26.2036 18.7725L25.2511 18.4632C25.1777 18.4373 25.1141 18.3893 25.0691 18.3258C25.0241 18.2623 25 18.1864 25 18.1087C25 18.0309 25.0241 17.955 25.0691 17.8915C25.1141 17.828 25.1777 17.78 25.2511 17.7541L26.2036 17.4448C26.4897 17.3461 26.749 17.1826 26.9614 16.9671C27.1737 16.7516 27.3333 16.49 27.4277 16.2027L27.7372 15.2509C27.7631 15.1775 27.8112 15.114 27.8747 15.0691C27.9383 15.0241 28.0142 15 28.0921 15C28.1699 15 28.2458 15.0241 28.3094 15.0691C28.3729 15.114 28.421 15.1775 28.4469 15.2509ZM32.807 22.3004L32.1267 22.0795C31.9198 22.0108 31.7318 21.8948 31.5777 21.7408C31.4236 21.5868 31.3075 21.399 31.2387 21.1923L31.0176 20.5124C30.9991 20.46 30.9648 20.4146 30.9194 20.3825C30.874 20.3504 30.8198 20.3332 30.7642 20.3332C30.7086 20.3332 30.6543 20.3504 30.6089 20.3825C30.5635 20.4146 30.5292 20.46 30.5107 20.5124L30.2896 21.1923C30.2222 21.3975 30.1082 21.5844 29.9565 21.7383C29.8049 21.8922 29.6196 22.009 29.4153 22.0795L28.7349 22.3004C28.6825 22.3189 28.637 22.3532 28.6049 22.3986C28.5728 22.4439 28.5556 22.4981 28.5556 22.5537C28.5556 22.6092 28.5728 22.6634 28.6049 22.7088C28.637 22.7541 28.6825 22.7884 28.7349 22.8069L29.4153 23.0279C29.6225 23.0969 29.8107 23.2134 29.9649 23.368C30.119 23.5227 30.2349 23.7112 30.3032 23.9185L30.5243 24.5983C30.5428 24.6507 30.5771 24.6961 30.6225 24.7282C30.6679 24.7603 30.7222 24.7775 30.7778 24.7775C30.8334 24.7775 30.8876 24.7603 30.933 24.7282C30.9784 24.6961 31.0127 24.6507 31.0312 24.5983L31.2524 23.9185C31.3211 23.7118 31.4372 23.524 31.5913 23.37C31.7454 23.2159 31.9334 23.1 32.1403 23.0313L32.8207 22.8103C32.8731 22.7918 32.9185 22.7575 32.9506 22.7122C32.9828 22.6668 33 22.6126 33 22.5571C33 22.5015 32.9828 22.4473 32.9506 22.402C32.9185 22.3566 32.8731 22.3223 32.8207 22.3038L32.807 22.3004ZM30.7793 25.6664C30.5464 25.6655 30.3219 25.5976 30.1304 25.4709C29.4304 28.1409 27.0008 30.1107 24.1111 30.1107C23.03 30.1107 21.9899 29.835 21.0685 29.3174L20.9914 29.2833L20.91 29.2644C20.8548 29.257 20.7982 29.26 20.7431 29.2737L18.0551 29.9436L18.7269 27.2585L18.7395 27.1751C18.7441 27.0912 18.7249 27.0071 18.6831 26.9329C18.1649 26.0111 17.8889 24.9704 17.8889 23.8887C17.8889 20.4523 20.6747 17.6666 24.1111 17.6666C24.1372 17.6666 24.1632 17.6668 24.1891 17.6671C24.227 17.5651 24.2783 17.4681 24.3424 17.3775C24.4937 17.1638 24.7072 17.0036 24.9563 16.9145L25.1484 16.8528C24.8098 16.8034 24.4634 16.7777 24.1111 16.7777C20.1838 16.7777 17 19.9614 17 23.8887L17.0066 24.1965L17.0291 24.536C17.1105 25.4373 17.3614 26.3051 17.7659 27.1022L17.8222 27.2086L17.0133 30.4474L17.001 30.5218L17.0012 30.5941C17.0233 30.8546 17.2767 31.0551 17.5521 30.9864L20.792 30.1774L20.8993 30.2346C21.8853 30.7346 22.9794 30.9996 24.1111 30.9996C27.4302 30.9996 30.2181 28.7258 31.0022 25.6509C30.9293 25.6616 30.8548 25.6662 30.7793 25.6664Z" fill="#323130"/>
          </svg>
          </div>
        </Stack.Item>
        <Stack.Item align="end" className={classes.actiongroup}>
          <div className={classes.frame7WaffleProd}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10.4965 16.8028L16.7408 10.4994C18.4252 8.78856 18.4199 6.02549 16.7239 4.31249C15.0611 2.63292 12.3961 2.5895 10.6978 4.19086C10.6612 4.22539 10.6251 4.26068 10.5894 4.29673L9.99299 4.90026L9.38843 4.28963C9.35529 4.25616 9.32175 4.22333 9.28783 4.19116C7.58595 2.57726 4.91654 2.60193 3.26122 4.2739C1.5729 5.9792 1.58114 8.75004 3.27679 10.4627L9.55368 16.8028C9.81404 17.0657 10.2362 17.0657 10.4965 16.8028ZM11.3 5.00029C12.5964 3.69135 14.7025 3.69204 16.0133 5.01604C17.3253 6.34123 17.3272 8.47734 16.0292 9.79681L16.0282 9.79783L10.0252 15.8577L3.98743 9.75919C2.67408 8.43263 2.67286 6.28953 3.97185 4.97746C5.26525 3.67106 7.36984 3.67208 8.6778 4.99319L9.63801 5.96306C9.8338 6.16082 10.1534 6.16067 10.349 5.96272L11.3 5.00029Z" fill="white" fill-opacity="0.9"/>
            </svg>          
          </div>
        </Stack.Item>        
        <Stack.Item align="end">
          <div className={classes.frame7WaffleProd} onClick={callParentFunction}> 
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M2.99707 3.49658C2.99707 3.22044 3.22093 2.99658 3.49707 2.99658H3.93543C4.66237 2.99658 5.07976 3.46966 5.32152 3.94123C5.4872 4.26438 5.6065 4.65862 5.70508 5H15.9999C16.6634 5 17.1429 5.63441 16.9619 6.27278L15.4664 11.5473C15.2225 12.4078 14.4368 13.0017 13.5423 13.0017H8.46306C7.56125 13.0017 6.77099 12.3982 6.5336 11.5282L5.89118 9.17387C5.88723 9.16317 5.88361 9.15226 5.88034 9.14116L4.851 5.64339C4.81568 5.52734 4.78318 5.41488 4.7518 5.30629C4.65195 4.96076 4.56346 4.65454 4.43165 4.39745C4.2723 4.08662 4.12597 3.99658 3.93543 3.99658H3.49707C3.22093 3.99658 2.99707 3.77272 2.99707 3.49658ZM6.84471 8.86921L7.49833 11.265C7.61702 11.7 8.01215 12.0017 8.46306 12.0017H13.5423C13.9895 12.0017 14.3824 11.7048 14.5044 11.2745L15.9999 6H6.00063L6.84471 8.86921ZM10 15.5C10 16.3284 9.32843 17 8.5 17C7.67157 17 7 16.3284 7 15.5C7 14.6716 7.67157 14 8.5 14C9.32843 14 10 14.6716 10 15.5ZM9 15.5C9 15.2239 8.77614 15 8.5 15C8.22386 15 8 15.2239 8 15.5C8 15.7761 8.22386 16 8.5 16C8.77614 16 9 15.7761 9 15.5ZM15 15.5C15 16.3284 14.3284 17 13.5 17C12.6716 17 12 16.3284 12 15.5C12 14.6716 12.6716 14 13.5 14C14.3284 14 15 14.6716 15 15.5ZM14 15.5C14 15.2239 13.7761 15 13.5 15C13.2239 15 13 15.2239 13 15.5C13 15.7761 13.2239 16 13.5 16C13.7761 16 14 15.7761 14 15.5Z" fill="white" fill-opacity="0.9"/>
          </svg>
        </div>
        </Stack.Item>
        <Stack.Item align="end" className={classes.accountmanager}>
          <img src="Footprint.png" alt="Sparkle" className={classes.accountmanagerimage} />
        </Stack.Item>
      </Stack>
    </Stack>
    );
};

export default ShopperHeader;