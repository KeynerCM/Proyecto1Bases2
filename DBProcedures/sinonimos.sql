-- SINONIMOS
-- Los procedimientos acceden a las tablas por medio de
-- estos nombres y no directamente por esquema.tabla

USE WideWorldImporters;
GO

-- INVENTARIOS

DROP SYNONYM IF EXISTS dbo.syn_StockItems;
CREATE SYNONYM dbo.syn_StockItems FOR Warehouse.StockItems;

DROP SYNONYM IF EXISTS dbo.syn_StockItemHoldings;
CREATE SYNONYM dbo.syn_StockItemHoldings FOR Warehouse.StockItemHoldings;

DROP SYNONYM IF EXISTS dbo.syn_StockItemStockGroups;
CREATE SYNONYM dbo.syn_StockItemStockGroups FOR Warehouse.StockItemStockGroups;

DROP SYNONYM IF EXISTS dbo.syn_StockGroups;
CREATE SYNONYM dbo.syn_StockGroups FOR Warehouse.StockGroups;

DROP SYNONYM IF EXISTS dbo.syn_Colors;
CREATE SYNONYM dbo.syn_Colors FOR Warehouse.Colors;

DROP SYNONYM IF EXISTS dbo.syn_PackageTypes;
CREATE SYNONYM dbo.syn_PackageTypes FOR Warehouse.PackageTypes;

DROP SYNONYM IF EXISTS dbo.syn_Suppliers;
CREATE SYNONYM dbo.syn_Suppliers FOR Purchasing.Suppliers;
GO

-- VENTAS

DROP SYNONYM IF EXISTS dbo.syn_Invoices;
CREATE SYNONYM dbo.syn_Invoices FOR Sales.Invoices;

DROP SYNONYM IF EXISTS dbo.syn_InvoiceLines;
CREATE SYNONYM dbo.syn_InvoiceLines FOR Sales.InvoiceLines;

DROP SYNONYM IF EXISTS dbo.syn_Customers;
CREATE SYNONYM dbo.syn_Customers FOR Sales.Customers;

DROP SYNONYM IF EXISTS dbo.syn_DeliveryMethods;
CREATE SYNONYM dbo.syn_DeliveryMethods FOR Application.DeliveryMethods;

DROP SYNONYM IF EXISTS dbo.syn_People;
CREATE SYNONYM dbo.syn_People FOR Application.People;
GO

-- ESTADISTICAS

DROP SYNONYM IF EXISTS dbo.syn_PurchaseOrders;
CREATE SYNONYM dbo.syn_PurchaseOrders FOR Purchasing.PurchaseOrders;

DROP SYNONYM IF EXISTS dbo.syn_PurchaseOrderLines;
CREATE SYNONYM dbo.syn_PurchaseOrderLines FOR Purchasing.PurchaseOrderLines;
GO
