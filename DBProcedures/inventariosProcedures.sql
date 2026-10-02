USE WideWorldImporters;
GO

-- GRUPOS DE INVENTARIO (para el filtro de seleccion)

CREATE OR ALTER PROCEDURE GetStockGroups
AS
BEGIN
    SET NOCOUNT ON;

    SELECT g.StockGroupID, g.StockGroupName
    FROM syn_StockGroups g
    ORDER BY g.StockGroupName;
END
GO


-- EJEMPLOS

EXEC GetStockGroups;
GO
