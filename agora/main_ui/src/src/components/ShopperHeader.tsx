import { Stack, IStackTokens ,IStackProps, ITheme, IThemeRules, DefaultPalette, IconButton, IIconProps } from "@fluentui/react";
import { Avatar, Text,  tokens, makeStyles, shorthands, Button } from "@fluentui/react-components";
import { SearchBox } from "@fluentui/react-search-preview";
import { useNavigate } from "react-router-dom";

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
      background: "#F2FBF2"
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
      paddingInlineStart: "14px",
      paddingInlineEnd: "14px",
      paddingBlockStart: "14px",
      paddingBlockEnd: "14px",      

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
    const navigate = useNavigate();
    return(
      <Stack horizontal tokens={horizontalStackTokens} className={classes.suiteheader} id='SuiteHeader'>
      <Stack.Item align="start">
        <Stack horizontal onClick={() => navigate('/.')}>
          <div id='ProductName+Breadcrumb' className={classes.productnameandbreadcrumb}>
            <div id='ProduceName' className={classes.productname}>
              <div id='ContosoHypermarketDark' className={classes.contosohypermarketdark}>

              </div>
              <div id='AppnameAndPreviewLabel' className={classes.appnameandpreviewlabel}>
                <div id='JumpstartBanner' className={classes.jumpstartbanner}>
                  <img src="ShopperProductName.svg" alt="Jumpstart Banner v2 White"/>
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
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26" fill="none">
              <path d="M17.7923 26C15.542 26 13.7113 24.0297 13.7113 21.6078V14.3833H15.2369V21.6078C15.2369 23.1246 16.383 24.3581 17.7923 24.3581C19.2016 24.3581 20.3477 23.1246 20.3477 21.6078H21.8733C21.8733 24.0297 20.0425 26 17.7923 26ZM8.20772 26C5.95746 26 4.12674 24.0297 4.12674 21.6078H5.65234C5.65234 23.1246 6.79845 24.3581 8.20772 24.3581C9.61699 24.3581 10.7631 23.1246 10.7631 21.6078V14.3833H12.2887V21.6078C12.2887 24.0297 10.458 26 8.20772 26ZM21.1124 21.2589C18.4159 21.2589 16.2228 18.8986 16.2228 15.9965V12.959H17.7484V15.9965C17.7484 17.9935 19.2588 19.617 21.1124 19.617C22.966 19.617 24.4763 17.9915 24.4763 15.9965C24.4763 15.2659 24.2761 14.5619 23.8947 13.9605C23.2673 12.9672 22.2261 12.374 21.1105 12.374V10.7321C22.7295 10.7321 24.2418 11.5941 25.1552 13.0369C25.7082 13.9113 26 14.9354 26 15.9965C26 18.8986 23.807 21.2589 21.1105 21.2589H21.1124ZM4.88954 21.2589C2.19305 21.2589 0 18.8986 0 15.9965C0 14.9416 0.289864 13.9236 0.835265 13.0534C1.74681 11.6003 3.26287 10.7341 4.88954 10.7341V12.3761C3.77013 12.3761 2.72701 12.9733 2.0996 13.9728C1.72393 14.5722 1.5256 15.272 1.5256 15.9965C1.5256 17.9935 3.03594 19.617 4.88954 19.617C6.74314 19.617 8.25348 17.9915 8.25348 15.9965V12.959H9.77908V15.9965C9.77908 18.8986 7.58604 21.2589 4.88954 21.2589ZM20.1818 15.9965H18.6562V7.61241C18.6562 4.32033 16.1675 1.64193 13.1087 1.64193C10.0499 1.64193 7.56124 4.32033 7.56124 7.61241V15.9965H6.03565V7.61241C6.03565 3.41522 9.20889 0 13.1087 0C17.0085 0 20.1818 3.41522 20.1818 7.61241V15.9965Z" fill="#FAFAFA"/>
              <path d="M17.7923 26C15.542 26 13.7113 24.0297 13.7113 21.6078V14.3833H15.2369V21.6078C15.2369 23.1246 16.383 24.3581 17.7923 24.3581C19.2016 24.3581 20.3477 23.1246 20.3477 21.6078H21.8733C21.8733 24.0297 20.0425 26 17.7923 26ZM8.20772 26C5.95746 26 4.12674 24.0297 4.12674 21.6078H5.65234C5.65234 23.1246 6.79845 24.3581 8.20772 24.3581C9.61699 24.3581 10.7631 23.1246 10.7631 21.6078V14.3833H12.2887V21.6078C12.2887 24.0297 10.458 26 8.20772 26ZM21.1124 21.2589C18.4159 21.2589 16.2228 18.8986 16.2228 15.9965V12.959H17.7484V15.9965C17.7484 17.9935 19.2588 19.617 21.1124 19.617C22.966 19.617 24.4763 17.9915 24.4763 15.9965C24.4763 15.2659 24.2761 14.5619 23.8947 13.9605C23.2673 12.9672 22.2261 12.374 21.1105 12.374V10.7321C22.7295 10.7321 24.2418 11.5941 25.1552 13.0369C25.7082 13.9113 26 14.9354 26 15.9965C26 18.8986 23.807 21.2589 21.1105 21.2589H21.1124ZM4.88954 21.2589C2.19305 21.2589 0 18.8986 0 15.9965C0 14.9416 0.289864 13.9236 0.835265 13.0534C1.74681 11.6003 3.26287 10.7341 4.88954 10.7341V12.3761C3.77013 12.3761 2.72701 12.9733 2.0996 13.9728C1.72393 14.5722 1.5256 15.272 1.5256 15.9965C1.5256 17.9935 3.03594 19.617 4.88954 19.617C6.74314 19.617 8.25348 17.9915 8.25348 15.9965V12.959H9.77908V15.9965C9.77908 18.8986 7.58604 21.2589 4.88954 21.2589ZM20.1818 15.9965H18.6562V7.61241C18.6562 4.32033 16.1675 1.64193 13.1087 1.64193C10.0499 1.64193 7.56124 4.32033 7.56124 7.61241V15.9965H6.03565V7.61241C6.03565 3.41522 9.20889 0 13.1087 0C17.0085 0 20.1818 3.41522 20.1818 7.61241V15.9965Z" fill="url(#paint0_radial_1645_2164)"/>
              <path d="M11.7911 7.52411C11.7911 8.34713 11.1713 9.01622 10.4047 9.01622C9.63808 9.01622 9.01831 8.34918 9.01831 7.52411H11.7911ZM14.2416 7.52411C14.2416 8.34713 14.8613 9.01622 15.628 9.01622C16.3946 9.01622 17.0143 8.34918 17.0143 7.52411H14.2416Z" fill="white"/>
              <defs>
              <radialGradient id="paint0_radial_1645_2164" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(13 13) rotate(90) scale(18.1949)">
              <stop stop-color="#FAFAFA" stop-opacity="0"/>
              <stop offset="1" stop-color="#F5F5F5"/>
              </radialGradient>
              </defs>
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
      </Stack>
    </Stack>
    );
};

export default ShopperHeader;