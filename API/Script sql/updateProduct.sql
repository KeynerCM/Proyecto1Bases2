CREATE PROCEDURE UpdateProduct
    @ProductID INT,
    @Name NVARCHAR(50),
    @ProductNumber NVARCHAR(25),
    @Color NVARCHAR(15) = NULL,
    @ListPrice MONEY
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE Production.Product
    SET
        Name = @Name,
        ProductNumber = @ProductNumber,
        Color = @Color,
        ListPrice = @ListPrice,
        ModifiedDate = GETDATE()
    WHERE ProductID = @ProductID;
END;
GO