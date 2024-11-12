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
          src={`LogoCerebralChat.svg`} 
          alt="Cerebral Logo" 
          style={{ height: 45, marginRight: 12, marginBottom: 20 }} 
        />
       <div style={{ marginLeft: 20, marginBottom: 30 }} >
          <label htmlFor="debugModeToggle">Debug:</label>
          <input 
            type="checkbox" 
            id="debugModeToggle" 
            onChange={(e) => console.log('Debug mode:', e.target.checked)} 
          />
        </div>
      </div>
    </div>
  );
};

export default CerebralHeader;