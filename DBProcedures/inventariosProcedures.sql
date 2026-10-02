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


-- INFORMACION GENERAL DE PRODUCTOS (lista paginada con filtros acumulativos)

CREATE OR ALTER PROCEDURE GetStockItemsGeneralInfo(
    @PageNumber INT,
    @NameFilter NVARCHAR(100) = NULL,
    @StockGroupID INT = NULL,
    @MinQuantity INT = NULL,
    @MaxQuantity INT = NULL
)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @RowsOfPage AS INT
    SET @RowsOfPage = 20

    IF @PageNumber IS NULL OR @PageNumber < 1
        THROW 50001, 'El numero de pagina debe ser mayor o igual a 1', 1;

    IF @MinQuantity IS NOT NULL AND @MaxQuantity IS NOT NULL AND @MinQuantity > @MaxQuantity
        THROW 50002, 'La cantidad minima no puede ser mayor que la cantidad maxima', 1;

    SELECT s.StockItemID, s.StockItemName,
        (
            SELECT STRING_AGG(g.StockGroupName, ', ') WITHIN GROUP (ORDER BY g.StockGroupName)
            FROM syn_StockItemStockGroups sg
            INNER JOIN syn_StockGroups g ON g.StockGroupID = sg.StockGroupID
            WHERE sg.StockItemID = s.StockItemID
        ) AS StockGroups,
        h.QuantityOnHand,
        COUNT(*) OVER() AS TotalRows
    FROM syn_StockItems s
    INNER JOIN syn_StockItemHoldings h ON h.StockItemID = s.StockItemID
    WHERE (@NameFilter IS NULL OR s.StockItemName LIKE '%' + @NameFilter + '%')
    AND (@StockGroupID IS NULL OR EXISTS (
            SELECT 1 FROM syn_StockItemStockGroups sg
            WHERE sg.StockItemID = s.StockItemID AND sg.StockGroupID = @StockGroupID
        ))
    AND (@MinQuantity IS NULL OR h.QuantityOnHand >= @MinQuantity)
    AND (@MaxQuantity IS NULL OR h.QuantityOnHand <= @MaxQuantity)
    ORDER BY s.StockItemName
    OFFSET (@PageNumber-1)*@RowsOfPage ROWS FETCH NEXT @RowsOfPage ROWS ONLY;
END
GO


-- EJEMPLOS

EXEC GetStockGroups;

-- Todos los productos, primera pagina
EXEC GetStockItemsGeneralInfo @PageNumber = 1;

-- Solo un grupo (9 = Toys)
EXEC GetStockItemsGeneralInfo @PageNumber = 1, @StockGroupID = 9;

-- Filtros acumulativos: nombre + grupo (3 = Mugs) + rango de cantidad
EXEC GetStockItemsGeneralInfo @PageNumber = 1, @NameFilter = 'mug', @StockGroupID = 3, @MinQuantity = 1000, @MaxQuantity = 100000;
GO
