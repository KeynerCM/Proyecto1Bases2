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


EXEC MatrizVentasCategoriasPorAnio;
EXEC SeguimientoComprasClientes @PageNumber = 1;
EXEC SeguimientoComprasClientes @PageNumber = 1, @Anio = 2015, @Mes = 3, @Categoria = 'Clothing', @Subcategoria = 'T-Shirts';
GO
