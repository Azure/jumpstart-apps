import React from 'react';
import { IconButton, Text } from '@fluentui/react';

interface CerebralHeaderProps {
  title?: string;
  onClose: () => void;
  iconSrc?: string;
}

const CerebralHeader: React.FC<CerebralHeaderProps> = ({ 
  title = "Jumpstart Cerebral", 
  onClose,
}) => {
  return (
    <div style={{
      display: 'flex !important',
      justifyContent: 'flex-start !important',
      alignItems: 'center !important',
      width: '100%',
      padding: '5px 16px',
      position: 'relative',  // Add this
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        flex: '1 1 auto',
      }}>
        <img 
          src="./Cerebral_round.png" 
          alt="Cerebral Logo" 
          style={{ width: 32, height: 32, marginRight: 12 }} 
        />
        <Text variant="xLarge">{title}</Text>
      </div>
    </div>
  );
};

export default CerebralHeader;