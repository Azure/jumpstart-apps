import { DrawerProps } from "@fluentui/react-components";
import * as React from "react";
import {
  Hamburger,
  NavDrawer,
  NavDrawerBody,
  NavDrawerHeader,
  NavDrawerProps,
  NavItem,
  NavSectionHeader,
} from "@fluentui/react-nav-preview";

import {
  Tooltip,
} from "@fluentui/react-components";
import {
  MegaphoneLoud20Filled,
  MegaphoneLoud20Regular,
  bundleIcon,
  Home20Filled,
  Home20Regular,
  Grid16Filled,
  TaskListAdd20Filled,
  Circle12Regular
} from "@fluentui/react-icons";

const Home = bundleIcon(Home20Filled, Home20Regular);
const Announcements = bundleIcon(MegaphoneLoud20Filled, MegaphoneLoud20Regular);

export const MaintenanceMenu: React.FC<NavDrawerProps> = () => {
  const renderHamburgerWithToolTip = () => {
    return (
      <Tooltip content="Navigation" relationship="label">
        <Hamburger />
      </Tooltip>
    );
  };
  const handleNavItemPress = (itemId: string) => {
    // Add your custom logic here
    console.log(`NavItem with id ${itemId} was clicked`);
  };

  return (
    <>
      <NavDrawer
        defaultSelectedValue="2"
        defaultSelectedCategoryValue="1"
        open={true}
        type="inline"
        size="medium"
        style={{ height: "96vh"}}
      >
        <NavDrawerHeader>{renderHamburgerWithToolTip()}</NavDrawerHeader>
        <NavDrawerBody>
          <NavItem icon={<Home />} value="1" href="maintenanceworker">
            Overview
          </NavItem>
          <NavItem icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
<path d="M3 5.5C3 4.67157 3.67157 4 4.5 4H15.5C16.3284 4 17 4.67157 17 5.5C17 6.32843 16.3284 7 15.5 7H4.5C3.67157 7 3 6.32843 3 5.5ZM10 10C8.89543 10 8 10.8954 8 12C8 13.1046 8.89543 14 10 14C11.1046 14 12 13.1046 12 12C12 10.8954 11.1046 10 10 10ZM9 12C9 11.4477 9.44772 11 10 11C10.5523 11 11 11.4477 11 12C11 12.5523 10.5523 13 10 13C9.44772 13 9 12.5523 9 12ZM16 8H4V11C4 14.3137 6.68629 17 10 17C13.3137 17 16 14.3137 16 11V8ZM7 12C7 10.3431 8.34315 9 10 9C11.6569 9 13 10.3431 13 12C13 13.6569 11.6569 15 10 15C8.34315 15 7 13.6569 7 12Z" fill="#242424"/>
</svg>
            } value="2" href="cameraszones">
            Cameras and zones
          </NavItem>
          <NavItem icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M6.52832 7.75C6.52832 8.16421 6.19253 8.5 5.77832 8.5C5.36411 8.5 5.02832 8.16421 5.02832 7.75C5.02832 7.33579 5.36411 7 5.77832 7C6.19253 7 6.52832 7.33579 6.52832 7.75ZM5.78125 15C5.36704 15 5.03125 15.3358 5.03125 15.75C5.03125 16.1642 5.36704 16.5 5.78125 16.5H10.7812C11.1955 16.5 11.5312 16.1642 11.5312 15.75C11.5312 15.3358 11.1955 15 10.7812 15H5.78125ZM5.03125 11.75C5.03125 11.3358 5.36704 11 5.78125 11H10.7812C11.1955 11 11.5312 11.3358 11.5312 11.75C11.5312 12.1642 11.1955 12.5 10.7812 12.5H5.78125C5.36704 12.5 5.03125 12.1642 5.03125 11.75ZM15 21C15.9411 20.9936 16.7494 20.3272 16.9342 19.4032L17.4149 17H20.25C21.2165 17 22 16.2165 22 15.25V9.26115C22 8.01607 20.9937 7.00603 19.75 7.00003V6.99609H14.5V5.25C14.5 4.00736 13.4926 3 12.25 3H4.25C3.00736 3 2 4.00736 2 5.25V17.75C2 19.5449 3.45507 21 5.25 21H14.9864L15 21ZM3.5 5.25C3.5 4.83579 3.83579 4.5 4.25 4.5H12.25C12.6642 4.5 13 4.83579 13 5.25V19.0136C13 19.1814 13.0208 19.3444 13.06 19.5H5.25C4.2835 19.5 3.5 18.7165 3.5 17.75V5.25ZM14.5 8.49609H17.6109C17.5737 8.5997 17.5437 8.70708 17.5216 8.8177L15.4633 19.109C15.4179 19.3363 15.2183 19.5 14.9864 19.5C14.7178 19.5 14.5 19.2822 14.5 19.0136V8.49609ZM18.9925 9.11188C19.0636 8.7561 19.376 8.5 19.7388 8.5C20.1592 8.5 20.5 8.84078 20.5 9.26115V15.25C20.5 15.3881 20.3881 15.5 20.25 15.5H17.7149L18.9925 9.11188Z" fill="#616161"/>
            </svg>
            } value="3">
            Tasks
          </NavItem>     
          <NavItem icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12ZM20.5 12C20.5 16.6944 16.6944 20.5 12 20.5C7.30558 20.5 3.5 16.6944 3.5 12C3.5 7.30558 7.30558 3.5 12 3.5C16.6944 3.5 20.5 7.30558 20.5 12Z" fill="#616161"/>
            </svg>            
          } value="4">
            [Section]
          </NavItem>                          
        </NavDrawerBody>
      </NavDrawer>
    </>
  );
};

export default MaintenanceMenu;