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

export const SingleSelect = () => {
  const defaultSelectedItems = React.useMemo(() => new Set([1]), []);
  const [data, setData] = useState([]);
  useEffect(() => {
    fetch('http://74.249.31.17:5003/Genie/api/get_applications')
      .then(response => response.json())
      .then(json => setData(json))
      .then()
      .catch(error => console.error(error));
  }, []);
  let counter = 0;
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
  console.log(dataItems);

  return (
    <DataGrid
      items={dataItems}
      columns={columns}
      selectionMode="single"
      defaultSelectedItems={defaultSelectedItems}
      style={{ width: "63vw"}}
      sortable
      sortState={ {sortColumn: "applicationName", sortDirection: "ascending"} }
    >
      <DataGridHeader>
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
