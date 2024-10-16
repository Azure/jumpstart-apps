import React, { useState } from 'react';
import {
  Checkbox,
  Text,
  Stack,
  IStackTokens,
  IStackStyles,
  makeStyles,
  getTheme,
  ICheckboxProps,
  ICheckboxStyles
} from '@fluentui/react';

const stackTokens: IStackTokens = { childrenGap: 10 };
const stackStyles: Partial<IStackStyles> = {
  root: {
    width: 300,
    paddingLeft: '30px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    backgroundColor: 'white',
    alignItems: 'flex-start'
  },
};

const useStyles = makeStyles({
  filterboxheader: {
    color: '#000',
    fontFamily: 'var(--Font-family-Base, "Segoe UI")',
    fontSize: 'var(--Font-size-400, 16px)',
    fontStyle: 'normal',
    fontWeight: 600,
    lineHeight: 'var(--Line-height-400, 22px)',
    height: '30px',
  },
  filterboxcheckbox: {
    color: '#000',
    fontFamily: 'var(--Font-family-Base, "Segoe UI")',
    fontSize: 'var(--Font-size-300, 14px)',
    fontStyle: 'normal',
    fontWeight: 400,
    lineHeight: 'var(--Line-height-300, 20px)',
    height: '32px',
    borderRadius: 'var(--Small, 2px)',
  },
});
const theme = getTheme();

const checkboxStyles: Partial<ICheckboxStyles> = {
  checkbox: {
    borderColor: theme.palette.neutralTertiary,
  },
  checkmark: {
    opacity: 0,
  },
  root: { margin: '5px 0' },
};

interface CustomCheckboxProps extends ICheckboxProps {
  label: string;
  defaultChecked?: boolean;
}
const CustomCheckbox: React.FC<CustomCheckboxProps> = ({ label, defaultChecked = false, onChange }) => {
  const [isChecked, setIsChecked] = useState(defaultChecked);

  const handleChange = (ev?: React.FormEvent<HTMLElement | HTMLInputElement>, checked?: boolean) => {
    setIsChecked(checked || false);
    if (onChange) {
      onChange(ev, checked);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={() => handleChange(undefined, !isChecked)}>
      {isChecked ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="0.5" y="0.5" width="15" height="15" rx="1.5" stroke="#616161"/>
          <rect x="1" y="1" width="14" height="14" fill="white"/>
          <path d="M2 0C0.895431 0 0 0.89543 0 2V14C0 15.1046 0.89543 16 2 16H14C15.1046 16 16 15.1046 16 14V2C16 0.895431 15.1046 0 14 0H2ZM11.7995 6.02697L7.35508 10.4712C7.09473 10.7315 6.67263 10.7315 6.41229 10.4712L4.63114 8.69006C4.37079 8.42971 4.37078 8.0076 4.63113 7.74725C4.89148 7.4869 5.31359 7.4869 5.57394 7.74725L6.8837 9.057L10.8567 5.08414C11.1171 4.8238 11.5392 4.82381 11.7996 5.08416C12.0599 5.34452 12.0599 5.76663 11.7995 6.02697Z" fill="#107C10"/>
      </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
          <rect x="0.5" y="0.5" width="15" height="15" rx="1.5" stroke="#616161"/>
        </svg>
      )}
      <span style={{ marginLeft: '8px' }}>{label}</span>
    </div>
  );
};

const FilterBox: React.FC = () => {
  const styles = useStyles();
  return (
    <Stack tokens={stackTokens} styles={stackStyles}>
      <Text variant="xLarge" className={styles.filterboxheader}>Savings</Text>
      <CustomCheckbox label="All Deals" defaultChecked />
      <CustomCheckbox label="BOGO" defaultChecked />

      <Text variant="xLarge" className={styles.filterboxheader} style={{ marginTop: 20 }}>Brand</Text>
      <CustomCheckbox label="California Sun-Dry" defaultChecked className={styles.filterboxcheckbox} />
      <CustomCheckbox label="Florida Village Farms" className={styles.filterboxcheckbox} />
      <CustomCheckbox label="Sunset Valley" className={styles.filterboxcheckbox} />
      <CustomCheckbox label="Fresh Farms" className={styles.filterboxcheckbox} />

      <Text variant="xLarge" className={styles.filterboxheader} style={{ marginTop: 20 }}>Nutrition</Text>
      <CustomCheckbox label="USDA Certified Organic" defaultChecked />
    </Stack>
  );
};

export default FilterBox;