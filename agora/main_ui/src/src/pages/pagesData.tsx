import { routerType } from "../types/router.types";
import Login from "./login";
import Home from "./home";
import StoreManager from "./storemanager";
import MaintenanceWorker from "./maintenanceworker";
import CamerasZones from "./cameraszones";
import Footfall from "./footfall"; // Ensure that the Footfall component exists at this path

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
    path: "cameraszones",
    element: <CamerasZones />,
    title: "Cameras and Zones"
  },
  {
    path: "footfall",
    element: <Footfall />,
    title: "Footfall"
  }
];

export default pagesData;