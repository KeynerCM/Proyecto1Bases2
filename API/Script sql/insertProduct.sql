CREATE PROCEDURE InsertProduct
    @Name NVARCHAR(50),
    @ProductNumber NVARCHAR(25),
    @SafetyStockLevel SMALLINT,
    @ReorderPoint SMALLINT,
    @StandardCost MONEY,
    @ListPrice MONEY,
    @DaysToManufacture INT,
    @SellStartDate DATETIME = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SET @SellStartDate = ISNULL(@SellStartDate, GETDATE());

    INSERT INTO Production.Product
    (
        Name,
        ProductNumber,
        SafetyStockLevel,
        ReorderPoint,
        StandardCost,
        ListPrice,
        DaysToManufacture,
        SellStartDate
    )
    VALUES
    (
        @Name,
        @ProductNumber,
        @SafetyStockLevel,
        @ReorderPoint,
        @StandardCost,
        @ListPrice,
        @DaysToManufacture,
        @SellStartDate
    );
END;
GO