import React, { useState } from 'react';
import PersonaImage from '../assets/PersonaAsh.png'; 
import { Persona } from "@fluentui/react-components";
import { DismissRegular } from "@fluentui/react-icons";
import type { PersonaProps } from "@fluentui/react-components";
import logo from '../logo.svg';
import {
    Dropdown,
    IDropdownOption,
    TextField,
    DefaultButton,
    Stack,
    IStackTokens,
    Text,
  } from '@fluentui/react';
import {
    Card,
    CardFooter,
    CardHeader,
    CardPreview,
    makeStyles,
    Button,
    Link,
    tokens,
    Switch,
    mergeClasses,    
    MessageBar,
    MessageBarActions,
    MessageBarBody,
    MessageBarTitle,
  } from "@fluentui/react-components";
  
  interface Filter {
    name: string;
    value: string;
  }
  const resolveAsset = (asset: string) => {
    const ASSET_URL =
      "https://raw.githubusercontent.com/microsoft/fluentui/master/packages/react-components/react-card/stories/src/assets/";
  
    return `${ASSET_URL}${asset}`;
  };
  const useStyles = makeStyles({
    stack: {
      Width: "100%",
    },
    label: {
        paddingLeft: "10px",
        paddingRight: "10px",
    },
    messageBarStyle :{
        width: "500px",        
        borderImage: "linear-gradient(to right, #1298EB 0%, #C255BB 100%) 1",
        background: "#FFFFFF",
        marginLeft: "10px",
    },
    compact: {
        width: "600px",
      },
      resizableArea: {
        display: "flex",
        flexDirection: "column",
        padding: "30px 10px",
        gap: "10px",
        border: `2px solid ${tokens.colorBrandBackground}`,
        position: "relative",
        overflow: "hidden",
    
        "::after": {
          content: `''`,
          //position: "absolute",
          padding: "1px 4px 1px",
          top: "-2px",
          left: "-2px",
          fontFamily: "monospace",
          fontSize: "15px",
          fontWeight: 900,
          lineHeight: 1,
          letterSpacing: "1px",
          color: tokens.colorNeutralForegroundOnBrand,
          backgroundColor: tokens.colorBrandBackground,
        },
    },
    input: {
        width: "100%",
        height: "32px",
        border: `1px solid ${tokens.colorBrandBackground}`,
        borderRadius: "4px",
        padding: "0 3px",
        flexShrink: 0,
        fill: "var(--light-white-surface-primary-surface-secondary-surface-tertiary-text-on-accent-icon-on-accent, #FFF)",
        stroke: "var(--Light-Theme-Rest-Border-Default-Border, #D1D1D1)",
        strokeWidth: "1px",
    }
  });   

const InPageFilter = () => {
  const styles = useStyles();
  const [compact, setCompact] = React.useState(true);
  const [filters, setFilters] = useState<Filter[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string | undefined>();
  const [filterValue, setFilterValue] = useState('');

  const filterOptions: IDropdownOption[] = [
    { key: 'name', text: 'Name' },
    { key: 'category', text: 'Category' },
    { key: 'status', text: 'Status' },
    // Add more filter options as needed
  ];  
  const handleAddFilter = () => {
    if (selectedFilter && filterValue) {
      setFilters([...filters, { name: selectedFilter, value: filterValue }]);
      setSelectedFilter(undefined);
      setFilterValue('');
    }
  };
  const stackTokens: IStackTokens = { childrenGap: 10 };  
  const handleRemoveFilter = (index: number) => {
    const newFilters = filters.filter((_, i) => i !== index);
    setFilters(newFilters);
  };

  return (
        <Stack className={styles.stack} horizontal>
            <Stack horizontal horizontalAlign="start" tokens={stackTokens}>
                <input type="text" placeholder="Search" className={styles.input} />
            </Stack>
            <Stack horizontal tokens={stackTokens}>
                <Text className={styles.label}>Applied filters</Text>
            </Stack>
            <Stack horizontal tokens={stackTokens}>
                <Text className={styles.label}>Date range: </Text>
            </Stack>
            <Stack horizontal tokens={stackTokens}>
                <Text className={styles.label}>Last 30 days</Text>
            </Stack>
            <Stack horizontal>
            <Stack tokens={stackTokens}>
                <Stack horizontal tokens={stackTokens}>
                    <Dropdown
                    placeholder="Select a filter"
                    options={filterOptions}
                    selectedKey={selectedFilter}
                    onChange={(_, option) => setSelectedFilter(option?.key as string)}
                    styles={{ dropdown: { width: 200 } }}
                    />
                    <TextField
                    placeholder="Enter filter value"
                    value={filterValue}
                    onChange={(_, newValue) => setFilterValue(newValue || '')}
                    styles={{ fieldGroup: { width: 200 } }}
                    />
                    <DefaultButton onClick={handleAddFilter} text="Add Filter" />
                </Stack>
                <Stack horizontal wrap tokens={stackTokens}>
                    {filters.map((filter, index) => (
                    <Stack
                        key={index}
                        horizontal
                        verticalAlign="center"
                        styles={{
                        root: {
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            marginRight: '8px',
                            marginBottom: '8px',
                        },
                        }}
                    >
                        <Text>{`${filter.name}: ${filter.value}`}</Text>
                        <DefaultButton
                        iconProps={{ iconName: 'Cancel' }}
                        onClick={() => handleRemoveFilter(index)}
                        styles={{
                            root: { minWidth: 'auto', padding: '4px' },
                            icon: { fontSize: '12px' },
                        }}
                        />
                    </Stack>
                    ))}
                </Stack>
            </Stack>
            </Stack>
        </Stack>
        
  );
};

export default InPageFilter;