#!/bin/bash

# Wait until SQL Server is ready to accept connections.
echo "Waiting for SQL Server to be ready..."
counter=1
while ! /opt/mssql-tools/bin/sqlcmd -S mssql -U sa -P ArcPassword123!! -Q "SELECT 1" &>/dev/null; do
  echo "SQL Server is not ready yet... retrying ($counter)..."
  counter=$((counter+1))
  sleep 5
  
  # Optionally add a limit to avoid infinite waiting.
  if [ $counter -gt 30 ]; then
    echo "SQL Server didn't become ready in time, exiting..."
    exit 1
  fi
done
echo "SQL Server is ready!"

# Execute the sqlcmd command and capture any output and error
output=$(/opt/mssql-tools/bin/sqlcmd -S mssql -U SA -P ArcPassword123!! -Q "
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'RetailDB')
BEGIN
  CREATE DATABASE RetailDB;
END
USE RetailDB;
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Products')
BEGIN
  CREATE TABLE Products (
    ProductID INT PRIMARY KEY,
    ProductName VARCHAR(100),
    Category VARCHAR(50),
    Description VARCHAR(100),
    Price DECIMAL(10, 2),
    SupplierID INT,
    DateAdded DATE
  );
END
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'StoreInventory')
BEGIN
  CREATE TABLE StoreInventory(
    ProductID INT,
    StoreID INT,
    StockLevel INT,
    ReorderThreshold INT,
    LastRestocked DATE,
    PRIMARY KEY (ProductID, StoreID),
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID), 
    FOREIGN KEY (StoreID) REFERENCES Stores(StoreID)
  );
END
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'WarehouseInventory')
BEGIN
  CREATE TABLE WarehouseInventory(
    ProductID INT,
    StockLevel INT,
    ReorderThreshold INT,
    LastRestocked DATE,
    StorageLocation VARCHAR(20),
    PRIMARY KEY (ProductID),
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID)
  );
END
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Sales')
BEGIN
  CREATE TABLE Sales (
    SaleID INT PRIMARY KEY,
    ProductID INT,
    StoreID INT,
    QuantitySold INT,
    SaleDate DATE,
    SalePrice DECIMAL(10, 2),
    PaymentMethod VARCHAR(20),
    CustomerID INT,
    RegisterID INT,
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID)
  );
END
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Suppliers')
BEGIN
  CREATE TABLE Suppliers (
    SupplierID INT PRIMARY KEY,
    SupplierName VARCHAR(100),
    ContactName VARCHAR(100),
    PhoneNumber VARCHAR(15),
    Email VARCHAR(100),
    DeliveryLeadTimeDays INT
  );
END
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Customers')
BEGIN
  CREATE TABLE Customers (
    CustomerID INT PRIMARY KEY,
    CustomerName VARCHAR(100),
    Email VARCHAR(100),
    LoyaltyPoints INT,
    JoinDate DATE,
    LastSeen DATE
  );
END
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Stores')
BEGIN
  CREATE TABLE Stores(
    StoreID INT PRIMARY KEY,
    StoreName VARCHAR(100),
    Address VARCHAR(100),
    City VARCHAR(100),
    StateCode CHAR(2),
    Zipcode CHAR(5)
  );
END
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Orders')
BEGIN
  CREATE TABLE Orders(
    OrderID INT PRIMARY KEY,
    OrderGenerated DATE,
    DeliveryDate DATE,
    ProductID INT,
    Quantity INT,
    StoreID INT,
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID),
    FOREIGN KEY (StoreID) REFERENCES Stores(StoreID)
  );
END
" 2>&1)

# If the command was successful, print the output and exit
if [ $? -eq 0 ]; then
  echo "Database and tables created successfully."
  echo "$output"
  exit 0
fi