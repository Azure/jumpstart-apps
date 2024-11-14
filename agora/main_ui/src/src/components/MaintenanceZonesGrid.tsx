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
  zoneDescription: string;
  camera: string;
  cameraDescription: string;
  dateUpdated: string;
}

interface ZoneCameraData {
  zoneId: number;
  cameraId: number;
  zoneName: string;
  zoneDescription: string;
  cameraName: string;
  cameraDescription: string;
  rtspuri: string;
}
interface MaintenanceZonesGridProps {
  zonesCameras: ZoneCameraData[];
}
const MaintenanceZonesGrid: React.FC<MaintenanceZonesGridProps> = (props) => {
  var gridItems:IGridItem[] = [];
  props.zonesCameras.forEach(
    function(value: ZoneCameraData, index: number, array: ZoneCameraData[])  {
      var newIGridItem: IGridItem = {
        camera: value.cameraName,
        cameraDescription: value.cameraDescription,
        zoneDescription: value.zoneDescription,
        zoneName: value.zoneName,
        dateUpdated: (new Date()).toLocaleString()
      }
      gridItems.push(newIGridItem);
    }
  );

  const [items, setItems] = useState<IGridItem[]>(gridItems);

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
      key: 'zoneDescription',
      name: 'Zone Description',
      fieldName: 'zoneDescription',
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
      // onRender: (item: IGridItem) => (
      //   <Link href={`#/camera/${item.camera}`}>{item.camera}</Link>
      // ),
    },
    {
      key: 'cameraDescription',
      name: 'Camera Description',
      fieldName: 'cameraDescription',
      minWidth: 100,
      maxWidth: 200,
      isResizable: true,
      isSorted: false,
      isSortedDescending: false,
      onColumnClick: onColumnClick,
    },
    {
      key: 'dateUpdated',
      name: 'Date updated',
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
      width: '1104px',
      boxSizing: 'border-box',
      border: '1px solid #e0e0e0',
    },
  });
  return (
    <div className={classNames.grid}>
    <DetailsList
      items={gridItems}
      columns={columns}
      setKey="set"
      selectionMode={SelectionMode.none}
      layoutMode={DetailsListLayoutMode.justified}
      styles={{
        root: {
          width: '1104px',
          height: '100%',
        },
      }}
    /></div>
  );
};

export default MaintenanceZonesGrid;