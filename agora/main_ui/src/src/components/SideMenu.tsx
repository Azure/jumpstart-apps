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
        style={{ height: "96vh"}}
      >
        <NavDrawerHeader>{renderHamburgerWithToolTip()}</NavDrawerHeader>

        <NavDrawerBody>
          <NavItem icon={<Home />} value="1">
            Home
          </NavItem>
          <NavItem icon={
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18.4923 2.32991L21.671 5.50868C22.5497 6.38736 22.5497 7.81198 21.671 8.69066L19.0866 11.2746C20.1696 11.437 21 12.3713 21 13.4996V18.7496C21 19.9922 19.9926 20.9996 18.75 20.9996H5.25C4.00736 20.9996 3 19.9922 3 18.7496V5.24958C3 4.00694 4.00736 2.99958 5.25 2.99958H10.5C11.6289 2.99958 12.5637 3.83103 12.7253 4.91498L15.3103 2.32991C16.189 1.45123 17.6136 1.45123 18.4923 2.32991ZM4.5 18.7496C4.5 19.1638 4.83579 19.4996 5.25 19.4996L11.249 19.4989L11.25 12.7496L4.5 12.7489V18.7496ZM12.749 19.4989L18.75 19.4996C19.1642 19.4996 19.5 19.1638 19.5 18.7496V13.4996C19.5 13.0854 19.1642 12.7496 18.75 12.7496L12.749 12.7489V19.4989ZM10.5 4.49958H5.25C4.83579 4.49958 4.5 4.83536 4.5 5.24958V11.2489H11.25V5.24958C11.25 4.83536 10.9142 4.49958 10.5 4.49958ZM12.75 9.3089V11.2496L14.69 11.2489L12.75 9.3089Z" fill="#0F6CBD"/>
            </svg>
            } value="2">
            Applications
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

export default SideMenu;