import React, { useState } from 'react';
import {
  DetailsList,
  IColumn,
  SelectionMode,
  DetailsListLayoutMode,
  IDetailsListProps,
  IDetailsListStyles,
  Link,
} from '@fluentui/react';
import { mergeStyleSets } from '@fluentui/react/lib/Styling';
interface IGridItem {
  zoneName: string;
  columnHeaderLabel: string;
  camera: string;
  cameraStatus: string;
  dateUpdated: string;
}

const MaintenanceZonesGrid: React.FC = () => {
  const [items, setItems] = useState<IGridItem[]>([
    // Sample data - replace with your actual data
    {
      zoneName: 'Zone A',
      columnHeaderLabel: 'Header A',
      camera: 'Camera 1',
      cameraStatus: 'Online',
      dateUpdated: '11/2/2024 5:30 PM (GMT+8)',
    },
    {
      zoneName: 'Zone B',
      columnHeaderLabel: 'Header B',
      camera: 'Camera 2',
      cameraStatus: 'Offline',
      dateUpdated: '11/2/2024 5:30 PM (GMT+8)',
    },   
    {
      zoneName: 'Zone C',
      columnHeaderLabel: 'Header C',
      camera: 'Camera 3',
      cameraStatus: 'Online',
      dateUpdated: '11/2/2024 5:30 PM (GMT+8)',
    },
    {
      zoneName: 'Zone D',
      columnHeaderLabel: 'Header D',
      camera: 'Camera 4',
      cameraStatus: 'Offline',
      dateUpdated: '11/2/2024 5:30 PM (GMT+8)',
    },
    {
      zoneName: 'Zone E',
      columnHeaderLabel: 'Header E',
      camera: 'Camera 5',
      cameraStatus: 'Online',
      dateUpdated: '11/2/2024 5:30 PM (GMT+8)',
    },
      
    // ... add more items
  ]);

  const columns: IColumn[] = [
    {
      key: 'zoneName',
      name: 'Zone Name',
      fieldName: 'zoneName',
      minWidth: 200,
      maxWidth: 225,
      isResizable: true,
      isSorted: false,
      isSortedDescending: false,
      onColumnClick: onColumnClick,
    },
    {
      key: 'columnHeaderLabel',
      name: 'Column Header Label',
      fieldName: 'columnHeaderLabel',
      minWidth: 100,
      maxWidth: 200,
      isResizable: true,
      isSorted: false,
      isSortedDescending: false,
      onColumnClick: onColumnClick,
    },
    {
      key: 'camera',
      name: 'Camera',
      fieldName: 'camera',
      minWidth: 100,
      maxWidth: 200,
      isResizable: true,
      isSorted: false,
      isSortedDescending: false,
      onColumnClick: onColumnClick,
      onRender: (item: IGridItem) => (
        <Link href={`#/camera/${item.camera}`}>{item.camera}</Link>
      ),
    },
    {
      key: 'cameraStatus',
      name: 'Camera Status',
      fieldName: 'cameraStatus',
      minWidth: 100,
      maxWidth: 200,
      isResizable: true,
      isSorted: false,
      isSortedDescending: false,
      onColumnClick: onColumnClick,
    },
    {
      key: 'dateUpdated',
      name: 'Date Updated',
      fieldName: 'dateUpdated',
      minWidth: 100,
      maxWidth: 200,
      isResizable: true,
      isSorted: false,
      isSortedDescending: false,
      onColumnClick: onColumnClick,
    },
  ];

  function onColumnClick(ev: React.MouseEvent<HTMLElement>, column: IColumn) {
    const newColumns: IColumn[] = columns.slice();
    const currColumn: IColumn = newColumns.filter(currCol => column.key === currCol.key)[0];
    newColumns.forEach((newCol: IColumn) => {
      if (newCol === currColumn) {
        currColumn.isSortedDescending = !currColumn.isSortedDescending;
        currColumn.isSorted = true;
      } else {
        newCol.isSorted = false;
        newCol.isSortedDescending = true;
      }
    });

    const newItems = copyAndSort(items, currColumn.fieldName!, currColumn.isSortedDescending);
    setItems(newItems);
  }

  function copyAndSort<T>(items: T[], columnKey: string, isSortedDescending?: boolean): T[] {
    const key = columnKey as keyof T;
    return items.slice(0).sort((a: T, b: T) => ((isSortedDescending ? a[key] < b[key] : a[key] > b[key]) ? 1 : -1));
  }
  // Custom styles for the DetailsList
  const gridStyles: Partial<IDetailsListStyles> = {
    root: {
      width: '100%',
      overflowX: 'hidden',
    },
    headerWrapper: {
      marginRight: 0,
    },
    contentWrapper: {
      marginRight: 0,
    },
  };

  // Custom class names for the grid
  const classNames = mergeStyleSets({
    grid: {
      width: '100%',
      boxSizing: 'border-box',
      border: '1px solid #e0e0e0',
    },
  });


  return (
    <div className={classNames.grid}>
    <DetailsList
      items={items}
      columns={columns}
      setKey="set"
      selectionMode={SelectionMode.none}
      layoutMode={DetailsListLayoutMode.justified}
      styles={{
        root: {
          width: '100%',
          height: '100%',
        },
      }}
    /></div>
  );
};

export default MaintenanceZonesGrid;