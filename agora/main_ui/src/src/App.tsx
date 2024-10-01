import React from 'react';
import { BrowserRouter } from "react-router-dom";
import Router from "./pages/router";
import {
  FluentProvider,
  webLightTheme,
  Text,
} from "@fluentui/react-components";
import Header from "./components/Header";
import SideMenu from "./components/SideMenu";
import { Default as Banner } from "./components/Banner";
import Cards from "./components/Cards";
import Greetings from "./components/Greetings";
import InventoryStatus from "./components/InventoryStatus";
import Health from "./components/Health";
import { IStackProps, IStackTokens, Stack } from "@fluentui/react";

import { CopilotProvider } from "@fluentui-copilot/react-copilot";
import logo from './logo.svg';
import './App.css';
import Cameras from './components/Cameras';

const Main = (props: IStackProps) => (
  <Stack horizontal grow={1} disableShrink {...props} />
);
const themedMediumStackTokens: IStackTokens = {
  childrenGap: "m",
  padding: "m",
};

function App() {
  return (
    <BrowserRouter>
      <Router />    
    </BrowserRouter>    
  );
}

export default App;
