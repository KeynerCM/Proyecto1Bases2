--vISTAS DE ESTADISTICAS


CREATE OR ALTER VIEW vw_EstadisticasCompras AS
SELECT 
    po.SupplierID,
    s.SupplierName AS Proveedor,
    sc.SupplierCategoryName AS Categoria,
    SUM(pol.OrderedOuters * pol.ExpectedUnitPricePerOuter) AS TotalCompra
FROM Purchasing.PurchaseOrders po
JOIN Purchasing.Suppliers s ON po.SupplierID = s.SupplierID
JOIN Purchasing.SupplierCategories sc ON s.SupplierCategoryID = sc.SupplierCategoryID
JOIN Purchasing.PurchaseOrderLines pol ON po.PurchaseOrderID = pol.PurchaseOrderID
GROUP BY ROLLUP (s.SupplierName, sc.SupplierCategoryName, po.SupplierID);
GO

CREATE OR ALTER VIEW vw_EstadisticasVentas AS
SELECT 
    c.CustomerID,
    c.CustomerName AS Cliente,
    cc.CustomerCategoryName AS Categoria,
    SUM(il.Quantity * il.UnitPrice) AS TotalVenta
FROM Sales.Invoices i
JOIN Sales.Customers c ON i.CustomerID = c.CustomerID
JOIN Sales.InvoiceLines il ON i.InvoiceID = il.InvoiceID
JOIN Sales.CustomerCategories cc ON c.CustomerCategoryID = cc.CustomerCategoryID
GROUP BY ROLLUP (c.CustomerName, cc.CustomerCategoryName, c.CustomerID);
GO

--PROCEDIMIENTO DE ESTADISTICAS 1
CREATE PROCEDURE EstadisticasCompras
    @Proveedor NVARCHAR(100) = NULL,
    @Categoria NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        Proveedor,
        Categoria,
        MAX(TotalCompra) AS CompraMaxima,
        MIN(TotalCompra) AS CompraMinima,
        AVG(TotalCompra) AS PromedioCompras
    FROM vw_EstadisticasCompras
    WHERE
        (@Proveedor IS NULL OR Proveedor LIKE '%' + @Proveedor + '%')
        AND (@Categoria IS NULL OR Categoria LIKE '%' + @Categoria + '%')
    GROUP BY ROLLUP (Proveedor, Categoria)
    ORDER BY Proveedor, Categoria;
END;
GO
--PROCEDIMIENTO DE ESTADISTICAS 2
CREATE PROCEDURE EstadisticasVentas
    @Cliente NVARCHAR(100) = NULL,
    @Categoria NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        Cliente,
        Categoria,
        MAX(TotalVenta) AS VentaMaxima,
        MIN(TotalVenta) AS VentaMinima,
        AVG(TotalVenta) AS PromedioVentas
    FROM vw_EstadisticasVentas
    WHERE
        (@Cliente IS NULL OR Cliente LIKE '%' + @Cliente + '%')
        AND (@Categoria IS NULL OR Categoria LIKE '%' + @Categoria + '%')
    GROUP BY ROLLUP (Cliente, Categoria)
    ORDER BY Cliente, Categoria;
END;
GO

--PROCDIMIENTO DE ESTADISTICAS 3
CREATE OR ALTER PROCEDURE Top5ProductosPorAnio
    @Anio INT
AS
BEGIN
    SET NOCOUNT ON;

    WITH CTE_Ganancias AS (
        SELECT 
            YEAR(i.InvoiceDate) AS Anio,
            s.StockItemName AS Producto,
            SUM(il.Quantity * (il.UnitPrice - il.TaxRate)) AS GananciaTotal,
            DENSE_RANK() OVER (PARTITION BY YEAR(i.InvoiceDate) ORDER BY SUM(il.Quantity * (il.UnitPrice - il.TaxRate)) DESC) AS RankProducto
        FROM Sales.Invoices i
        JOIN Sales.InvoiceLines il ON i.InvoiceID = il.InvoiceID
        JOIN Warehouse.StockItems s ON il.StockItemID = s.StockItemID
        WHERE YEAR(i.InvoiceDate) = @Anio
        GROUP BY YEAR(i.InvoiceDate), s.StockItemName
    )
    SELECT Anio, Producto, GananciaTotal
    FROM CTE_Ganancias
    WHERE RankProducto <= 5
    ORDER BY GananciaTotal DESC;
END;
GO

---PROCEDIMIENTO DE ESTADISTICAS 4

CREATE OR ALTER PROCEDURE Top5ClientesFacturas
    @AnioInicio INT,
    @AnioFin INT
AS
BEGIN
    SET NOCOUNT ON;

    WITH CTE_Facturas AS (
        SELECT 
            YEAR(i.InvoiceDate) AS Anio,
            c.CustomerName AS Cliente,
            COUNT(i.InvoiceID) AS CantFacturas,
            SUM(il.Quantity * il.UnitPrice) AS MontoTotal,
            DENSE_RANK() OVER (PARTITION BY YEAR(i.InvoiceDate) ORDER BY COUNT(i.InvoiceID) DESC) AS RankCliente
        FROM Sales.Invoices i
        JOIN Sales.InvoiceLines il ON i.InvoiceID = il.InvoiceID
        JOIN Sales.Customers c ON i.CustomerID = c.CustomerID
        WHERE YEAR(i.InvoiceDate) BETWEEN @AnioInicio AND @AnioFin
        GROUP BY YEAR(i.InvoiceDate), c.CustomerName
    )
    SELECT Anio, Cliente, CantFacturas, MontoTotal
    FROM CTE_Facturas
    WHERE RankCliente <= 5
    ORDER BY Anio, CantFacturas DESC;
END;
GO

--PROCEDIMIENTO DE ESTADISTICAS 5

CREATE OR ALTER PROCEDURE sp_Top5ProveedoresCompras
    @AnioInicio INT,
    @AnioFin INT
AS
BEGIN
    SET NOCOUNT ON;

    WITH CTE_Ordenes AS (
        SELECT 
            YEAR(po.OrderDate) AS Anio,
            s.SupplierName AS Proveedor,
            COUNT(po.PurchaseOrderID) AS CantOrdenes,
            SUM(pol.OrderedOuters * si.UnitPrice) AS MontoTotal,
            DENSE_RANK() OVER (PARTITION BY YEAR(po.OrderDate) ORDER BY COUNT(po.PurchaseOrderID) DESC) AS RankProveedor
        FROM Purchasing.PurchaseOrders po
        JOIN Purchasing.Suppliers s ON po.SupplierID = s.SupplierID
        JOIN Purchasing.PurchaseOrderLines pol ON po.PurchaseOrderID = pol.PurchaseOrderID
        JOIN Warehouse.StockItems si ON pol.StockItemID = si.StockItemID
        WHERE YEAR(po.OrderDate) BETWEEN @AnioInicio AND @AnioFin
        GROUP BY YEAR(po.OrderDate), s.SupplierName
    )
    SELECT Anio, Proveedor, CantOrdenes, MontoTotal
    FROM CTE_Ordenes
    WHERE RankProveedor <= 5
    ORDER BY Anio, CantOrdenes DESC;
END;
GO
