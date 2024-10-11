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
      background: '#F3FDF8',
      height: '50px',
      borderBottom: '1px solid #E0E0E0',
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

const ShopperTopNav: React.FC = () => {
    const classes = useStyles();
    const horizontalStackTokens: IStackTokens = {
      childrenGap: 10,
      padding: 10,
    };
    return (
    <Stack horizontal styles={containerStyles} tokens={stackTokens}>
      <Stack.Item grow styles={itemStyles}>
        <Dropdown 
          placeholder="Order ahead" 
          options={optionsOrderAhead} 
          className={classes.inputdropdown}
        />
      </Stack.Item>
      <Stack.Item grow styles={itemStyles}>
        <Dropdown 
            placeholder="Weekly sales" 
            options={optionsOrderAhead} 
            className={classes.inputdropdown}
          />
      </Stack.Item>
      <Stack.Item grow styles={itemStyles}>
        <Dropdown 
            placeholder="Catering" 
            options={optionsOrderAhead} 
            className={classes.inputdropdown}
          />        
      </Stack.Item>
      <Stack.Item grow styles={itemStyles}>
        <Dropdown 
            placeholder="Recipes" 
            options={optionsOrderAhead} 
            className={classes.inputdropdown}
          />        
      </Stack.Item>
      <Stack.Item grow styles={itemStyles}>        
          <Dropdown 
            placeholder="Delivery & Curbside" 
            options={optionsOrderAhead} 
            className={classes.inputdropdown}
          />
        </Stack.Item>
    </Stack>
    );
};

export default ShopperTopNav;