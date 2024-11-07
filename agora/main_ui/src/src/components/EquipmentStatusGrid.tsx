import React, { useState, useEffect } from 'react';
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
  makeStyles
} from "@fluentui/react-components";

type ApplicationNameCell = {
  label: string;
};

type ConfiguredStatusCell = {
  label: string;
};

type ConfiguredVersionCell = {
  label: string;
};

type DeployedStatusCell = {
  label: string;
};

type DeployedVersionCell = {
  label: string;
};

type LineCell = {
  label: string;
};

type DataItem = {
  applicationName: ApplicationNameCell;
  configuredStatus: ConfiguredStatusCell;
  configuredVersion: ConfiguredVersionCell;
  deployedStatus: DeployedStatusCell;
  deployedVersion: DeployedVersionCell;
  line: LineCell;
};


const dataItems: DataItem[] = [
];

const columns: TableColumnDefinition<DataItem>[] = [
  createTableColumn<DataItem>({
    columnId: "applicationName",
    renderHeaderCell: () => {
      return "Application name";
    },
    renderCell: (item) => {
      return (
        <TableCellLayout>
          {item.applicationName.label}
        </TableCellLayout>
      );
    },
  }),
  createTableColumn<DataItem>({
    columnId: "configuredStatus",
    renderHeaderCell: () => {
      return "Configured status";
    },
    renderCell: (item) => {
      return (
        <TableCellLayout>
          {item.configuredStatus.label}
        </TableCellLayout>
      );
    },
  }), 

  createTableColumn<DataItem>({
    columnId: "configuredVersion",
    renderHeaderCell: () => {
      return "Configured version";
    },
    renderCell: (item) => {
      return (
        <TableCellLayout>
          {item.configuredVersion.label}
        </TableCellLayout>
      );
    },
  }), 
  createTableColumn<DataItem>({
    columnId: "deployedStatus",
    renderHeaderCell: () => {
      return "Deployed status";
    },
    renderCell: (item) => {
      return (
        <TableCellLayout>
          {item.deployedStatus.label}
        </TableCellLayout>
      );
    },
  }), 
  createTableColumn<DataItem>({
    columnId: "deployedVersion",
    renderHeaderCell: () => {
      return "Deployed version";
    },
    renderCell: (item) => {
      return (
        <TableCellLayout>
          {item.deployedVersion.label}
        </TableCellLayout>
      );
    },
  }), 
  createTableColumn<DataItem>({
    columnId: "line",
    renderHeaderCell: () => {
      return "Line";
    },
    renderCell: (item) => {
      return (
        <TableCellLayout>
          {item.line.label}
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
  },
  gridHeaderContainer:{
      borderRadius: "8px",
      border: "0.5px solid var(--Surfaces-Inactive, #E1DFDD)",
      background: "var(--Surfaces-Surface, #FFF)",
  },
  gridHeader: {
      color: "#242424",
      /* Azure / Data Vis / Metrics Unit */
      fontFamily: "Segoe UI",
      fontSize: "13px",
      fontStyle: "normal",
      fontWeight: "600",
      lineHeight: "18px", /* 138.462% */        
      minHeight: "50px", 
      justifyContent: "center", 
      alignItems: "center",
      display: "flex",
      padding: "11px var(--Horizontal-S, 8px) 13px var(--Horizontal-S, 8px)",
      gap: "var(--Horizontal-S, 8px)",
      flex: "1 0 0",
      alignSelf: "stretch",       }
});  

export const EquipmentStatusGrid = () => {
  const defaultSelectedItems = React.useMemo(() => new Set([1]), []);
  const [data, setData] = useState([]);
  const baseApiUrl = process.env.REACT_APP_CEREBRAL_API_URL || '/Cerebral';
  useEffect(() => {
    fetch(`${baseApiUrl}/api/get_applications`)
      .then(response => response.json())
      .then(json => setData(json))
      .then()
      .catch(error => console.error(error));
  }, []);
  let counter = 0;
  console.log(data);
  data.forEach(
    function(d){
        counter = counter + 1;
      var newDataItem: DataItem = {
        applicationName: { label: d["application_name"] },
        configuredStatus: { label: d["configured_status"] },
        configuredVersion: { label: d["configured_version"]},
        deployedStatus: { label: d["deployed_status"]},
        deployedVersion: { label: "1.0.1"},
        line: { label: d["line"]},        
      };
      console.log(counter);
      if(counter < 3) {
        dataItems.push(newDataItem);
      }
     }
  )  
  const styles = useStyles();
  return (
    <DataGrid
      items={dataItems}
      columns={columns}
      selectionMode="single"
      defaultSelectedItems={defaultSelectedItems}
      style={{marginLeft: "10px", marginTop: "11px", width: "63vw", background: "var(--Surfaces-Surface, #FFF)", borderRadius: "8px", border: "0.5px solid var(--Surfaces-Inactive, #E1DFDD)" }}
      sortable
      sortState={ {sortColumn: "applicationName", sortDirection: "ascending"} }
    >
      <DataGridHeader>
        <DataGridRow>
          {({ renderHeaderCell }) => (
            <DataGridHeaderCell className={styles.gridHeader}>{renderHeaderCell()}</DataGridHeaderCell>
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
