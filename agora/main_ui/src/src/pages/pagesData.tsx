import { routerType } from "../types/router.types";
import Login from "./login";
import Home from "./home";
import StoreManager from "./storemanager";
import MaintenanceWorker from "./maintenanceworker";
import MaintenanceWorkerDashboard from "./maintenanceworkerdashboard";
import InventoryDashboard from "./inventorydashboard";
import CamerasZones from "./cameraszones";
import Shopper from "./shopper";
import Footfall from "./footfall"; 
import Intrusion from "./intrusion"; 

const pagesData: routerType[] = [
  {
    path: "",
    element: <Home />,
    title: "Home"
  },
  {
    path: "login",
    element: <Login />,
    title: "Login"
  },
  {
    path: "storemanager",
    element: <StoreManager />,
    title: "Store Manager"
  },
  {
    path: "maintenanceworker",
    element: <MaintenanceWorker />,
    title: "Maintenance Worker"
  },
  {
    path: "maintenanceworkerdashboard",
    element: <MaintenanceWorkerDashboard />,
    title: "Maintenance Worker Dashboard"
  },
  {
    path: "inventorydashboard",
    element: <InventoryDashboard />,
    title: "Inventory Dashboard"
  },
  {
    path: "cameraszones",
    element: <CamerasZones isOpen={false} onDismiss={() => {}} onSave={() => {}} />,
    title: "Cameras and Zones"
  },
  {
    path: "shopper",
    element: <Shopper />,
    title: "Shopper"
  },
  {
    path: "footfall",
    element: <Footfall />,
    title: "Footfall"
  },
  {
    path: "intrusion",
    element: <Intrusion />,
    title: "Intrusion"
  }
];

export default pagesData;