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
        defaultSelectedValue= {window.location.pathname ==="/maintenanceworkerdashboard" ? "1" : "2"}
        defaultSelectedCategoryValue="1"
        open={true}
        type="inline"
        size="medium"
        style={{ height: "96vh"}}
      >
        <NavDrawerHeader>{renderHamburgerWithToolTip()}</NavDrawerHeader>
        <NavDrawerBody>
          <NavItem icon={<Home />} value="1" href="maintenanceworkerdashboard">
            Overview
          </NavItem>
          <NavItem icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
<path d="M3 5.5C3 4.67157 3.67157 4 4.5 4H15.5C16.3284 4 17 4.67157 17 5.5C17 6.32843 16.3284 7 15.5 7H4.5C3.67157 7 3 6.32843 3 5.5ZM10 10C8.89543 10 8 10.8954 8 12C8 13.1046 8.89543 14 10 14C11.1046 14 12 13.1046 12 12C12 10.8954 11.1046 10 10 10ZM9 12C9 11.4477 9.44772 11 10 11C10.5523 11 11 11.4477 11 12C11 12.5523 10.5523 13 10 13C9.44772 13 9 12.5523 9 12ZM16 8H4V11C4 14.3137 6.68629 17 10 17C13.3137 17 16 14.3137 16 11V8ZM7 12C7 10.3431 8.34315 9 10 9C11.6569 9 13 10.3431 13 12C13 13.6569 11.6569 15 10 15C8.34315 15 7 13.6569 7 12Z" fill="#242424"/>
</svg>
            } value="2" href="cameraszones">
            Cameras and zones
          </NavItem>                       
        </NavDrawerBody>
      </NavDrawer>
    </>
  );
};

export default MaintenanceMenu;