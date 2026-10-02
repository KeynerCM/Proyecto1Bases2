USE WideWorldImporters;
GO

CREATE OR ALTER PROCEDURE GetStockGroups
AS
BEGIN
SELECT g.StockGroupID, g.StockGroupName FROM syn_StockGroups g
ORDER BY g.StockGroupName;
END

GO

CREATE OR ALTER PROCEDURE GetStockItemsGeneralInfo(
    @PageNumber INT,
    @NameFilter NVARCHAR(100) = NULL,
    @StockGroupID INT = NULL,
    @MinQuantity INT = NULL,
    @MaxQuantity INT = NULL
)
AS
BEGIN
DECLARE @RowsOfPage as INT
SET @RowsOfPage=20
SELECT s.StockItemID, s.StockItemName, STRING_AGG(g.StockGroupName, ', ') AS StockGroups, h.QuantityOnHand FROM syn_StockItems s
INNER JOIN syn_StockItemHoldings h ON h.StockItemID = s.StockItemID
INNER JOIN syn_StockItemStockGroups sg ON sg.StockItemID = s.StockItemID
INNER JOIN syn_StockGroups g ON g.StockGroupID = sg.StockGroupID
WHERE (@NameFilter IS NULL OR s.StockItemName LIKE '%' + @NameFilter + '%')
AND (@StockGroupID IS NULL OR s.StockItemID IN (SELECT StockItemID FROM syn_StockItemStockGroups WHERE StockGroupID = @StockGroupID))
AND (@MinQuantity IS NULL OR h.QuantityOnHand >= @MinQuantity)
AND (@MaxQuantity IS NULL OR h.QuantityOnHand <= @MaxQuantity)
GROUP BY s.StockItemID, s.StockItemName, h.QuantityOnHand
ORDER BY REPLACE(s.StockItemName, '"', '')
OFFSET (@PageNumber-1)*@RowsOfPage ROWS FETCH NEXT @RowsOfPage ROWS ONLY;
END

GO

CREATE OR ALTER PROCEDURE GetStockItemAdvancedInfo (
    @StockItemID INT
)
AS
BEGIN
    SELECT s.StockItemID, s.StockItemName, p.SupplierID, p.SupplierName, p.WebsiteURL AS SupplierWebsiteURL,
    c.ColorName, up.PackageTypeName AS UnitPackage, op.PackageTypeName AS OuterPackage,
    s.QuantityPerOuter, s.Brand, s.Size, s.TaxRate, s.UnitPrice, s.RecommendedRetailPrice,
    s.TypicalWeightPerUnit, s.SearchDetails, h.QuantityOnHand, h.BinLocation

    FROM syn_StockItems s
    INNER JOIN syn_Suppliers p
    ON s.SupplierID = p.SupplierID
    LEFT JOIN syn_Colors c
    ON s.ColorID = c.ColorID
    INNER JOIN syn_PackageTypes up
    ON s.UnitPackageID = up.PackageTypeID
    INNER JOIN syn_PackageTypes op
    ON s.OuterPackageID = op.PackageTypeID
    INNER JOIN syn_StockItemHoldings h
    ON s.StockItemID = h.StockItemID
    WHERE s.StockItemID = @StockItemID;
END
GO


EXEC GetStockGroups;
EXEC GetStockItemsGeneralInfo @PageNumber = 1;
EXEC GetStockItemsGeneralInfo @PageNumber = 1, @NameFilter = 'mug', @StockGroupID = 3, @MinQuantity = 1000, @MaxQuantity = 100000;
EXEC GetStockItemAdvancedInfo @StockItemID = 66;
GO
