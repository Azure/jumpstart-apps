import React, { useEffect } from 'react';

const Home = () => {
  useEffect(() => {
    document.body.style.backgroundColor = 'rgb(28, 14, 43)';
    return () => {
      document.body.style.backgroundColor = '';
    };
  }, []);


    return (

    //   <div>
    //   <h1>Home</h1>
    // </div>

      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
          <img src="Product name.svg" alt="Jumpstart Banner v2 White" style={{ height: '100px' }}/>  
          <div style={{ color: 'white', textAlign: 'center' }}>
            <img src="Jumpstart Banner v2 White 2.svg" alt="Jumpstart" style={{ height: '60px', margin: 20 }}/>  
            <ul style={{ listStyleType: 'disc', paddingLeft: '20px' }}>
              <li style={{ listStyleType: 'none' }}><a href="/storemanager" style={{ color: 'white' }}>Store Manager</a></li>
              <li style={{ listStyleType: 'none' }}><a href="/shopper" style={{ color: 'white' }}>Shopper</a></li>
              <li style={{ listStyleType: 'none' }}><a href="/maintenanceworker" style={{ color: 'white' }}>Maintenance Worker</a></li>
            </ul>
          </div>     
      </div>
    );
  };
  
  export default Home;