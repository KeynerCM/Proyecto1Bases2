USE WideWorldImporters;
GO

-- =====================================================================
-- CATÁLOGOS (llenan los combos y buscadores de los formularios CRUD)
-- Endpoint: GET /api/catalogs/:name?search=...&id=...
-- Todos devuelven las columnas: id, name
-- Los catálogos grandes (people, cities, customers, stockItems) devuelven
-- máximo 50 filas y aceptan @Search o @ID.
-- =====================================================================

CREATE OR ALTER PROCEDURE GetCatalog (
    @Catalog NVARCHAR(50),
    @Search  NVARCHAR(100) = NULL,
    @ID      INT = NULL
)
AS
BEGIN
    SET NOCOUNT ON;

    IF @Catalog = 'customerCategories'
        SELECT CustomerCategoryID AS id, CustomerCategoryName AS name
        FROM Sales.CustomerCategories
        ORDER BY CustomerCategoryName;

    ELSE IF @Catalog = 'buyingGroups'
        SELECT BuyingGroupID AS id, BuyingGroupName AS name
        FROM Sales.BuyingGroups
        ORDER BY BuyingGroupName;

    ELSE IF @Catalog = 'deliveryMethods'
        SELECT DeliveryMethodID AS id, DeliveryMethodName AS name
        FROM Application.DeliveryMethods
        ORDER BY DeliveryMethodName;

    ELSE IF @Catalog = 'supplierCategories'
        SELECT SupplierCategoryID AS id, SupplierCategoryName AS name
        FROM Purchasing.SupplierCategories
        ORDER BY SupplierCategoryName;

    ELSE IF @Catalog = 'suppliers'
        SELECT SupplierID AS id, SupplierName AS name
        FROM Purchasing.Suppliers
        ORDER BY SupplierName;

    ELSE IF @Catalog = 'packageTypes'
        SELECT PackageTypeID AS id, PackageTypeName AS name
        FROM Warehouse.PackageTypes
        ORDER BY PackageTypeName;

    ELSE IF @Catalog = 'colors'
        SELECT ColorID AS id, ColorName AS name
        FROM Warehouse.Colors
        ORDER BY ColorName;

    ELSE IF @Catalog = 'salespeople'
        SELECT PersonID AS id, FullName AS name
        FROM Application.People
        WHERE IsSalesperson = 1
        ORDER BY FullName;

    ELSE IF @Catalog = 'people'
        SELECT TOP (50) PersonID AS id, FullName AS name
        FROM Application.People
        WHERE (@ID IS NULL OR PersonID = @ID)
          AND (@Search IS NULL OR FullName LIKE '%' + @Search + '%')
        ORDER BY FullName;

    ELSE IF @Catalog = 'cities'
        SELECT TOP (50) c.CityID AS id, c.CityName + ', ' + sp.StateProvinceName AS name
        FROM Application.Cities c
        INNER JOIN Application.StateProvinces sp
            ON sp.StateProvinceID = c.StateProvinceID
        WHERE (@ID IS NULL OR c.CityID = @ID)
          AND (@Search IS NULL OR c.CityName LIKE @Search + '%')
        ORDER BY c.CityName, sp.StateProvinceName;

    ELSE IF @Catalog = 'customers'
        SELECT TOP (50) CustomerID AS id, CustomerName AS name
        FROM Sales.Customers
        WHERE (@ID IS NULL OR CustomerID = @ID)
          AND (@Search IS NULL OR CustomerName LIKE '%' + @Search + '%')
        ORDER BY CustomerName;

    ELSE IF @Catalog = 'stockItems'
        SELECT TOP (50) StockItemID AS id, StockItemName AS name, UnitPrice, TaxRate
        FROM Warehouse.StockItems
        WHERE (@ID IS NULL OR StockItemID = @ID)
          AND (@Search IS NULL OR StockItemName LIKE '%' + @Search + '%')
        ORDER BY StockItemName;

    ELSE
        THROW 50003, 'Catálogo no válido.', 1;
END
GO


-- Pruebas
-- EXEC GetCatalog @Catalog = 'deliveryMethods';
-- EXEC GetCatalog @Catalog = 'cities', @Search = 'San';
-- EXEC GetCatalog @Catalog = 'people', @ID = 1001;
