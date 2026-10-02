CREATE PROCEDURE GetCustomersGeneralInfo(
    @PageNumber INT,
    @NameFilter NVARCHAR(100) = NULL
)
AS
BEGIN
DECLARE @RowsOfPage as INT
SET @RowsOfPage=20
SELECT c.CUSTOMERNAME, ca.CustomerCategoryName, d.DeliveryMethodName FROM SALES.Customers c
INNER JOIN SALES.CustomerCategories ca ON ca.CustomerCategoryID = c.CustomerCategoryID
INNER JOIN Application.DeliveryMethods d ON d.DeliveryMethodID = c.DeliveryMethodID
WHERE (@NameFilter IS NULL OR c.CustomerName LIKE '%' + @NameFilter + '%')
ORDER BY c.CustomerName
OFFSET (@PageNumber-1)*@RowsOfPage ROWS FETCH NEXT @RowsOfPage ROWS ONLY;
END

GO

CREATE PROCEDURE GetCustomerAdvancedInfo (
    @nombreCliente NVARCHAR(100)
)  
AS
BEGIN
    SELECT c.CustomerName, k.CustomerCategoryName, b.BuyingGroupName, c.PhoneNumber, c.FaxNumber, 
    d.DeliveryMethodName, q.CityName, c.PaymentDays, c.WebsiteURL, c.DeliveryLocation,
    c.DeliveryAddressLine1,
    c.DeliveryAddressLine2,
    c.DeliveryPostalCode,
    c.PostalAddressLine1,
    c.PostalAddressLine2,
    c.PostalPostalCode

    FROM sales.Customers c
    INNER JOIN sales.CustomerCategories k
    ON c.CustomerCategoryID = k.CustomerCategoryID
    FULL JOIN sales.BuyingGroups b
    ON c.BuyingGroupID = b.BuyingGroupID
    INNER JOIN Application.DeliveryMethods d
    ON c.DeliveryMethodID = d.DeliveryMethodID
    INNER JOIN Application.Cities q
    ON c.DeliveryCityID = q.CityID
    WHERE c.CustomerName = @nombreCliente;
END
GO


SELECT * FROM SALES.CUSTOMERS
GO