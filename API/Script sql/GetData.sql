DROP PROCEDURE IF EXISTS GetProductData;
CREATE PROCEDURE GetProductData
AS
BEGIN
    SET NOCOUNT ON;

SELECT
    p.ProductID,
    p.Name AS ProductName,
    p.ProductNumber,
    ps.Name AS SubcategoryName
FROM Production.Product AS p
INNER JOIN Production.ProductSubcategory AS ps
    ON p.ProductSubcategoryID = ps.ProductSubcategoryID;
END;
GO

EXEC GetProductData;