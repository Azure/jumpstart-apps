import { routerType } from "../types/router.types";
import Home from "./home";
import StoreManager from "./storemanager";
import MaintenanceWorker from "./maintenanceworker";
import MaintenanceWorkerDashboard from "./maintenanceworkerdashboard";
import InventoryDashboard from "./inventorydashboard";
import CamerasZones from "./cameraszones";
import Shopper from "./shopper";
import CamerasZonesWizard from "./camerazoneswizard";
import CamerasZonesWizardAssignCameras from "./camerazoneswizardassigncameras";
import CamerasZonesWizardSetupCamera from "./cameraszoneswizardsetupcamera";
import CamerasZonesWizardFloor from "./camerazoneswizardfloor";
import CamerasZonesWizardReview from "./camerazoneswizardreview";
import ShopperProducts from "./shopperproducts";
import ShopperProductDetail from "./shopperproductdetail";
import ShopperReviewCart from "./shopperreviewcart";
const pagesData: routerType[] = [
  {
    path: "",
    element: <Home />,
    title: "Home"
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
    path: "camerazoneswizard",
    element: <CamerasZonesWizard />,
    title: "Cameras and Zones Wizard"
  },
  {
    path: "camerazoneswizardassigncameras",
    element: <CamerasZonesWizardAssignCameras />,
    title: "Cameras and Zones Wizard | Assign Cameras"
  },
  {
    path: "camerazoneswizardfloor",
    element: <CamerasZonesWizardFloor />,
    title: "Cameras and Zones Wizard | Floor"
  },
  {
    path: "camerazoneswizardreview",
    element: <CamerasZonesWizardReview />,
    title: "Cameras and Zones Wizard | Review"
  },
  {
    path: "camerazoneswizardsetupcamera",
    element: <CamerasZonesWizardSetupCamera />,
    title: "Cameras and Zones Wizard | Setup Camera"
  },
  {
    path: "shopper",
    element: <Shopper isOpen={false} onDismiss={() => {}} onSave={() => {}}/>,
    title: "Shopper"
  },
  {
    path: "shopperproducts",
    element: <ShopperProducts isOpen={false} onDismiss={() => {}} onSave={() => {}}/>,
    title: "Shopper Products Search"
  },
  {
    path: "shopperproductdetail",
    element: <ShopperProductDetail isOpen={false} onDismiss={() => {}} onSave={() => {}} />,
    title: "Shopper Products Detail"
  },
  {
    path: "shopperreviewcart",
    element: <ShopperReviewCart isOpen={false} onDismiss={() => {}} onSave={() => {}}/>,
    title: "Shopper Review Cart"
  },
];

export default pagesData;