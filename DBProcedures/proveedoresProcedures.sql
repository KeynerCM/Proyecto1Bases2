USE WideWorldImporters;
GO

-- =====================================================================
-- PROVEEDORES - CONSULTAS
-- Update y Delete trabajan por ID, así que los GET devuelven SupplierID.
-- DeliveryMethodID admite NULL en Purchasing.Suppliers, por eso se usa
-- LEFT JOIN con DeliveryMethods (si no, esos proveedores desaparecen).
-- =====================================================================

CREATE OR ALTER PROCEDURE datosBasicosProveedoresFiltrados
    @nombreProveedor NVARCHAR(100) = NULL,
    @nombreCategoria NVARCHAR(100) = NULL
AS
    SET NOCOUNT ON;

    SELECT
        p.SupplierID,
        p.SupplierName,
        c.SupplierCategoryName,
        d.DeliveryMethodName
    FROM Purchasing.Suppliers p
    LEFT JOIN Application.DeliveryMethods d
        ON p.DeliveryMethodID = d.DeliveryMethodID
    INNER JOIN Purchasing.SupplierCategories c
        ON p.SupplierCategoryID = c.SupplierCategoryID
    WHERE
        (@nombreProveedor IS NULL OR p.SupplierName LIKE '%' + @nombreProveedor + '%')
        AND
        (@nombreCategoria IS NULL OR c.SupplierCategoryName LIKE '%' + @nombreCategoria + '%')
    ORDER BY p.SupplierName ASC;
GO


CREATE OR ALTER PROCEDURE datosAvanzadosProveedores @nombreProveedor NVARCHAR(100) AS
 SELECT s.SupplierID, s.SupplierName, s.SupplierReference, c.SupplierCategoryName,
 d.DeliveryMethodName, f.CityName, s.DeliveryPostalCode,
 s.FaxNumber, s.PhoneNumber, s.WebsiteURL,
 s.DeliveryAddressLine1,
 s.DeliveryAddressLine2,
 s.PostalAddressLine1,
 s.PostalAddressLine2,
 s.BankAccountName,
 s.BankAccountNumber,
 s.PaymentDays,
 s.DeliveryLocation,   -- antes 'deliverylocation': el frontend lee DeliveryLocation (JS distingue mayúsculas)
 -- Para el formulario de edición
 s.SupplierCategoryID, s.PrimaryContactPersonID, s.AlternateContactPersonID,
 s.DeliveryMethodID, s.DeliveryCityID, s.PostalCityID, s.PostalPostalCode,
 s.BankAccountBranch, s.BankAccountCode, s.BankInternationalCode, s.InternalComments
 FROM Purchasing.Suppliers s
 INNER JOIN Purchasing.SupplierCategories c
 ON s.SupplierCategoryID = c.SupplierCategoryID
 LEFT JOIN Application.DeliveryMethods d
 ON s.DeliveryMethodID = d.DeliveryMethodID
 INNER JOIN Application.Cities f
 ON s.DeliveryCityID = f.CityID
 WHERE s.SupplierName = @nombreProveedor;   -- antes estaba fijo 'The Phone Company'
GO


-- Pruebas
-- EXEC datosBasicosProveedoresFiltrados @nombreCategoria = 'Toy';
-- EXEC datosAvanzadosProveedores @nombreProveedor = 'The Phone Company';
