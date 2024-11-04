import React, { useState, useEffect } from 'react';
import { ICommandBarItemProps, CommandBar, Stack } from "@fluentui/react";
import {
  DataGridBody,
  DataGridRow,
  DataGrid,
  DataGridHeader,
  DataGridHeaderCell,
  DataGridCell,
  TableCellLayout,
  TableColumnDefinition,
  createTableColumn,
  Text,
  makeStyles
} from "@fluentui/react-components";

type ApplianceDeviceNameCell = {
  label: string;
};

type LocationCell = {
  label: string;
};

type TempCell = {
  label: string;
};

type HealthStatusCell = {
  label: string;
};

type DeployedVersionCell = {
  label: string;
};

type LineCell = {
  label: string;
};

type OperatingModeCell = {
    label: string;
  };
  
type HumidityPercentageCell = {
    label: number;
  };

type PowerUsageKwhCell = {
    label: number;
  };

type TemperatureCelsiusCell = {
    label: number;
  };
type DataItem = {
    applianceDeviceName: ApplianceDeviceNameCell;
    location: LocationCell;
    Temp: TempCell;
    healthStatus: HealthStatusCell;
};

type HVACGridDataItem = {
    applianceDeviceName: ApplianceDeviceNameCell;
    humidityPercentage: HumidityPercentageCell;
    operatingMode: OperatingModeCell;
    powerUsageKwh: PowerUsageKwhCell;
    temperatureCelsius: TemperatureCelsiusCell;    
};

type DevicesDataItem = {
    deviceId: string,
    equipementType: string,
    lastUpdated: string
}

type HVACDeviceMetricsDataItem = {
    id: number,
    deviceId: string,
    humidityPercent: number,
    operatingMode: string,
    powerUsageKwh: number,
    temperatureCelsius: number
}
const devicesDataItems: DevicesDataItem [] = [];
const hvacDeviceMetricsDataItems: HVACDeviceMetricsDataItem [] = [];
var hvacGridDataItems: HVACGridDataItem[]=[];
  
const dataItems: DataItem[] = [
];

const columns: TableColumnDefinition<HVACGridDataItem>[] = [
  createTableColumn<HVACGridDataItem>({
    columnId: "applianceDeviceName",
    renderHeaderCell: () => {
      return "Appliance/Device";
    },
    renderCell: (item) => {
      return (
        <TableCellLayout>
          {item.applianceDeviceName.label}
        </TableCellLayout>
      );
    },
  }),
  createTableColumn<HVACGridDataItem>({
    columnId: "humidityPercentage",
    renderHeaderCell: () => {
      return "HumidityPercentage";
    },
    renderCell: (item) => {
      return (
        <TableCellLayout>
          {item.humidityPercentage.label}
        </TableCellLayout>
      );
    },
  }), 

  createTableColumn<HVACGridDataItem>({
    columnId: "operatingMode",
    renderHeaderCell: () => {
      return "OperatingMode";
    },
    renderCell: (item) => {
      return (
        <TableCellLayout>
          {item.operatingMode.label}
        </TableCellLayout>
      );
    },
  }), 
  createTableColumn<HVACGridDataItem>({
    columnId: "powerUsageKwh",
    renderHeaderCell: () => {
      return "Power Usage Kwh";
    },
    renderCell: (item) => {
      return (
        <TableCellLayout>
          {item.powerUsageKwh.label}
        </TableCellLayout>
      );
    },
  }), 
 
  createTableColumn<HVACGridDataItem>({
    columnId: "temperatureCelsius",
    renderHeaderCell: () => {
      return "TemperatureCelsius";
    },
    renderCell: (item) => {
      return (
        <TableCellLayout>
          {item.temperatureCelsius.label}
        </TableCellLayout>
      );
    },
  }), 
];

const useStyles = makeStyles({
    stack: {
      margin: "auto",
      width: "350px",
      maxWidth: "100%",
      paddingLeft: "40px"
    },
    headerContainer: {
      margin: "auto",
      width: "100%",
      maxWidth: "100%",
      
      /* Elevation/Light/Shadow 02 */
      boxShadow: "0px 1px 2px 0px rgba(0, 0, 0, 0.14), 0px 0px 2px 0px rgba(0, 0, 0, 0.12)",
      borderRadius: "8px",
      background: "#FFF"         
    },
    headerAndIcon: {
      margin: "auto",
      width: "100%",
      maxWidth: "100%",
    },
    icon: {
      marginLeft: "16px",
      marginTop: "10px",
      marginBottom: "10px",
    },
    innerTextInIcon: {
      marginLeft: "7px",
      marginTop: "20px",
      alignContent: "start",
      color: "var(--Text-Primary, #323130)",
      fontFamily: "Segoe UI",
      fontSize: "14px",
      fontStyle: "normal",
      fontWeight: "600",
      lineHeight: "20px", /* 142.857% */       
      verticalAlign: "center", 
    }, 
    header: {
      margin:"0 auto"
    },
    ellipses: {
      float:"right",
      width:"40px",
      height:"40px",
      marginRight: "15px"
    }, 
    headerDivider: {
      width: "100%",
      height: "1px",
      flexShrink: "0",
      background: "#C4C4C4"
    }
  });  
export const DeviceStatusGrid = () => {
  const defaultSelectedItems = React.useMemo(() => new Set([1]), []);
  const [data, setData] = useState([]);
  const [metricData, setMetricData] = useState([]);
  const baseApiUrl = process.env.REACT_APP_CEREBRAL_SIMULATOR_API_URL || "/cerebralSimulator_api";

interface DeviceData {
    device_id: string;
    equipment_type: string;
    last_updated: string;
    metrics: MetricData;
  }
  
interface MetricData {
    device_id: string;
    humidity_percent: number;
    id: number;
    operating_mode: string;
    power_usage_kwh: number;
    temperature_celsius: number;

}
const [posts, setPosts] = useState([]);
const [metrics, setMetrics] = useState<DeviceData[]>();
const [loading, setLoading] = useState(true);
const [gridData, setGridData]= useState<HVACGridDataItem[]>();
useEffect(() => {
    fetch(`${baseApiUrl}/api/v1/devices`)
      .then(response => response.json())
      .then(posts => {
        setPosts(posts);
        let postPromises = posts.map((post: { [x: string]: string; }) => {
            if(post["equipment_type"] === "HVAC") {
                var metricURLWithPost = `${baseApiUrl}/api/v1/devices/` + post["equipment_type"] + `/` + post["device_id"] + `/metrics`;
                return fetch(metricURLWithPost)
                    .then(response => response.json());
            }
        });

        return Promise.all(postPromises);
      })
      .then(metricsArray => {
        for(let i=0; i<metricsArray.length; i++) {

        }
        setMetrics(metricsArray);
        setLoading(false);
      })
      .catch(error => {
        console.error(error);
        setLoading(false);
      });
  }, []);

  
  if(metrics) {
    for(let i=0; i < metrics.length; i++) {
        if(metrics[i] && metrics[i] !== undefined)
        {
            var newHVACDeviceMetricsDataItem: HVACDeviceMetricsDataItem = {
                deviceId: metrics[i]["metrics"]["device_id"],
                humidityPercent: metrics[i]["metrics"]["humidity_percent"],
                id: metrics[i]["metrics"]["id"],
                operatingMode: metrics[i]["metrics"]["operating_mode"],
                powerUsageKwh: metrics[i]["metrics"]["power_usage_kwh"],
                temperatureCelsius: metrics[i]["metrics"]["temperature_celsius"],
            }
            if(newHVACDeviceMetricsDataItem) {
                hvacDeviceMetricsDataItems.push(newHVACDeviceMetricsDataItem);
                if(newHVACDeviceMetricsDataItem) {
                    var newHVACGridDataItem:  HVACGridDataItem = {
                        applianceDeviceName: { label: newHVACDeviceMetricsDataItem.deviceId},
                        humidityPercentage: { label: newHVACDeviceMetricsDataItem.humidityPercent},
                        operatingMode: { label: newHVACDeviceMetricsDataItem.operatingMode},
                        powerUsageKwh: { label: newHVACDeviceMetricsDataItem.powerUsageKwh},
                        temperatureCelsius: { label: newHVACDeviceMetricsDataItem.temperatureCelsius},
                    }
                    if(hvacGridDataItems.length<4) {
                        hvacGridDataItems.push(newHVACGridDataItem);    
                    }
                }                        
            }            
        }
    }  
  }
  const styles = useStyles();
  return (
    <DataGrid
      items={hvacGridDataItems}
      columns={columns}
      selectionMode="single"
      defaultSelectedItems={defaultSelectedItems}
      style={{ width: "63vw"}}
      sortable
      sortState={ {sortColumn: "applicationName", sortDirection: "ascending"} }
    >
      <DataGridHeader>
        <DataGridHeaderCell>
            <Stack className={styles.headerContainer}>
                <Stack id="headerAndIcon" horizontal>
                <div id="icon" className={styles.icon}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M10 2C10.2761 2 10.5 2.22386 10.5 2.5V5.54289L12.3964 3.64645C12.5917 3.45118 12.9083 3.45118 13.1036 3.64645C13.2988 3.84171 13.2988 4.15829 13.1036 4.35355L10.5 6.95711V9.5H13.0429L15.6464 6.89645C15.8417 6.70118 16.1583 6.70118 16.3536 6.89645C16.5488 7.09171 16.5488 7.40829 16.3536 7.60355L14.4571 9.5H17.5C17.7761 9.5 18 9.72386 18 10C18 10.2761 17.7761 10.5 17.5 10.5H14.4571L16.3536 12.3964C16.5488 12.5917 16.5488 12.9083 16.3536 13.1036C16.1583 13.2988 15.8417 13.2988 15.6464 13.1036L13.0429 10.5H10.5V13.0429L13.1036 15.6464C13.2988 15.8417 13.2988 16.1583 13.1036 16.3536C12.9083 16.5488 12.5917 16.5488 12.3964 16.3536L10.5 14.4571V17.5C10.5 17.7761 10.2761 18 10 18C9.72386 18 9.5 17.7761 9.5 17.5V14.4571L7.60355 16.3536C7.40829 16.5488 7.09171 16.5488 6.89645 16.3536C6.70118 16.1583 6.70118 15.8417 6.89645 15.6464L9.5 13.0429V10.5H6.95711L4.35355 13.1036C4.15829 13.2988 3.84171 13.2988 3.64645 13.1036C3.45118 12.9083 3.45118 12.5917 3.64645 12.3964L5.54289 10.5H2.5C2.22386 10.5 2 10.2761 2 10C2 9.72386 2.22386 9.5 2.5 9.5H5.54289L3.64645 7.60355C3.45118 7.40829 3.45118 7.09171 3.64645 6.89645C3.84171 6.70118 4.15829 6.70118 4.35355 6.89645L6.95711 9.5H9.5V6.95711L6.89645 4.35355C6.70118 4.15829 6.70118 3.84171 6.89645 3.64645C7.09171 3.45118 7.40829 3.45118 7.60355 3.64645L9.5 5.54289V2.5C9.5 2.22386 9.72386 2 10 2Z" fill="#242424"/>
                    </svg>
                    <Text id="innerTextInIcon" className={styles.innerTextInIcon}>HVAC</Text>
                </div>
                <div id="cameraHeader" className={styles.header}>
                        
                </div>
                <div id="cameraEllipses" className={styles.ellipses}>
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14 19C14.1406 19 14.2708 19.026 14.3906 19.0781C14.5104 19.1302 14.6146 19.2031 14.7031 19.2969C14.7969 19.3854 14.8698 19.4896 14.9219 19.6094C14.974 19.7292 15 19.8594 15 20C15 20.1406 14.974 20.2708 14.9219 20.3906C14.8698 20.5104 14.7969 20.6172 14.7031 20.7109C14.6146 20.7995 14.5104 20.8698 14.3906 20.9219C14.2708 20.974 14.1406 21 14 21C13.8594 21 13.7292 20.974 13.6094 20.9219C13.4896 20.8698 13.3828 20.7995 13.2891 20.7109C13.2005 20.6172 13.1302 20.5104 13.0781 20.3906C13.026 20.2708 13 20.1406 13 20C13 19.8594 13.026 19.7292 13.0781 19.6094C13.1302 19.4896 13.2005 19.3854 13.2891 19.2969C13.3828 19.2031 13.4896 19.1302 13.6094 19.0781C13.7292 19.026 13.8594 19 14 19ZM20 19C20.1406 19 20.2708 19.026 20.3906 19.0781C20.5104 19.1302 20.6146 19.2031 20.7031 19.2969C20.7969 19.3854 20.8698 19.4896 20.9219 19.6094C20.974 19.7292 21 19.8594 21 20C21 20.1406 20.974 20.2708 20.9219 20.3906C20.8698 20.5104 20.7969 20.6172 20.7031 20.7109C20.6146 20.7995 20.5104 20.8698 20.3906 20.9219C20.2708 20.974 20.1406 21 20 21C19.8594 21 19.7292 20.974 19.6094 20.9219C19.4896 20.8698 19.3828 20.7995 19.2891 20.7109C19.2005 20.6172 19.1302 20.5104 19.0781 20.3906C19.026 20.2708 19 20.1406 19 20C19 19.8594 19.026 19.7292 19.0781 19.6094C19.1302 19.4896 19.2005 19.3854 19.2891 19.2969C19.3828 19.2031 19.4896 19.1302 19.6094 19.0781C19.7292 19.026 19.8594 19 20 19ZM26 19C26.1406 19 26.2708 19.026 26.3906 19.0781C26.5104 19.1302 26.6146 19.2031 26.7031 19.2969C26.7969 19.3854 26.8698 19.4896 26.9219 19.6094C26.974 19.7292 27 19.8594 27 20C27 20.1406 26.974 20.2708 26.9219 20.3906C26.8698 20.5104 26.7969 20.6172 26.7031 20.7109C26.6146 20.7995 26.5104 20.8698 26.3906 20.9219C26.2708 20.974 26.1406 21 26 21C25.8594 21 25.7292 20.974 25.6094 20.9219C25.4896 20.8698 25.3828 20.7995 25.2891 20.7109C25.2005 20.6172 25.1302 20.5104 25.0781 20.3906C25.026 20.2708 25 20.1406 25 20C25 19.8594 25.026 19.7292 25.0781 19.6094C25.1302 19.4896 25.2005 19.3854 25.2891 19.2969C25.3828 19.2031 25.4896 19.1302 25.6094 19.0781C25.7292 19.026 25.8594 19 26 19Z" fill="black"/>
                    </svg>
                </div>                
                </Stack>
                <Stack id="headerDivider" className={styles.headerDivider}>
                </Stack>
            </Stack>
        </DataGridHeaderCell>
        <DataGridRow>
          {({ renderHeaderCell }) => (
            <DataGridHeaderCell>{renderHeaderCell()}</DataGridHeaderCell>
          )}
        </DataGridRow>
      </DataGridHeader>
      <DataGridBody<DataItem>>
        {({ item, rowId }) => (
          <DataGridRow<DataItem>
            key={rowId}
            selectionCell={{ radioIndicator: { "aria-label": "Select row" } }}
          >
            {({ renderCell }) => (
              <DataGridCell>{renderCell(item)}</DataGridCell>
            )}
          </DataGridRow>
        )}
      </DataGridBody>
    </DataGrid>
  );
};
