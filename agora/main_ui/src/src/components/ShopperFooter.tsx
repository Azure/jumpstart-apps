import { Stack, IStackTokens ,IStackProps, ITheme, IThemeRules, DefaultPalette, IconButton, IIconProps, IStackStyles } from "@fluentui/react";
import { Avatar, Text,  tokens, makeStyles, shorthands, } from "@fluentui/react-components";
import { SearchBox } from "@fluentui/react-search-preview";
import { Dropdown, DropdownMenuItemType, IDropdownStyles, IDropdownOption } from '@fluentui/react/lib/Dropdown';

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
    maincontainer: {
        width: '100%',
        height: '50px',
        flexShrink: 0,
        background: '#F3FDF8',
    },
    inputdropdown: {
      display: 'flex', 
      background: '#FFFFFF00',
      gap: '10px',
      "align-self": 'stretch',
      borderRadius: '4px',
      color: '#000000',
      fontSize: '14px',
      fontWeight: '400',
      lineHeight: '16px',
      letterSpacing: '0px',
      textAlign: 'left',      
      width: '140px',
    },
    inputdropdownitem: {
      background: '#FFFFFF00',
      color: '#000000',
      fontSize: '14px',
      fontWeight: '400',
      lineHeight: '16px',
      letterSpacing: '0px',
      textAlign: 'left',
    },
    footerText: {
        color: 'var(--Black, #253D4E)',
        fontSize: '14px',
        fontWeight: '400',
        fontStyle: 'normal',
        fontFamily: 'Segoe UI',
        lineHeight: '20px',
        letterSpacing: '0px',
        textAlign: 'left',
    },
    footerPayment: {
        width: '224px',
        height: '32px',
    },
    footerSocial: {
        width: '237px',
        padding: '6px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },
    footerSocialIcon: {
        width: '44px',
        height: '44px',
        backgroundImage: `url('Ellipse 5.svg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        display: 'flex',
    },
  });

    // Styles for the main container Stack
  const containerStyles: IStackStyles = {
    root: {
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,        
        width: '100%',
        background: '#F3FDF8',
        height: '73px',
    },
  };

  // Styles for the individual Stack items
  const itemStyles: IStackStyles = {
    root: {
      textAlign: 'center',
      background: '#FFFFFF00',
    },
  };
  // Styles for the individual Stack items
  const footerBottom: IStackStyles = {
    root: {
        display: 'inline-flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '253px',
        alignSelf: 'stretch',
        width: '100%'
    },
  };

  // Tokens for spacing between Stack items
  const stackTokens: IStackTokens = {
    childrenGap: 10,
    padding: '0 200px', // This creates equal padding on left and right
  };

const ShopperFooter: React.FC = () => {
    const classes = useStyles();
    const horizontalStackTokens: IStackTokens = {
      childrenGap: 10,
      padding: 10,
    };
    return (
    <Stack horizontal styles={containerStyles} tokens={stackTokens}>
        <Stack id='footerbottom' styles={footerBottom}>
            <Stack.Item grow styles={itemStyles} id='CopyRight'>
                <Text className={classes.footerText}>© 2024, All rights reserved Arc JumpStart</Text>
            </Stack.Item>
            {/* <Stack.Item grow styles={itemStyles} id='visamastercard'>
                <img src='Payment.png' alt='Visa' className={classes.footerPayment}/>
            </Stack.Item> */}
            <Stack.Item grow styles={itemStyles} id='socialmedia'>
                <div className={classes.footerSocial}>
                    <div className={classes.footerSocialIcon}>
                        <img src='Facebook.svg' alt='Facebook'/>
                    </div>
                    <div className={classes.footerSocialIcon}>
                        <img src='Instagram.svg' alt='Instagram'/>
                    </div>
                    <div className={classes.footerSocialIcon}>
                        <img src='LinkedIn.svg' alt='LinkedIn'/>
                    </div>
                </div>
            </Stack.Item>
      </Stack>
    </Stack>
    );
};

export default ShopperFooter;