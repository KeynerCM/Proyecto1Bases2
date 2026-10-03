CREATE PROCEDURE datosBasicosProveedoresFiltrados
    @nombreProveedor NVARCHAR(100) = NULL,
    @nombreCategoria NVARCHAR(100) = NULL
AS
    SET NOCOUNT ON;

    SELECT 
        p.SupplierName, 
        c.SupplierCategoryName, 
        d.DeliveryMethodName
    FROM Purchasing.Suppliers p
    INNER JOIN Application.DeliveryMethods d
        ON p.DeliveryMethodID = d.DeliveryMethodID
    INNER JOIN Purchasing.SupplierCategories c
        ON p.SupplierCategoryID = c.SupplierCategoryID
    WHERE
        (@nombreProveedor IS NULL OR p.SupplierName LIKE '%' + @nombreProveedor + '%')
        AND
        (@nombreCategoria IS NULL OR c.SupplierCategoryName LIKE '%' + @nombreCategoria + '%')
    ORDER BY p.SupplierName ASC;
GO


CREATE PROCEDURE datosAvanzadosProveedores @nombreProveedor NVARCHAR(100) AS
 SELECT s.SupplierName, s.SupplierReference, c.SupplierCategoryName,
 d.DeliveryMethodName, f.CityName, s.DeliveryPostalCode,
 s.FaxNumber, s.PhoneNumber, s.WebsiteURL, 
 s.DeliveryAddressLine1,
 s.DeliveryAddressLine2,
 s.PostalAddressLine1,
 s.PostalAddressLine2,
 s.BankAccountName,
 s.BankAccountNumber,
 s.PaymentDays,
 s.deliverylocation
 FROM Purchasing.Suppliers s
 INNER JOIN Purchasing.SupplierCategories c
 ON s.SupplierCategoryID = c.SupplierCategoryID
 INNER JOIN Application.DeliveryMethods d
 ON s.DeliveryMethodID = d.DeliveryMethodID
 INNER JOIN Application.Cities f
 ON s.DeliveryCityID = f.CityID
 WHERE s.SupplierName = @nombreProveedor

 GO
