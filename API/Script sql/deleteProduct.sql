CREATE PROCEDURE DeleteProduct
    @ProductID INT
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (
        SELECT 1
        FROM Production.Product
        WHERE ProductID = @ProductID
    )
    BEGIN
        RAISERROR('El producto no existe.', 16, 1);
        RETURN;
    END;

    DELETE FROM Production.Product
    WHERE ProductID = @ProductID;
END;
GO