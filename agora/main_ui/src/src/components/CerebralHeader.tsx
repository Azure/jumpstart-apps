import React from 'react';
import { IconButton, Text } from '@fluentui/react';

interface CerebralHeaderProps {
  title?: string;
  onClose: () => void;
  iconSrc: string; // URL or path to the image icon
}

const CerebralHeader: React.FC<CerebralHeaderProps> = ({ title = "Cerebral", onClose }) => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      padding: '10px 20px',
      borderBottom: '1px solid #e1e1e1',
    }}>
      <div style={{ display: 'flex', alignItems: 'left' }}>
        <img src="./Cerebral_round.png" alt="Cerebral Logo" style={{ width: 32, height: 32, marginRight: 10 }} />
        <Text variant="xLarge">{title}</Text>
      </div>
      <IconButton
        iconProps={{ iconName: 'Cancel' }}
        ariaLabel="Close"
        onClick={onClose}
        styles={{
          root: {
            color: '#605e5c',
            fontSize: 16,
          },
        }}
      />
    </div>
  );
};

export default CerebralHeader;
