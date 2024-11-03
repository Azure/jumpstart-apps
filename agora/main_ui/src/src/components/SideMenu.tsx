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

export const SideMenu: React.FC<NavDrawerProps> = () => {
  const renderHamburgerWithToolTip = () => {
    return (
      <Tooltip content="Navigation" relationship="label">
        <Hamburger />
      </Tooltip>
    );
  };

  return (
    <>
      <NavDrawer
        defaultSelectedValue="2"
        defaultSelectedCategoryValue="1"
        open={true}
        type="inline"
        size="medium"
        style={{ height: "96vh", width: "55px"}}
      >
        <NavDrawerHeader>{renderHamburgerWithToolTip()}</NavDrawerHeader>

        <NavDrawerBody>
          <NavItem icon={<Home />} value="1" href="storemanager">
            Home
          </NavItem>
          <NavItem icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12ZM20.5 12C20.5 16.6944 16.6944 20.5 12 20.5C7.30558 20.5 3.5 16.6944 3.5 12C3.5 7.30558 7.30558 3.5 12 3.5C16.6944 3.5 20.5 7.30558 20.5 12Z" fill="#616161"/>
          </svg>  
            } value="2" href="inventorydashboard">
            Applications
          </NavItem>                      
        </NavDrawerBody>
      </NavDrawer>
    </>
  );
};

export default SideMenu;