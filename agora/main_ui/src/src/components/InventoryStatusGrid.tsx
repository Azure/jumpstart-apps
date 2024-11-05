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

type ProductNameCell = {
  label: string;
};

type ProductIdCell = {
  label: string;
};

type InventoryOutTimeCell = {
  label: string;
};

type InventoryStateOfShelfCell = {
  label: string;
};

type DataItem = {
  productName: ProductNameCell;
  productId: ProductIdCell;
  inventoryOutTime: InventoryOutTimeCell;
  InventoryStateOfShelf: InventoryStateOfShelfCell;
};



const columns: TableColumnDefinition<DataItem>[] = [
  createTableColumn<DataItem>({
    columnId: "productName",
    renderHeaderCell: () => {
      return "Product name";
    },
    renderCell: (item) => {
      return (
        <TableCellLayout>
            <Stack>
                {item.productName.label}
                <Text style={{
                    color: "var(--Button-Button-Text, #323130)", 
                    background: "var(--Neutral-Grey-84, #D6D6D6)",
                    borderRadius: "2px",
                    fontFamily: "Segoe UI",
                    fontSize: "12px", 
                    fontStyle: "normal", 
                    fontWeight: "400", 
                    padding: "0px 5px",
                    gap: "10px",
                    lineHeight: "20px",  /* 166.667% */ }}>Top 25 most purchased product</Text>
          </Stack>
        </TableCellLayout>
      );
    },
  }),
  createTableColumn<DataItem>({
    columnId: "productId",
    renderHeaderCell: () => {
      return "Product ID";
    },
    renderCell: (item) => {
      return (
        <TableCellLayout>
            <Text style={{
                    color: "#1C5E75", 
                    borderRadius: "2px",
                    fontFamily: "Segoe UI",
                    fontSize: "14px", 
                    fontStyle: "normal", 
                    fontWeight: "400", 
                    padding: "0px 5px",
                    gap: "10px",
                    textDecorationLine: "underline",
                    lineHeight: "20px",  /* 166.667% */ }}>
                {item.productId.label}
            </Text>
        </TableCellLayout>
      );
    },
  }), 

  createTableColumn<DataItem>({
    columnId: "inventoryOutTime",
    renderHeaderCell: () => {
      return "Inventory out time";
    },
    renderCell: (item) => {
      return (
        <TableCellLayout>
            <Stack>
                {item.inventoryOutTime.label} days
                <Text style={{
                    color: "var(--Button-Button-Text, #323130)", 
                    borderRadius: "2px",
                    fontFamily: "Segoe UI",
                    fontSize: "12px", 
                    fontStyle: "normal", 
                    fontWeight: "400", 
                    padding: "0px 5px",
                    gap: "10px",
                    lineHeight: "20px",  /* 166.667% */ }}>High probability<svg style={{verticalAlign: "middle", marginLeft: "2px"}} xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none">
                    <path d="M9.06283 8.1819C9.06277 7.90576 8.83887 7.68234 8.56273 7.68289C8.28658 7.68344 8.06277 7.90774 8.06283 8.18388L8.06344 11.1839C8.0635 11.46 8.2874 11.6834 8.56354 11.6829C8.83968 11.6823 9.06349 11.458 9.06344 11.1819L9.06283 8.1819ZM9.31146 6.18144C9.31155 6.59512 8.97626 6.93114 8.56258 6.93196C8.1489 6.93278 7.81348 6.59809 7.8134 6.18441C7.81331 5.77073 8.1486 5.43471 8.56228 5.43389C8.97596 5.43307 9.31138 5.76776 9.31146 6.18144ZM8.56248 1.68291C4.6965 1.69057 1.56314 4.83078 1.56393 8.69677C1.56471 12.5628 4.69935 15.6906 8.56533 15.6829C12.4313 15.6752 15.5647 12.535 15.5639 8.66904C15.5631 4.80305 12.4285 1.67525 8.56248 1.68291ZM2.56392 8.69479C2.56325 5.38109 5.24898 2.68948 8.56268 2.68291C11.8764 2.67635 14.5632 5.35732 14.5639 8.67102C14.5646 11.9847 11.8788 14.6763 8.56513 14.6829C5.25143 14.6895 2.5646 12.0085 2.56392 8.69479Z" fill="#616161"/>
                    </svg></Text>                
          </Stack>
        </TableCellLayout>
      );
    },
  }), 
  createTableColumn<DataItem>({
    columnId: "InventoryStateOfShelf",
    renderHeaderCell: () => {
      return "Inventory state of shelf (below recommended)";
    },
    renderCell: (item) => {
      return (
        <TableCellLayout>
            <Stack>
                <svg xmlns="http://www.w3.org/2000/svg" width="141" height="9" viewBox="0 0 141 9" fill="none">
                    <rect width="80.752" height="8" transform="matrix(1 -0.000521861 0.000894493 0.999999 0.649902 0.714111)" fill="#DB7500"/>
                    <rect width="57.6502" height="8" transform="matrix(1 -0.000521861 0.000894493 0.999999 83.1323 0.671082)" fill="#E1DFDD"/>
                </svg>
                {item.InventoryStateOfShelf.label}

            </Stack>
        </TableCellLayout>
      );
    },
  }) 
];

const useStyles = makeStyles({
    stack: {
      margin: "auto",
      width: "350px",
      maxWidth: "100%",
      paddingLeft: "40px"
    },
    topProduct: {
        color: "var(--Button-Button-Text, #323130)", 
        fontFamily: "Segoe UI",
        fontSize: "12px", 
        fontStyle: "normal", 
        fontWeight: "400", 
        lineHeight: "20px",  /* 166.667% */        
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
        alignSelf: "stretch",       
    }
  });  
  function daysBetween(date: Date): number {
    const today = new Date();
    const diff = today.getTime() - date.getTime();
    return Math.round(diff / (1000 * 60 * 60 * 24));
  }
export const InventoryStatusGrid = () => {
  const defaultSelectedItems = React.useMemo(() => new Set([1]), []);
  const [data, setData] = useState([]);
  const baseApiUrl = process.env.REACT_APP_CEREBRAL_SIMULATOR_API_URL || '/Cerebral';
  console.log("baseApiUrl");
  console.log(baseApiUrl);
  useEffect(() => {
    fetch(`${baseApiUrl}/api/v1/inventory`)
      .then(response => response.json())
      .then(json => setData(json))
      .then()
      .catch(error => console.error(error));
  }, []);
  let counter = 0;
  console.log("Inventory data");
  var jsonObject = JSON.parse(JSON.stringify(data));
  console.log(jsonObject);
  console.log("jsonObject.inventory");
  console.log(jsonObject.inventory);
  
  const dataItems: DataItem[] = [];
  if(jsonObject.inventory) {
    for(let index = 0; index < jsonObject.inventory.length; index++)
    {
        counter = counter + 1;
        var newDataItem: DataItem = {
            productName: { label: jsonObject.inventory[index]["product_name"] },
            productId: { label: jsonObject.inventory[index]["product_id"] },
            inventoryOutTime: { label: daysBetween(new Date(jsonObject.inventory[index]["last_restocked"])).toString()},
            InventoryStateOfShelf: { label: jsonObject.inventory[index]["reorder_threshold"] + " of " + jsonObject.inventory[index]["in_stock"] },
        };
        console.log(counter);
        if(counter < 5) {
            dataItems.push(newDataItem);
        }
    }
}
  console.log("Inventory dataItems");
  console.log(dataItems);
  const styles = useStyles();
  return (
    <DataGrid
      items={dataItems}
      columns={columns}
      selectionMode="single"
      defaultSelectedItems={defaultSelectedItems}
      style={{ marginTop: "0px", width: "63vw", background: "var(--Surfaces-Surface, #FFF)", borderRadius: "8px", border: "0.5px solid var(--Surfaces-Inactive, #E1DFDD)" }}
      sortable
      sortState={ {sortColumn: "productName", sortDirection: "ascending"} }
    >
      <DataGridHeader>
        <DataGridHeaderCell>
            <Stack className={styles.headerContainer}>
                <Stack id="headerAndIcon" horizontal>
                <div id="icon" className={styles.icon}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M4 3.5C4 3.22386 3.77614 3 3.5 3C3.22386 3 3 3.22386 3 3.5V14.5C3 15.8807 4.11929 17 5.5 17H16.5C16.7761 17 17 16.7761 17 16.5C17 16.2239 16.7761 16 16.5 16H5.5C4.67157 16 4 15.3284 4 14.5V3.5ZM12.5 5C12.2239 5 12 5.22386 12 5.5C12 5.77614 12.2239 6 12.5 6H15.2929L11 10.2929L9.35356 8.64645C9.25979 8.55268 9.13261 8.5 9 8.5C8.86739 8.5 8.74022 8.55268 8.64645 8.64645L5.14645 12.1464C4.95118 12.3417 4.95118 12.6583 5.14645 12.8536C5.34171 13.0488 5.65829 13.0488 5.85355 12.8536L9 9.70711L10.6464 11.3536C10.7402 11.4473 10.8674 11.5 11 11.5C11.1326 11.5 11.2598 11.4473 11.3535 11.3536L16 6.70708V9.5C16 9.77614 16.2239 10 16.5 10C16.7761 10 17 9.77614 17 9.5V5.5C17 5.22386 16.7761 5 16.5 5H12.5Z" fill="#242424"/>
                  </svg>
                    <Text id="innerTextInIcon" className={styles.innerTextInIcon}>Inventory Status </Text>
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
