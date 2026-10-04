USE WideWorldImporters;
GO

--PROCEDIMIENTO DE ESTADISTICAS 6

CREATE OR ALTER PROCEDURE MatrizVentasCategoriasPorAnio
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        Categoria,
        [2013], [2014], [2015], [2016],
        ISNULL([2013], 0) + ISNULL([2014], 0) + ISNULL([2015], 0) + ISNULL([2016], 0) AS Total
    FROM (
        SELECT
            g.StockGroupName AS Categoria,
            YEAR(i.InvoiceDate) AS Anio,
            il.Quantity * il.UnitPrice AS Monto
        FROM syn_Invoices i
        JOIN syn_InvoiceLines il ON i.InvoiceID = il.InvoiceID
        JOIN syn_StockItemStockGroups sg ON il.StockItemID = sg.StockItemID
        JOIN syn_StockGroups g ON sg.StockGroupID = g.StockGroupID
    ) AS Ventas
    PIVOT (
        SUM(Monto) FOR Anio IN ([2013], [2014], [2015], [2016])
    ) AS Matriz
    ORDER BY Categoria;
END;
GO


--PROCEDIMIENTO DE ESTADISTICAS 7

CREATE OR ALTER PROCEDURE SeguimientoComprasClientes
    @PageNumber INT = 1,
    @Anio INT = NULL,
    @Mes INT = NULL,
    @Categoria NVARCHAR(100) = NULL,
    @Subcategoria NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @RowsOfPage INT = 20;

    SELECT
        c.CustomerName AS Cliente,
        YEAR(i.InvoiceDate) AS Anio,
        MONTH(i.InvoiceDate) AS Mes,
        SUM(il.Quantity * il.UnitPrice) AS MontoTotal,
        MIN(i.InvoiceID) AS PrimeraFactura,
        MIN(i.InvoiceDate) AS FechaPrimeraFactura,
        MAX(i.InvoiceID) AS UltimaFactura,
        MAX(i.InvoiceDate) AS FechaUltimaFactura,
        SUM(il.Quantity) AS CantidadTotal,
        MIN(il.Quantity) AS CantidadMinima,
        MAX(il.Quantity) AS CantidadMaxima
    FROM syn_Invoices i
    JOIN syn_Customers c ON i.CustomerID = c.CustomerID
    JOIN syn_InvoiceLines il ON i.InvoiceID = il.InvoiceID
    WHERE
        (@Anio IS NULL OR YEAR(i.InvoiceDate) = @Anio)
        AND (@Mes IS NULL OR MONTH(i.InvoiceDate) = @Mes)
        AND (@Categoria IS NULL OR il.StockItemID IN (
            SELECT sg.StockItemID FROM syn_StockItemStockGroups sg
            JOIN syn_StockGroups g ON sg.StockGroupID = g.StockGroupID
            WHERE g.StockGroupName LIKE '%' + @Categoria + '%'))
        AND (@Subcategoria IS NULL OR il.StockItemID IN (
            SELECT sg.StockItemID FROM syn_StockItemStockGroups sg
            JOIN syn_StockGroups g ON sg.StockGroupID = g.StockGroupID
            WHERE g.StockGroupName LIKE '%' + @Subcategoria + '%'))
    GROUP BY c.CustomerName, YEAR(i.InvoiceDate), MONTH(i.InvoiceDate)
    ORDER BY c.CustomerName, Anio, Mes
    OFFSET (@PageNumber - 1) * @RowsOfPage ROWS FETCH NEXT @RowsOfPage ROWS ONLY;
END;
GO


--PROCEDIMIENTO DE ESTADISTICAS 8

CREATE OR ALTER PROCEDURE SeguimientoComprasProveedores
    @PageNumber INT = 1,
    @Anio INT = NULL,
    @Mes INT = NULL,
    @Categoria NVARCHAR(100) = NULL,
    @Subcategoria NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @RowsOfPage INT = 20;

    SELECT
        s.SupplierName AS Proveedor,
        YEAR(po.OrderDate) AS Anio,
        MONTH(po.OrderDate) AS Mes,
        SUM(pol.OrderedOuters * pol.ExpectedUnitPricePerOuter) AS MontoTotal,
        MIN(po.PurchaseOrderID) AS PrimeraOrden,
        MIN(po.OrderDate) AS FechaPrimeraOrden,
        MAX(po.PurchaseOrderID) AS UltimaOrden,
        MAX(po.OrderDate) AS FechaUltimaOrden,
        SUM(pol.OrderedOuters) AS CantidadTotal,
        MIN(pol.OrderedOuters) AS CantidadMinima,
        MAX(pol.OrderedOuters) AS CantidadMaxima
    FROM syn_PurchaseOrders po
    JOIN syn_Suppliers s ON po.SupplierID = s.SupplierID
    JOIN syn_PurchaseOrderLines pol ON po.PurchaseOrderID = pol.PurchaseOrderID
    WHERE
        (@Anio IS NULL OR YEAR(po.OrderDate) = @Anio)
        AND (@Mes IS NULL OR MONTH(po.OrderDate) = @Mes)
        AND (@Categoria IS NULL OR pol.StockItemID IN (
            SELECT sg.StockItemID FROM syn_StockItemStockGroups sg
            JOIN syn_StockGroups g ON sg.StockGroupID = g.StockGroupID
            WHERE g.StockGroupName LIKE '%' + @Categoria + '%'))
        AND (@Subcategoria IS NULL OR pol.StockItemID IN (
            SELECT sg.StockItemID FROM syn_StockItemStockGroups sg
            JOIN syn_StockGroups g ON sg.StockGroupID = g.StockGroupID
            WHERE g.StockGroupName LIKE '%' + @Subcategoria + '%'))
    GROUP BY s.SupplierName, YEAR(po.OrderDate), MONTH(po.OrderDate)
    ORDER BY s.SupplierName, Anio, Mes
    OFFSET (@PageNumber - 1) * @RowsOfPage ROWS FETCH NEXT @RowsOfPage ROWS ONLY;
END;
GO


--PROCEDIMIENTO DE ESTADISTICAS 9
-- Dias de rotacion = dias del periodo * inventario promedio / unidades vendidas
-- Inventario promedio = (nivel de reorden + nivel objetivo) / 2, el stock baja
-- hasta el nivel de reorden y se repone hasta el nivel objetivo

CREATE OR ALTER PROCEDURE PromedioRotacionInventario
    @PageNumber INT = 1,
    @Categoria NVARCHAR(100) = NULL,
    @Anio INT = NULL,
    @Proveedor NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @RowsOfPage INT = 20;

    WITH CTE_Periodos AS (
        SELECT
            YEAR(InvoiceDate) AS Anio,
            DATEDIFF(DAY, MIN(InvoiceDate), MAX(InvoiceDate)) + 1 AS DiasPeriodo
        FROM syn_Invoices
        GROUP BY YEAR(InvoiceDate)
    ),
    CTE_Ventas AS (
        SELECT
            il.StockItemID,
            YEAR(i.InvoiceDate) AS Anio,
            SUM(il.Quantity) AS UnidadesVendidas
        FROM syn_Invoices i
        JOIN syn_InvoiceLines il ON i.InvoiceID = il.InvoiceID
        WHERE (@Anio IS NULL OR YEAR(i.InvoiceDate) = @Anio)
        GROUP BY il.StockItemID, YEAR(i.InvoiceDate)
    )
    SELECT
        s.StockItemName AS Producto,
        p.SupplierName AS Proveedor,
        CAST((h.ReorderLevel + h.TargetStockLevel) / 2.0 AS DECIMAL(10, 2)) AS InventarioPromedio,
        SUM(v.UnidadesVendidas) AS UnidadesVendidas,
        CAST(AVG(per.DiasPeriodo * ((h.ReorderLevel + h.TargetStockLevel) / 2.0) / v.UnidadesVendidas) AS DECIMAL(10, 2)) AS PromedioDiasRotacion
    FROM CTE_Ventas v
    JOIN CTE_Periodos per ON v.Anio = per.Anio
    JOIN syn_StockItems s ON v.StockItemID = s.StockItemID
    JOIN syn_StockItemHoldings h ON s.StockItemID = h.StockItemID
    JOIN syn_Suppliers p ON s.SupplierID = p.SupplierID
    WHERE
        (@Proveedor IS NULL OR p.SupplierName LIKE '%' + @Proveedor + '%')
        AND (@Categoria IS NULL OR s.StockItemID IN (
            SELECT sg.StockItemID FROM syn_StockItemStockGroups sg
            JOIN syn_StockGroups g ON sg.StockGroupID = g.StockGroupID
            WHERE g.StockGroupName LIKE '%' + @Categoria + '%'))
    GROUP BY s.StockItemName, p.SupplierName, h.ReorderLevel, h.TargetStockLevel
    ORDER BY PromedioDiasRotacion DESC, s.StockItemName
    OFFSET (@PageNumber - 1) * @RowsOfPage ROWS FETCH NEXT @RowsOfPage ROWS ONLY;
END;
GO


--PROCEDIMIENTO DE ESTADISTICAS 10

CREATE OR ALTER PROCEDURE MetodoEnvioFavoritoPorLugar
    @Anio INT = NULL,
    @Mes INT = NULL,
    @CategoriaCliente NVARCHAR(100) = NULL,
    @CategoriaProducto NVARCHAR(100) = NULL,
    @Producto NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    WITH CTE_Envios AS (
        SELECT
            sp.StateProvinceName AS Lugar,
            d.DeliveryMethodName AS MetodoEnvio,
            COUNT(i.InvoiceID) AS CantidadVentas,
            DENSE_RANK() OVER (PARTITION BY sp.StateProvinceName ORDER BY COUNT(i.InvoiceID) DESC) AS RankMetodo
        FROM syn_Invoices i
        JOIN syn_Customers c ON i.CustomerID = c.CustomerID
        JOIN syn_CustomerCategories cc ON c.CustomerCategoryID = cc.CustomerCategoryID
        JOIN syn_Cities ci ON c.DeliveryCityID = ci.CityID
        JOIN syn_StateProvinces sp ON ci.StateProvinceID = sp.StateProvinceID
        JOIN syn_DeliveryMethods d ON i.DeliveryMethodID = d.DeliveryMethodID
        WHERE
            (@Anio IS NULL OR YEAR(i.InvoiceDate) = @Anio)
            AND (@Mes IS NULL OR MONTH(i.InvoiceDate) = @Mes)
            AND (@CategoriaCliente IS NULL OR cc.CustomerCategoryName LIKE '%' + @CategoriaCliente + '%')
            AND (@CategoriaProducto IS NULL OR EXISTS (
                SELECT 1 FROM syn_InvoiceLines il
                JOIN syn_StockItemStockGroups sg ON il.StockItemID = sg.StockItemID
                JOIN syn_StockGroups g ON sg.StockGroupID = g.StockGroupID
                WHERE il.InvoiceID = i.InvoiceID AND g.StockGroupName LIKE '%' + @CategoriaProducto + '%'))
            AND (@Producto IS NULL OR EXISTS (
                SELECT 1 FROM syn_InvoiceLines il
                JOIN syn_StockItems s ON il.StockItemID = s.StockItemID
                WHERE il.InvoiceID = i.InvoiceID AND s.StockItemName LIKE '%' + @Producto + '%'))
        GROUP BY sp.StateProvinceName, d.DeliveryMethodName
    )
    SELECT Lugar, MetodoEnvio AS MetodoFavorito, CantidadVentas
    FROM CTE_Envios
    WHERE RankMetodo = 1
    ORDER BY CantidadVentas DESC, Lugar;
END;
GO


EXEC MatrizVentasCategoriasPorAnio;
EXEC SeguimientoComprasClientes @PageNumber = 1;
EXEC SeguimientoComprasClientes @PageNumber = 1, @Anio = 2015, @Mes = 3, @Categoria = 'Clothing', @Subcategoria = 'T-Shirts';
EXEC SeguimientoComprasProveedores @PageNumber = 1;
EXEC SeguimientoComprasProveedores @PageNumber = 1, @Anio = 2014, @Mes = 6, @Categoria = 'Clothing', @Subcategoria = 'T-Shirts';
EXEC PromedioRotacionInventario @PageNumber = 1;
EXEC PromedioRotacionInventario @PageNumber = 1, @Categoria = 'Toys', @Anio = 2015, @Proveedor = 'Northwind';
EXEC MetodoEnvioFavoritoPorLugar;
EXEC MetodoEnvioFavoritoPorLugar @Anio = 2015, @Mes = 6, @CategoriaCliente = 'Novelty', @CategoriaProducto = 'Toys', @Producto = 'RC';
GO
