USE WideWorldImporters;
GO

-- =====================================================================
-- CLIENTES - CONSULTAS
-- Update y Delete trabajan por ID, así que los GET devuelven CustomerID.
-- El detalle también devuelve los IDs de catálogo que necesita el
-- formulario de edición para precargar sus campos.
-- =====================================================================

CREATE OR ALTER PROCEDURE GetCustomersGeneralInfo(
    @PageNumber INT,
    @NameFilter NVARCHAR(100) = NULL
)
AS
BEGIN
DECLARE @RowsOfPage as INT
SET @RowsOfPage=20
SELECT c.CustomerID, c.CUSTOMERNAME, ca.CustomerCategoryName, d.DeliveryMethodName FROM SALES.Customers c
INNER JOIN SALES.CustomerCategories ca ON ca.CustomerCategoryID = c.CustomerCategoryID
INNER JOIN Application.DeliveryMethods d ON d.DeliveryMethodID = c.DeliveryMethodID
WHERE (@NameFilter IS NULL OR c.CustomerName LIKE '%' + @NameFilter + '%')
ORDER BY c.CustomerName
OFFSET (@PageNumber-1)*@RowsOfPage ROWS FETCH NEXT @RowsOfPage ROWS ONLY;
END

GO

CREATE OR ALTER PROCEDURE GetCustomerAdvancedInfo (
    @nombreCliente NVARCHAR(100)
)
AS
BEGIN
    SELECT c.CustomerID, c.CustomerName, k.CustomerCategoryName, b.BuyingGroupName, c.PhoneNumber, c.FaxNumber,
    d.DeliveryMethodName, q.CityName, c.PaymentDays, c.WebsiteURL, c.DeliveryLocation,
    c.DeliveryAddressLine1,
    c.DeliveryAddressLine2,
    c.DeliveryPostalCode,
    c.PostalAddressLine1,
    c.PostalAddressLine2,
    c.PostalPostalCode,
    -- Para el formulario de edición
    c.CustomerCategoryID, c.BuyingGroupID, c.PrimaryContactPersonID, c.AlternateContactPersonID,
    c.DeliveryMethodID, c.DeliveryCityID, c.PostalCityID,
    c.CreditLimit, c.StandardDiscountPercentage, c.IsStatementSent, c.IsOnCreditHold

    FROM sales.Customers c
    INNER JOIN sales.CustomerCategories k
    ON c.CustomerCategoryID = k.CustomerCategoryID
    LEFT JOIN sales.BuyingGroups b          -- antes FULL JOIN; con el WHERE da el mismo resultado
    ON c.BuyingGroupID = b.BuyingGroupID
    INNER JOIN Application.DeliveryMethods d
    ON c.DeliveryMethodID = d.DeliveryMethodID
    INNER JOIN Application.Cities q
    ON c.DeliveryCityID = q.CityID
    WHERE c.CustomerName = @nombreCliente;
END
GO


-- Pruebas
-- EXEC GetCustomersGeneralInfo @PageNumber = 1;
-- EXEC GetCustomerAdvancedInfo @nombreCliente = 'Tailspin Toys (Head Office)';
