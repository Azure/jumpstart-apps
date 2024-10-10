import { Stack, IStackTokens ,IStackProps, ITheme, IThemeRules, DefaultPalette, IconButton, IIconProps } from "@fluentui/react";
import { Avatar, Text,  tokens, makeStyles, shorthands } from "@fluentui/react-components";
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
    instance21CerebralBy: {
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
    rectangle20CerebralBe: {
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
      "background-image": "url('contoso hypermarket logo dark mode.svg')"
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

const SuiteHeader: React.FC = () => {
    const classes = useStyles();
    const horizontalStackTokens: IStackTokens = {
      childrenGap: 10,
      padding: 10,
    };
    return(
      <Stack horizontal tokens={horizontalStackTokens} className={classes.instance26Suiteheade}>
      <Stack.Item align="start">
        <Stack horizontal>
          <div id='ProductName+Breadcrumb' className={classes.productnameandbreadcrumb}>
            <div id='ProduceName' className={classes.productname}>
              <div id='ContosoHypermarketDark' className={classes.contosohypermarketdark}>

              </div>
              <div id='AppnameAndPreviewLabel' className={classes.appnameandpreviewlabel}>
                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="16" viewBox="0 0 17 16" fill="none">
                  <path d="M7.62646 1C7.90261 1 8.12646 1.22386 8.12646 1.5V14.5C8.12646 14.7761 7.90261 15 7.62646 15C7.35032 15 7.12646 14.7761 7.12646 14.5V1.5C7.12646 1.22386 7.35032 1 7.62646 1Z" fill="#FAFAFA"/>
                  <path d="M7.62646 1C7.90261 1 8.12646 1.22386 8.12646 1.5V14.5C8.12646 14.7761 7.90261 15 7.62646 15C7.35032 15 7.12646 14.7761 7.12646 14.5V1.5C7.12646 1.22386 7.35032 1 7.62646 1Z" fill="url(#paint0_radial_797_23925)"/>
                  <defs>
                  <radialGradient id="paint0_radial_797_23925" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(7.62646 8) rotate(90) scale(9.79724 0.699803)">
                  <stop stop-color="#FAFAFA" stop-opacity="0"/>
                  <stop offset="1" stop-color="#F5F5F5"/>
                  </radialGradient>
                  </defs>
                </svg>
                <div id='JumpstartBanner' className={classes.jumpstartbanner}>
                  <img src="JumpstartBannerV2White.svg" alt="Jumpstart Banner v2 White"/>
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
          <div className={classes.frame7WaffleProd}> 
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10C17 13.866 13.866 17 10 17Z" fill="white" fill-opacity="0.9"/>
          </svg>
        </div>
        </Stack.Item>
        <Stack.Item align="end" className={classes.accountmanager}>
          <img src="PersonaLisa.png" alt="Sparkle" className={classes.accountmanagerimage} />
        </Stack.Item>
      </Stack>
    </Stack>
    );
};

export default SuiteHeader;