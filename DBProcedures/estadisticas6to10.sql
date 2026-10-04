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


EXEC MatrizVentasCategoriasPorAnio;
GO
