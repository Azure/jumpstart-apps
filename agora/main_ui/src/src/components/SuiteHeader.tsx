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
      backgroundColor: "#FFFFFF00",
      "display": "flex",
      "width": "468px",
      "height": "32px",
      "justify-content": "center",
      "align-items": "center",
      "position": "absolute",
      "left": "486px",
      "top": "8px",
      "box-shadow": "0px 1px 2px 0px rgba(0, 0, 0, 0.14), 0px 0px 2px 0px rgba(0, 0, 0, 0.12)",
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
        <div className={classes.frame7WaffleProd}> 
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10C17 13.866 13.866 17 10 17Z" fill="white" fill-opacity="0.9"/>
          </svg>
        </div>
        <div className={classes.frame6Productnam}>
        <Text className={classes.text2Appname}> Contoso</Text>
        <Text className={classes.text3Previewlab}> Hypermarket</Text>
        </div>
        </Stack>
      </Stack.Item>
      <Stack.Item align="center" grow={1}>
        <Text>Stack 2 (Center)</Text>
        <div className={classes.instance13Searchbox}>
          <SearchBox placeholder="Search" />
        </div>
      </Stack.Item>
      <Stack horizontal tokens={{ childrenGap: 6 }}>
      <Stack.Item align="end">
            <img src="JumpstartBannerV2White.svg" alt="Jumpstart Banner v2 White" style={{ width: '35%', height: 'auto' }} />
        </Stack.Item>        
        <Stack.Item align="end">
          <Text>Stack 3 (Right) Notification</Text>
        </Stack.Item>
        <Stack.Item align="end">
          <div className={classes.frame7WaffleProd}> 
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18ZM10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10C17 13.866 13.866 17 10 17Z" fill="white" fill-opacity="0.9"/>
          </svg>
        </div>
        </Stack.Item>
        <Stack.Item align="end">
          <img src="PersonaLisa.png" alt="Sparkle" style={{ width: '100%', height: 'auto' }} />
        </Stack.Item>
      </Stack>
    </Stack>
    );
};

export default SuiteHeader;