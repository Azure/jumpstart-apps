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
      background: '#F3FDF8',
      color: '#000000',
      fontSize: '14px',
      fontWeight: '400',
      lineHeight: '16px',
      letterSpacing: '0px',
      textAlign: 'left',
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
        marginLeft: '10px',
        width: '100%',
    }
  });
  const optionsOrderAhead: IDropdownOption[] = [
    { key: 'fruitsHeader', text: 'Fruits', itemType: DropdownMenuItemType.Header },
    { key: 'apple', text: 'Apple' },
    { key: 'banana', text: 'Banana' },
    { key: 'orange', text: 'Orange', disabled: true },
    { key: 'grape', text: 'Grape' },
    { key: 'divider_1', text: '-', itemType: DropdownMenuItemType.Divider },
    { key: 'vegetablesHeader', text: 'Vegetables', itemType: DropdownMenuItemType.Header },
    { key: 'broccoli', text: 'Broccoli' },
    { key: 'carrot', text: 'Carrot' },
    { key: 'lettuce', text: 'Lettuce' },
  ];
    // Styles for the main container Stack
  const containerStyles: IStackStyles = {
    root: {
      width: '100%',
      boxSizing: 'border-box',
      height: '50px',
      justifyContent: 'space-between',
      alignItems: 'center',
      display: 'flex',
      paddingLeft: '0px',
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
      padding: '5px 10px',
      background: '#FFFFFF00',
    },
  };

  // Tokens for spacing between Stack items
  const stackTokens: IStackTokens = {
    childrenGap: 10,
    padding: '0 200px', // This creates equal padding on left and right
  };

const ShopperProdcutsInteraction: React.FC = () => {
    const classes = useStyles();
    const horizontalStackTokens: IStackTokens = {
      childrenGap: 10,
      padding: 10,
    };
    return (
    <Stack id='interactiongrandparent' horizontal styles={containerStyles} tokens={stackTokens}>
      <Stack id='interactionparent'>
        <div id='interaction' className={classes.interaction}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M17.8535 2.85359C18.0488 2.65835 18.0488 2.34176 17.8536 2.14648C17.6583 1.9512 17.3418 1.95117 17.1465 2.14641L14 5.29226V2.5C14 2.22386 13.7761 2 13.5 2C13.2239 2 13 2.22386 13 2.5V5.37707C11.4215 4.59137 9.41094 5.03767 8.35977 6.58276L2.27314 15.5293C1.84508 16.1585 1.92734 16.9996 2.46941 17.5359C3.01926 18.0799 3.88448 18.1549 4.52155 17.7137L13.4518 11.5298C14.9643 10.4825 15.3949 8.53748 14.628 7H17.5C17.7761 7 18 6.77614 18 6.5C18 6.22386 17.7761 6 17.5 6H14.7065L17.8535 2.85359ZM9.19376 7.13816C10.1158 5.78292 12.0586 5.5969 13.2262 6.75207C14.38 7.89364 14.2122 9.78921 12.8754 10.7149L3.94509 16.8988C3.70766 17.0632 3.3852 17.0353 3.18028 16.8326C2.97826 16.6327 2.9476 16.3192 3.10714 16.0847L9.19376 7.13816Z" fill="#424242"/>
            </svg>
            <Text>Produce | Aisle 3</Text>
        </div>
      </Stack>
      <Stack style={{alignSelf: 'right'}}>        
          <Dropdown 
            placeholder="Popularity" 
            options={optionsOrderAhead} 
            className={classes.inputdropdown}
          />
        </Stack>
    </Stack>
    );
};

export default ShopperProdcutsInteraction;