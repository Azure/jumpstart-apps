import { Stack, IStackTokens ,IStackProps, ITheme, IThemeRules, DefaultPalette, IconButton, IIconProps } from "@fluentui/react";
import { Avatar, Text,  tokens, makeStyles, shorthands } from "@fluentui/react-components";
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
    instance26Suiteheade: {
      backgroundColor: "#1c0e2b",
      "display": "flex",
      "width": "100%",
      "justify-content": "space-between",
      "align-items": "center",
      "flex-shrink": "0",
      padding: "0px",
    },
    frame7WaffleProd: {
      "display": "flex",
      "padding": "14px",
      "alignItems": "flex-start",
      "background": "var(--Neutral-Background-Subtle-Rest, rgba(255, 255, 255, 0.00))",

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
      background: "#E0D3ED",
      /* Elevation/Light/Shadow 02 */
      boxShadow: "0px 1px 2px 0px rgba(0, 0, 0, 0.14), 0px 0px 2px 0px rgba(0, 0, 0, 0.12)"

    },
    actiongroup: {
      "display": "flex",
      "justify-content": "flex-end",
      "align-items": "center",
    },
    notification: {
      "display": "flex",
      "padding": "14px",
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
    },
  });

const MaintenanceWorkerHeader: React.FC<{ callParentFunction: () => void }> = ({ callParentFunction }) => {
    const classes = useStyles();
    const horizontalStackTokens: IStackTokens = {
      childrenGap: 10,
      padding: 10,
    };
    const navigate = useNavigate();
    return(
      <Stack horizontal tokens={horizontalStackTokens} className={classes.instance26Suiteheade}>
      <Stack.Item align="start">
        <Stack horizontal onClick={() => navigate('/.')} >
          <div id='ProductName+Breadcrumb' className={classes.productnameandbreadcrumb}>
            <div id='ProduceName' className={classes.productname}>
              <div id='ContosoHypermarketDark' className={classes.contosohypermarketdark}>
              </div>
              <div id='AppnameAndPreviewLabel' className={classes.appnameandpreviewlabel}>
                <div id='JumpstartBanner' className={classes.jumpstartbanner}>
                  <img src="Product name.svg" alt="Jumpstart Banner v2 White"/>
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
          <div className={classes.notification}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M9.9979 2C13.1469 2 15.7418 4.33488 15.9824 7.3554L15.9958 7.57762L16.0003 7.80214L15.9993 11.398L16.9247 13.6202C16.9472 13.6743 16.9649 13.7302 16.9776 13.7871L16.9929 13.8733L17.0015 14.0046C17.0015 14.4526 16.705 14.8387 16.2524 14.9677L16.136 14.9945L16.0015 15.0046L12.4999 15.004L12.4949 15.1653C12.4098 16.469 11.3254 17.5 10.0003 17.5C8.67478 17.5 7.59022 16.4685 7.50558 15.1644L7.49986 15.004L3.99915 15.0046C3.9112 15.0046 3.82383 14.993 3.73927 14.9702L3.61481 14.9277C3.20403 14.7567 2.96206 14.3392 3.01246 13.8757L3.03354 13.7483L3.07596 13.6202L3.99926 11.401L4.00035 7.79281L4.00465 7.56824C4.12726 4.45115 6.77129 2 9.9979 2ZM11.4999 15.004H8.49986L8.50722 15.1454C8.57576 15.8581 9.143 16.425 9.8558 16.4931L10.0003 16.5C10.78 16.5 11.4207 15.9051 11.4934 15.1445L11.4999 15.004ZM9.9979 3C7.37535 3 5.22741 4.92372 5.0174 7.38498L5.00417 7.59723L5.00026 7.80214V11.5L4.96185 11.6922L3.99914 14.0046L15.9569 14.0066L16.0021 14.0045L15.0387 11.6922L15.0003 11.5L15.0004 7.81241L14.9963 7.60831C14.8911 5.0349 12.6949 3 9.9979 3Z" fill="white" fill-opacity="0.9"/>
            </svg>
          </div>
        </Stack.Item>
        <Stack.Item align="end">
          <div className={classes.frame7WaffleProd} onClick={callParentFunction}> 
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26" fill="none">
              <path d="M17.7923 26C15.542 26 13.7113 24.0297 13.7113 21.6078V14.3833H15.2369V21.6078C15.2369 23.1246 16.383 24.3581 17.7923 24.3581C19.2016 24.3581 20.3477 23.1246 20.3477 21.6078H21.8733C21.8733 24.0297 20.0425 26 17.7923 26ZM8.20772 26C5.95746 26 4.12674 24.0297 4.12674 21.6078H5.65234C5.65234 23.1246 6.79845 24.3581 8.20772 24.3581C9.61699 24.3581 10.7631 23.1246 10.7631 21.6078V14.3833H12.2887V21.6078C12.2887 24.0297 10.458 26 8.20772 26ZM21.1124 21.2589C18.4159 21.2589 16.2228 18.8986 16.2228 15.9965V12.959H17.7484V15.9965C17.7484 17.9935 19.2588 19.617 21.1124 19.617C22.966 19.617 24.4763 17.9915 24.4763 15.9965C24.4763 15.2659 24.2761 14.5619 23.8947 13.9605C23.2673 12.9672 22.2261 12.374 21.1105 12.374V10.7321C22.7295 10.7321 24.2418 11.5941 25.1552 13.0369C25.7082 13.9113 26 14.9354 26 15.9965C26 18.8986 23.807 21.2589 21.1105 21.2589H21.1124ZM4.88954 21.2589C2.19305 21.2589 0 18.8986 0 15.9965C0 14.9416 0.289864 13.9236 0.835265 13.0534C1.74681 11.6003 3.26287 10.7341 4.88954 10.7341V12.3761C3.77013 12.3761 2.72701 12.9733 2.0996 13.9728C1.72393 14.5722 1.5256 15.272 1.5256 15.9965C1.5256 17.9935 3.03594 19.617 4.88954 19.617C6.74314 19.617 8.25348 17.9915 8.25348 15.9965V12.959H9.77908V15.9965C9.77908 18.8986 7.58604 21.2589 4.88954 21.2589ZM20.1818 15.9965H18.6562V7.61241C18.6562 4.32033 16.1675 1.64193 13.1087 1.64193C10.0499 1.64193 7.56124 4.32033 7.56124 7.61241V15.9965H6.03565V7.61241C6.03565 3.41522 9.20889 0 13.1087 0C17.0085 0 20.1818 3.41522 20.1818 7.61241V15.9965Z" fill="url(#paint0_linear_1439_20141)"/>
              <path d="M11.791 7.52393C11.791 8.34694 11.1712 9.01603 10.4046 9.01603C9.63796 9.01603 9.01819 8.349 9.01819 7.52393H11.791ZM14.2415 7.52393C14.2415 8.34694 14.8612 9.01603 15.6278 9.01603C16.3945 9.01603 17.0142 8.349 17.0142 7.52393H14.2415Z" fill="white"/>
              <defs>
              <linearGradient id="paint0_linear_1439_20141" x1="4.69121" y1="5.91096" x2="22.6465" y2="22.5941" gradientUnits="userSpaceOnUse">
              <stop stop-color="#CC3EF4"/>
              <stop offset="0.06" stop-color="#C243F2"/>
              <stop offset="0.17" stop-color="#A950EE"/>
              <stop offset="0.31" stop-color="#7F67E7"/>
              <stop offset="0.46" stop-color="#4686DD"/>
              <stop offset="0.57" stop-color="#1E9CD7"/>
              <stop offset="0.87" stop-color="#0075BE"/>
              <stop offset="0.99" stop-color="#005B97"/>
              </linearGradient>
              </defs>
            </svg>            
        </div>
        </Stack.Item>
        <Stack.Item align="end" className={classes.accountmanager}>
          <img src="PersonaAsh.png" alt="Sparkle" className={classes.accountmanagerimage} />
        </Stack.Item>
      </Stack>
    </Stack>
    );
};

export default MaintenanceWorkerHeader;