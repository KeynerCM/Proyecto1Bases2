
USE WideWorldImporters;
GO


-- Nota: los sinónimos que usan estos procedimientos están en sinonimos.sql
-- y los GET (con los IDs que necesitan Update/Delete) están en
-- clientesProcedures.sql, proveedoresProcedures.sql,
-- inventariosProcedures.sql y ventasProcedures.sql.


-- =====================================================================
-- CLIENTES (Sales.Customers)
-- =====================================================================

CREATE OR ALTER PROCEDURE InsertCustomer (
    @CustomerName               NVARCHAR(100),
    @CustomerCategoryID         INT,
    @PrimaryContactPersonID     INT,
    @DeliveryMethodID           INT,
    @DeliveryCityID             INT,
    @PaymentDays                INT,
    @PhoneNumber                NVARCHAR(20),
    @FaxNumber                  NVARCHAR(20),
    @WebsiteURL                 NVARCHAR(256),
    @DeliveryAddressLine1       NVARCHAR(60),
    @DeliveryPostalCode         NVARCHAR(10),
    @PostalAddressLine1         NVARCHAR(60),
    @PostalPostalCode           NVARCHAR(10),
    @BuyingGroupID              INT = NULL,
    @AlternateContactPersonID   INT = NULL,
    @PostalCityID               INT = NULL,            -- si no viene, se usa DeliveryCityID
    @CreditLimit                DECIMAL(18,2) = NULL,
    @StandardDiscountPercentage DECIMAL(18,3) = NULL,  -- default 0
    @IsStatementSent            BIT = NULL,            -- default 0
    @IsOnCreditHold             BIT = NULL,            -- default 0
    @DeliveryAddressLine2       NVARCHAR(60) = NULL,
    @PostalAddressLine2         NVARCHAR(60) = NULL,
    @LastEditedBy               INT = NULL
)
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM Sales.Customers WHERE CustomerName = @CustomerName)
        THROW 50002, 'Ya existe un cliente con ese nombre.', 1;

    -- Se toma el ID de la secuencia antes del INSERT porque BillToCustomerID
    -- es obligatorio: un cliente nuevo se factura a sí mismo.
    DECLARE @CustomerID INT;
    SET @CustomerID = NEXT VALUE FOR Sequences.CustomerID;

    INSERT INTO Sales.Customers (
        CustomerID, CustomerName, BillToCustomerID, CustomerCategoryID, BuyingGroupID,
        PrimaryContactPersonID, AlternateContactPersonID, DeliveryMethodID,
        DeliveryCityID, PostalCityID, CreditLimit, AccountOpenedDate,
        StandardDiscountPercentage, IsStatementSent, IsOnCreditHold, PaymentDays,
        PhoneNumber, FaxNumber, WebsiteURL,
        DeliveryAddressLine1, DeliveryAddressLine2, DeliveryPostalCode,
        PostalAddressLine1, PostalAddressLine2, PostalPostalCode,
        LastEditedBy
    )
    VALUES (
        @CustomerID, @CustomerName, @CustomerID, @CustomerCategoryID, @BuyingGroupID,
        @PrimaryContactPersonID, @AlternateContactPersonID, @DeliveryMethodID,
        @DeliveryCityID, ISNULL(@PostalCityID, @DeliveryCityID), @CreditLimit, CAST(SYSDATETIME() AS DATE),
        ISNULL(@StandardDiscountPercentage, 0), ISNULL(@IsStatementSent, 0), ISNULL(@IsOnCreditHold, 0), @PaymentDays,
        @PhoneNumber, @FaxNumber, @WebsiteURL,
        @DeliveryAddressLine1, @DeliveryAddressLine2, @DeliveryPostalCode,
        @PostalAddressLine1, @PostalAddressLine2, @PostalPostalCode,
        ISNULL(@LastEditedBy, 1)
    );

    SELECT @CustomerID AS CustomerID;
END
GO

CREATE OR ALTER PROCEDURE UpdateCustomer (
    @CustomerID                 INT,
    @CustomerName               NVARCHAR(100) = NULL,
    @CustomerCategoryID         INT = NULL,
    @BuyingGroupID              INT = NULL,
    @PrimaryContactPersonID     INT = NULL,
    @AlternateContactPersonID   INT = NULL,
    @DeliveryMethodID           INT = NULL,
    @DeliveryCityID             INT = NULL,
    @PostalCityID               INT = NULL,
    @CreditLimit                DECIMAL(18,2) = NULL,
    @StandardDiscountPercentage DECIMAL(18,3) = NULL,
    @IsStatementSent            BIT = NULL,
    @IsOnCreditHold             BIT = NULL,
    @PaymentDays                INT = NULL,
    @PhoneNumber                NVARCHAR(20) = NULL,
    @FaxNumber                  NVARCHAR(20) = NULL,
    @WebsiteURL                 NVARCHAR(256) = NULL,
    @DeliveryAddressLine1       NVARCHAR(60) = NULL,
    @DeliveryAddressLine2       NVARCHAR(60) = NULL,
    @DeliveryPostalCode         NVARCHAR(10) = NULL,
    @PostalAddressLine1         NVARCHAR(60) = NULL,
    @PostalAddressLine2         NVARCHAR(60) = NULL,
    @PostalPostalCode           NVARCHAR(10) = NULL,
    @LastEditedBy               INT = NULL
)
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM Sales.Customers WHERE CustomerID = @CustomerID)
        THROW 50001, 'El cliente no existe.', 1;

    IF @CustomerName IS NOT NULL
       AND EXISTS (SELECT 1 FROM Sales.Customers WHERE CustomerName = @CustomerName AND CustomerID <> @CustomerID)
        THROW 50002, 'Ya existe otro cliente con ese nombre.', 1;

    UPDATE Sales.Customers SET
        CustomerName               = ISNULL(@CustomerName, CustomerName),
        CustomerCategoryID         = ISNULL(@CustomerCategoryID, CustomerCategoryID),
        BuyingGroupID              = ISNULL(@BuyingGroupID, BuyingGroupID),
        PrimaryContactPersonID     = ISNULL(@PrimaryContactPersonID, PrimaryContactPersonID),
        AlternateContactPersonID   = ISNULL(@AlternateContactPersonID, AlternateContactPersonID),
        DeliveryMethodID           = ISNULL(@DeliveryMethodID, DeliveryMethodID),
        DeliveryCityID             = ISNULL(@DeliveryCityID, DeliveryCityID),
        PostalCityID               = ISNULL(@PostalCityID, PostalCityID),
        CreditLimit                = ISNULL(@CreditLimit, CreditLimit),
        StandardDiscountPercentage = ISNULL(@StandardDiscountPercentage, StandardDiscountPercentage),
        IsStatementSent            = ISNULL(@IsStatementSent, IsStatementSent),
        IsOnCreditHold             = ISNULL(@IsOnCreditHold, IsOnCreditHold),
        PaymentDays                = ISNULL(@PaymentDays, PaymentDays),
        PhoneNumber                = ISNULL(@PhoneNumber, PhoneNumber),
        FaxNumber                  = ISNULL(@FaxNumber, FaxNumber),
        WebsiteURL                 = ISNULL(@WebsiteURL, WebsiteURL),
        DeliveryAddressLine1       = ISNULL(@DeliveryAddressLine1, DeliveryAddressLine1),
        DeliveryAddressLine2       = ISNULL(@DeliveryAddressLine2, DeliveryAddressLine2),
        DeliveryPostalCode         = ISNULL(@DeliveryPostalCode, DeliveryPostalCode),
        PostalAddressLine1         = ISNULL(@PostalAddressLine1, PostalAddressLine1),
        PostalAddressLine2         = ISNULL(@PostalAddressLine2, PostalAddressLine2),
        PostalPostalCode           = ISNULL(@PostalPostalCode, PostalPostalCode),
        LastEditedBy               = ISNULL(@LastEditedBy, 1)
    WHERE CustomerID = @CustomerID;
END
GO

CREATE OR ALTER PROCEDURE DeleteCustomer (
    @CustomerID INT
)
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM Sales.Customers WHERE CustomerID = @CustomerID)
        THROW 50001, 'El cliente no existe.', 1;

    -- No se borra un cliente con historial: se rompería la integridad de ventas
    IF EXISTS (SELECT 1 FROM Sales.Invoices WHERE CustomerID = @CustomerID OR BillToCustomerID = @CustomerID)
       OR EXISTS (SELECT 1 FROM Sales.Orders WHERE CustomerID = @CustomerID)
       OR EXISTS (SELECT 1 FROM Sales.CustomerTransactions WHERE CustomerID = @CustomerID)
       OR EXISTS (SELECT 1 FROM Sales.SpecialDeals WHERE CustomerID = @CustomerID)
       OR EXISTS (SELECT 1 FROM Warehouse.StockItemTransactions WHERE CustomerID = @CustomerID)
       OR EXISTS (SELECT 1 FROM Sales.Customers WHERE BillToCustomerID = @CustomerID AND CustomerID <> @CustomerID)
        THROW 50002, 'No se puede eliminar: el cliente tiene facturas, pedidos o transacciones asociadas.', 1;

    DELETE FROM Sales.Customers WHERE CustomerID = @CustomerID;
END
GO


-- =====================================================================
-- INVENTARIO (Warehouse.StockItems + StockItemHoldings + StockItemStockGroups)
-- El GET general hace INNER JOIN con Holdings y StockGroups, así que todo
-- producto nuevo se crea en las tres tablas dentro de una transacción.
-- @StockGroupIDs se recibe como texto separado por comas: '1,3,5'
-- =====================================================================

CREATE OR ALTER PROCEDURE InsertStockItem (
    @StockItemName          NVARCHAR(100),
    @SupplierID             INT,
    @UnitPackageID          INT,
    @OuterPackageID         INT,
    @StockGroupIDs          NVARCHAR(500),
    @LeadTimeDays           INT,
    @QuantityPerOuter       INT,
    @TaxRate                DECIMAL(18,3),
    @UnitPrice              DECIMAL(18,2),
    @TypicalWeightPerUnit   DECIMAL(18,3),
    @ColorID                INT = NULL,
    @Brand                  NVARCHAR(50) = NULL,
    @Size                   NVARCHAR(20) = NULL,
    @IsChillerStock         BIT = NULL,              -- default 0
    @Barcode                NVARCHAR(50) = NULL,
    @RecommendedRetailPrice DECIMAL(18,2) = NULL,
    @MarketingComments      NVARCHAR(MAX) = NULL,
    @InternalComments       NVARCHAR(MAX) = NULL,
    -- Existencias
    @QuantityOnHand         INT = NULL,              -- default 0
    @BinLocation            NVARCHAR(20) = NULL,     -- default 'N/A'
    @LastCostPrice          DECIMAL(18,2) = NULL,    -- default UnitPrice
    @ReorderLevel           INT = NULL,              -- default 0
    @TargetStockLevel       INT = NULL,              -- default 0
    @LastEditedBy           INT = NULL
)
AS
BEGIN
    SET NOCOUNT ON;
    SET @LastEditedBy = ISNULL(@LastEditedBy, 1);

    IF EXISTS (SELECT 1 FROM dbo.syn_StockItems WHERE StockItemName = @StockItemName)
        THROW 50002, 'Ya existe un producto con ese nombre.', 1;

    DECLARE @Groups TABLE (StockGroupID INT PRIMARY KEY);

    INSERT INTO @Groups (StockGroupID)
    SELECT DISTINCT TRY_CAST(LTRIM(RTRIM(value)) AS INT)
    FROM STRING_SPLIT(@StockGroupIDs, ',')
    WHERE TRY_CAST(LTRIM(RTRIM(value)) AS INT) IS NOT NULL;

    IF NOT EXISTS (SELECT 1 FROM @Groups)
        THROW 50003, 'Debe indicar al menos un grupo de inventario.', 1;

    IF EXISTS (SELECT 1 FROM @Groups g
               WHERE NOT EXISTS (SELECT 1 FROM dbo.syn_StockGroups sg WHERE sg.StockGroupID = g.StockGroupID))
        THROW 50003, 'Uno o más grupos de inventario no existen.', 1;

    DECLARE @StockItemID INT;
    SET @StockItemID = NEXT VALUE FOR Sequences.StockItemID;

    BEGIN TRY
        BEGIN TRANSACTION;

        INSERT INTO dbo.syn_StockItems (
            StockItemID, StockItemName, SupplierID, ColorID, UnitPackageID, OuterPackageID,
            Brand, Size, LeadTimeDays, QuantityPerOuter, IsChillerStock, Barcode,
            TaxRate, UnitPrice, RecommendedRetailPrice, TypicalWeightPerUnit,
            MarketingComments, InternalComments, LastEditedBy
        )
        VALUES (
            @StockItemID, @StockItemName, @SupplierID, @ColorID, @UnitPackageID, @OuterPackageID,
            @Brand, @Size, @LeadTimeDays, @QuantityPerOuter, ISNULL(@IsChillerStock, 0), @Barcode,
            @TaxRate, @UnitPrice, @RecommendedRetailPrice, @TypicalWeightPerUnit,
            @MarketingComments, @InternalComments, @LastEditedBy
        );

        INSERT INTO dbo.syn_StockItemHoldings (
            StockItemID, QuantityOnHand, BinLocation, LastStocktakeQuantity,
            LastCostPrice, ReorderLevel, TargetStockLevel, LastEditedBy
        )
        VALUES (
            @StockItemID, ISNULL(@QuantityOnHand, 0), ISNULL(@BinLocation, 'N/A'), ISNULL(@QuantityOnHand, 0),
            ISNULL(@LastCostPrice, @UnitPrice), ISNULL(@ReorderLevel, 0), ISNULL(@TargetStockLevel, 0), @LastEditedBy
        );

        INSERT INTO dbo.syn_StockItemStockGroups (StockItemID, StockGroupID, LastEditedBy)
        SELECT @StockItemID, StockGroupID, @LastEditedBy FROM @Groups;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH;

    SELECT @StockItemID AS StockItemID;
END
GO

CREATE OR ALTER PROCEDURE UpdateStockItem (
    @StockItemID            INT,
    @StockItemName          NVARCHAR(100) = NULL,
    @SupplierID             INT = NULL,
    @ColorID                INT = NULL,
    @UnitPackageID          INT = NULL,
    @OuterPackageID         INT = NULL,
    @Brand                  NVARCHAR(50) = NULL,
    @Size                   NVARCHAR(20) = NULL,
    @LeadTimeDays           INT = NULL,
    @QuantityPerOuter       INT = NULL,
    @IsChillerStock         BIT = NULL,
    @Barcode                NVARCHAR(50) = NULL,
    @TaxRate                DECIMAL(18,3) = NULL,
    @UnitPrice              DECIMAL(18,2) = NULL,
    @RecommendedRetailPrice DECIMAL(18,2) = NULL,
    @TypicalWeightPerUnit   DECIMAL(18,3) = NULL,
    @MarketingComments      NVARCHAR(MAX) = NULL,
    @InternalComments       NVARCHAR(MAX) = NULL,
    @StockGroupIDs          NVARCHAR(500) = NULL,   -- si viene, reemplaza todos los grupos
    @QuantityOnHand         INT = NULL,
    @BinLocation            NVARCHAR(20) = NULL,
    @LastCostPrice          DECIMAL(18,2) = NULL,
    @ReorderLevel           INT = NULL,
    @TargetStockLevel       INT = NULL,
    @LastEditedBy           INT = NULL
)
AS
BEGIN
    SET NOCOUNT ON;
    SET @LastEditedBy = ISNULL(@LastEditedBy, 1);

    IF NOT EXISTS (SELECT 1 FROM dbo.syn_StockItems WHERE StockItemID = @StockItemID)
        THROW 50001, 'El producto no existe.', 1;

    IF @StockItemName IS NOT NULL
       AND EXISTS (SELECT 1 FROM dbo.syn_StockItems WHERE StockItemName = @StockItemName AND StockItemID <> @StockItemID)
        THROW 50002, 'Ya existe otro producto con ese nombre.', 1;

    DECLARE @Groups TABLE (StockGroupID INT PRIMARY KEY);

    IF @StockGroupIDs IS NOT NULL
    BEGIN
        INSERT INTO @Groups (StockGroupID)
        SELECT DISTINCT TRY_CAST(LTRIM(RTRIM(value)) AS INT)
        FROM STRING_SPLIT(@StockGroupIDs, ',')
        WHERE TRY_CAST(LTRIM(RTRIM(value)) AS INT) IS NOT NULL;

        IF NOT EXISTS (SELECT 1 FROM @Groups)
            THROW 50003, 'Debe indicar al menos un grupo de inventario.', 1;

        IF EXISTS (SELECT 1 FROM @Groups g
                   WHERE NOT EXISTS (SELECT 1 FROM dbo.syn_StockGroups sg WHERE sg.StockGroupID = g.StockGroupID))
            THROW 50003, 'Uno o más grupos de inventario no existen.', 1;
    END

    BEGIN TRY
        BEGIN TRANSACTION;

        UPDATE dbo.syn_StockItems SET
            StockItemName          = ISNULL(@StockItemName, StockItemName),
            SupplierID             = ISNULL(@SupplierID, SupplierID),
            ColorID                = ISNULL(@ColorID, ColorID),
            UnitPackageID          = ISNULL(@UnitPackageID, UnitPackageID),
            OuterPackageID         = ISNULL(@OuterPackageID, OuterPackageID),
            Brand                  = ISNULL(@Brand, Brand),
            Size                   = ISNULL(@Size, Size),
            LeadTimeDays           = ISNULL(@LeadTimeDays, LeadTimeDays),
            QuantityPerOuter       = ISNULL(@QuantityPerOuter, QuantityPerOuter),
            IsChillerStock         = ISNULL(@IsChillerStock, IsChillerStock),
            Barcode                = ISNULL(@Barcode, Barcode),
            TaxRate                = ISNULL(@TaxRate, TaxRate),
            UnitPrice              = ISNULL(@UnitPrice, UnitPrice),
            RecommendedRetailPrice = ISNULL(@RecommendedRetailPrice, RecommendedRetailPrice),
            TypicalWeightPerUnit   = ISNULL(@TypicalWeightPerUnit, TypicalWeightPerUnit),
            MarketingComments      = ISNULL(@MarketingComments, MarketingComments),
            InternalComments       = ISNULL(@InternalComments, InternalComments),
            LastEditedBy           = @LastEditedBy
        WHERE StockItemID = @StockItemID;

        UPDATE dbo.syn_StockItemHoldings SET
            QuantityOnHand   = ISNULL(@QuantityOnHand, QuantityOnHand),
            BinLocation      = ISNULL(@BinLocation, BinLocation),
            LastCostPrice    = ISNULL(@LastCostPrice, LastCostPrice),
            ReorderLevel     = ISNULL(@ReorderLevel, ReorderLevel),
            TargetStockLevel = ISNULL(@TargetStockLevel, TargetStockLevel),
            LastEditedBy     = @LastEditedBy,
            LastEditedWhen   = SYSDATETIME()
        WHERE StockItemID = @StockItemID;

        IF @StockGroupIDs IS NOT NULL
        BEGIN
            DELETE FROM dbo.syn_StockItemStockGroups WHERE StockItemID = @StockItemID;

            INSERT INTO dbo.syn_StockItemStockGroups (StockItemID, StockGroupID, LastEditedBy)
            SELECT @StockItemID, StockGroupID, @LastEditedBy FROM @Groups;
        END

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH;
END
GO

CREATE OR ALTER PROCEDURE DeleteStockItem (
    @StockItemID INT
)
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM dbo.syn_StockItems WHERE StockItemID = @StockItemID)
        THROW 50001, 'El producto no existe.', 1;

    IF EXISTS (SELECT 1 FROM dbo.syn_InvoiceLines WHERE StockItemID = @StockItemID)
       OR EXISTS (SELECT 1 FROM dbo.syn_OrderLines WHERE StockItemID = @StockItemID)
       OR EXISTS (SELECT 1 FROM dbo.syn_PurchaseOrderLines WHERE StockItemID = @StockItemID)
       OR EXISTS (SELECT 1 FROM dbo.syn_StockItemTransactions WHERE StockItemID = @StockItemID)
       OR EXISTS (SELECT 1 FROM dbo.syn_SpecialDeals WHERE StockItemID = @StockItemID)
        THROW 50002, 'No se puede eliminar: el producto aparece en facturas, pedidos o movimientos de inventario.', 1;

    BEGIN TRY
        BEGIN TRANSACTION;

        DELETE FROM dbo.syn_StockItemStockGroups WHERE StockItemID = @StockItemID;
        DELETE FROM dbo.syn_StockItemHoldings    WHERE StockItemID = @StockItemID;
        DELETE FROM dbo.syn_StockItems           WHERE StockItemID = @StockItemID;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH;
END
GO


-- =====================================================================
-- PROVEEDORES (Purchasing.Suppliers)
-- =====================================================================

CREATE OR ALTER PROCEDURE insertarProveedor (
    @SupplierName             NVARCHAR(100),
    @SupplierCategoryID       INT,
    @PrimaryContactPersonID   INT,
    @DeliveryCityID           INT,
    @PaymentDays              INT,
    @PhoneNumber              NVARCHAR(20),
    @FaxNumber                NVARCHAR(20),
    @WebsiteURL               NVARCHAR(256),
    @DeliveryAddressLine1     NVARCHAR(60),
    @DeliveryPostalCode       NVARCHAR(10),
    @PostalAddressLine1       NVARCHAR(60),
    @PostalPostalCode         NVARCHAR(10),
    @AlternateContactPersonID INT = NULL,           -- si no viene, se usa el contacto principal
    @DeliveryMethodID         INT = NULL,
    @PostalCityID             INT = NULL,           -- si no viene, se usa DeliveryCityID
    @SupplierReference        NVARCHAR(20) = NULL,
    @BankAccountName          NVARCHAR(50) = NULL,
    @BankAccountBranch        NVARCHAR(50) = NULL,
    @BankAccountCode          NVARCHAR(20) = NULL,
    @BankAccountNumber        NVARCHAR(20) = NULL,
    @BankInternationalCode    NVARCHAR(20) = NULL,
    @InternalComments         NVARCHAR(MAX) = NULL,
    @DeliveryAddressLine2     NVARCHAR(60) = NULL,
    @PostalAddressLine2       NVARCHAR(60) = NULL,
    @LastEditedBy             INT = NULL
)
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM Purchasing.Suppliers WHERE SupplierName = @SupplierName)
        THROW 50002, 'Ya existe un proveedor con ese nombre.', 1;

    DECLARE @SupplierID INT;
    SET @SupplierID = NEXT VALUE FOR Sequences.SupplierID;

    INSERT INTO Purchasing.Suppliers (
        SupplierID, SupplierName, SupplierCategoryID, PrimaryContactPersonID, AlternateContactPersonID,
        DeliveryMethodID, DeliveryCityID, PostalCityID, SupplierReference,
        BankAccountName, BankAccountBranch, BankAccountCode, BankAccountNumber, BankInternationalCode,
        PaymentDays, InternalComments, PhoneNumber, FaxNumber, WebsiteURL,
        DeliveryAddressLine1, DeliveryAddressLine2, DeliveryPostalCode,
        PostalAddressLine1, PostalAddressLine2, PostalPostalCode,
        LastEditedBy
    )
    VALUES (
        @SupplierID, @SupplierName, @SupplierCategoryID, @PrimaryContactPersonID,
        ISNULL(@AlternateContactPersonID, @PrimaryContactPersonID),
        @DeliveryMethodID, @DeliveryCityID, ISNULL(@PostalCityID, @DeliveryCityID), @SupplierReference,
        @BankAccountName, @BankAccountBranch, @BankAccountCode, @BankAccountNumber, @BankInternationalCode,
        @PaymentDays, @InternalComments, @PhoneNumber, @FaxNumber, @WebsiteURL,
        @DeliveryAddressLine1, @DeliveryAddressLine2, @DeliveryPostalCode,
        @PostalAddressLine1, @PostalAddressLine2, @PostalPostalCode,
        ISNULL(@LastEditedBy, 1)
    );

    SELECT @SupplierID AS SupplierID;
END
GO

CREATE OR ALTER PROCEDURE actualizarProveedor (
    @SupplierID               INT,
    @SupplierName             NVARCHAR(100) = NULL,
    @SupplierCategoryID       INT = NULL,
    @PrimaryContactPersonID   INT = NULL,
    @AlternateContactPersonID INT = NULL,
    @DeliveryMethodID         INT = NULL,
    @DeliveryCityID           INT = NULL,
    @PostalCityID             INT = NULL,
    @SupplierReference        NVARCHAR(20) = NULL,
    @BankAccountName          NVARCHAR(50) = NULL,
    @BankAccountBranch        NVARCHAR(50) = NULL,
    @BankAccountCode          NVARCHAR(20) = NULL,
    @BankAccountNumber        NVARCHAR(20) = NULL,
    @BankInternationalCode    NVARCHAR(20) = NULL,
    @PaymentDays              INT = NULL,
    @InternalComments         NVARCHAR(MAX) = NULL,
    @PhoneNumber              NVARCHAR(20) = NULL,
    @FaxNumber                NVARCHAR(20) = NULL,
    @WebsiteURL               NVARCHAR(256) = NULL,
    @DeliveryAddressLine1     NVARCHAR(60) = NULL,
    @DeliveryAddressLine2     NVARCHAR(60) = NULL,
    @DeliveryPostalCode       NVARCHAR(10) = NULL,
    @PostalAddressLine1       NVARCHAR(60) = NULL,
    @PostalAddressLine2       NVARCHAR(60) = NULL,
    @PostalPostalCode         NVARCHAR(10) = NULL,
    @LastEditedBy             INT = NULL
)
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM Purchasing.Suppliers WHERE SupplierID = @SupplierID)
        THROW 50001, 'El proveedor no existe.', 1;

    IF @SupplierName IS NOT NULL
       AND EXISTS (SELECT 1 FROM Purchasing.Suppliers WHERE SupplierName = @SupplierName AND SupplierID <> @SupplierID)
        THROW 50002, 'Ya existe otro proveedor con ese nombre.', 1;

    UPDATE Purchasing.Suppliers SET
        SupplierName             = ISNULL(@SupplierName, SupplierName),
        SupplierCategoryID       = ISNULL(@SupplierCategoryID, SupplierCategoryID),
        PrimaryContactPersonID   = ISNULL(@PrimaryContactPersonID, PrimaryContactPersonID),
        AlternateContactPersonID = ISNULL(@AlternateContactPersonID, AlternateContactPersonID),
        DeliveryMethodID         = ISNULL(@DeliveryMethodID, DeliveryMethodID),
        DeliveryCityID           = ISNULL(@DeliveryCityID, DeliveryCityID),
        PostalCityID             = ISNULL(@PostalCityID, PostalCityID),
        SupplierReference        = ISNULL(@SupplierReference, SupplierReference),
        BankAccountName          = ISNULL(@BankAccountName, BankAccountName),
        BankAccountBranch        = ISNULL(@BankAccountBranch, BankAccountBranch),
        BankAccountCode          = ISNULL(@BankAccountCode, BankAccountCode),
        BankAccountNumber        = ISNULL(@BankAccountNumber, BankAccountNumber),
        BankInternationalCode    = ISNULL(@BankInternationalCode, BankInternationalCode),
        PaymentDays              = ISNULL(@PaymentDays, PaymentDays),
        InternalComments         = ISNULL(@InternalComments, InternalComments),
        PhoneNumber              = ISNULL(@PhoneNumber, PhoneNumber),
        FaxNumber                = ISNULL(@FaxNumber, FaxNumber),
        WebsiteURL               = ISNULL(@WebsiteURL, WebsiteURL),
        DeliveryAddressLine1     = ISNULL(@DeliveryAddressLine1, DeliveryAddressLine1),
        DeliveryAddressLine2     = ISNULL(@DeliveryAddressLine2, DeliveryAddressLine2),
        DeliveryPostalCode       = ISNULL(@DeliveryPostalCode, DeliveryPostalCode),
        PostalAddressLine1       = ISNULL(@PostalAddressLine1, PostalAddressLine1),
        PostalAddressLine2       = ISNULL(@PostalAddressLine2, PostalAddressLine2),
        PostalPostalCode         = ISNULL(@PostalPostalCode, PostalPostalCode),
        LastEditedBy             = ISNULL(@LastEditedBy, 1)
    WHERE SupplierID = @SupplierID;
END
GO

CREATE OR ALTER PROCEDURE eliminarProveedor (
    @SupplierID INT
)
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM Purchasing.Suppliers WHERE SupplierID = @SupplierID)
        THROW 50001, 'El proveedor no existe.', 1;

    IF EXISTS (SELECT 1 FROM Warehouse.StockItems WHERE SupplierID = @SupplierID)
       OR EXISTS (SELECT 1 FROM Purchasing.PurchaseOrders WHERE SupplierID = @SupplierID)
       OR EXISTS (SELECT 1 FROM Purchasing.SupplierTransactions WHERE SupplierID = @SupplierID)
       OR EXISTS (SELECT 1 FROM Warehouse.StockItemTransactions WHERE SupplierID = @SupplierID)
        THROW 50002, 'No se puede eliminar: el proveedor tiene productos, órdenes de compra o transacciones asociadas.', 1;

    DELETE FROM Purchasing.Suppliers WHERE SupplierID = @SupplierID;
END
GO


-- =====================================================================
-- VENTAS (Sales.Invoices + Sales.InvoiceLines)
-- Las líneas se reciben como JSON:
--   '[{"StockItemID": 1, "Quantity": 5}, {"StockItemID": 66, "Quantity": 2, "UnitPrice": 10.50}]'
-- UnitPrice es opcional: si no viene se usa el precio del producto.
-- Descripción, empaque, impuesto, ganancia y precio extendido se calculan aquí.
-- =====================================================================

-- Procedimiento auxiliar: lo usan InsertInvoice y UpdateInvoice
CREATE OR ALTER PROCEDURE InsertInvoiceLinesFromJson (
    @InvoiceID    INT,
    @Lines        NVARCHAR(MAX),
    @LastEditedBy INT = 1
)
AS
BEGIN
    SET NOCOUNT ON;

    IF @Lines IS NULL OR ISJSON(@Lines) = 0
        THROW 50003, 'Las líneas deben enviarse como un arreglo JSON válido.', 1;

    DECLARE @ParsedLines TABLE (
        StockItemID INT,
        Quantity    INT,
        UnitPrice   DECIMAL(18,2)
    );

    INSERT INTO @ParsedLines (StockItemID, Quantity, UnitPrice)
    SELECT StockItemID, Quantity, UnitPrice
    FROM OPENJSON(@Lines)
    WITH (
        StockItemID INT           '$.StockItemID',
        Quantity    INT           '$.Quantity',
        UnitPrice   DECIMAL(18,2) '$.UnitPrice'
    );

    IF NOT EXISTS (SELECT 1 FROM @ParsedLines)
        THROW 50003, 'La factura debe tener al menos una línea.', 1;

    IF EXISTS (SELECT 1 FROM @ParsedLines
               WHERE StockItemID IS NULL OR Quantity IS NULL OR Quantity <= 0 OR UnitPrice < 0)
        THROW 50003, 'Cada línea necesita StockItemID y una cantidad mayor que 0.', 1;

    IF EXISTS (SELECT 1 FROM @ParsedLines l
               WHERE NOT EXISTS (SELECT 1 FROM dbo.syn_StockItems s WHERE s.StockItemID = l.StockItemID))
        THROW 50003, 'Una o más líneas tienen un StockItemID que no existe.', 1;

    INSERT INTO dbo.syn_InvoiceLines (
        InvoiceID, StockItemID, Description, PackageTypeID, Quantity, UnitPrice,
        TaxRate, TaxAmount, LineProfit, ExtendedPrice, LastEditedBy
    )
    SELECT
        @InvoiceID,
        s.StockItemID,
        s.StockItemName,
        s.UnitPackageID,
        l.Quantity,
        p.Price,
        s.TaxRate,
        CAST(ROUND(l.Quantity * p.Price * s.TaxRate / 100, 2) AS DECIMAL(18,2)),                    -- TaxAmount
        CAST(ROUND(l.Quantity * (p.Price - ISNULL(h.LastCostPrice, p.Price)), 2) AS DECIMAL(18,2)),   -- LineProfit
        CAST(ROUND(l.Quantity * p.Price * (1 + s.TaxRate / 100), 2) AS DECIMAL(18,2)),              -- ExtendedPrice
        @LastEditedBy
    FROM @ParsedLines l
    INNER JOIN dbo.syn_StockItems s ON s.StockItemID = l.StockItemID
    LEFT JOIN dbo.syn_StockItemHoldings h ON h.StockItemID = l.StockItemID
    CROSS APPLY (SELECT ISNULL(l.UnitPrice, s.UnitPrice) AS Price) p;

    -- Recalcular los totales del encabezado (líneas secas vs. refrigeradas)
    UPDATE i SET
        TotalDryItems     = ISNULL(t.DryItems, 0),
        TotalChillerItems = ISNULL(t.ChillerItems, 0)
    FROM dbo.syn_Invoices i
    OUTER APPLY (
        SELECT
            SUM(CASE WHEN s.IsChillerStock = 0 THEN 1 ELSE 0 END) AS DryItems,
            SUM(CASE WHEN s.IsChillerStock = 1 THEN 1 ELSE 0 END) AS ChillerItems
        FROM dbo.syn_InvoiceLines il
        INNER JOIN dbo.syn_StockItems s ON s.StockItemID = il.StockItemID
        WHERE il.InvoiceID = i.InvoiceID
    ) t
    WHERE i.InvoiceID = @InvoiceID;
END
GO

CREATE OR ALTER PROCEDURE InsertInvoice (
    @CustomerID                  INT,
    @SalespersonPersonID         INT,
    @Lines                       NVARCHAR(MAX),
    @DeliveryMethodID            INT = NULL,           -- si no viene, el del cliente
    @PackedByPersonID            INT = NULL,           -- si no viene, el vendedor
    @InvoiceDate                 DATE = NULL,          -- si no viene, hoy
    @CustomerPurchaseOrderNumber NVARCHAR(20) = NULL,
    @DeliveryInstructions        NVARCHAR(MAX) = NULL,
    @Comments                    NVARCHAR(MAX) = NULL,
    @LastEditedBy                INT = NULL
)
AS
BEGIN
    SET NOCOUNT ON;
    SET @LastEditedBy = ISNULL(@LastEditedBy, 1);

    DECLARE @BillToCustomerID INT, @ContactPersonID INT, @AccountsPersonID INT, @CustomerDeliveryMethodID INT;

    SELECT @BillToCustomerID         = BillToCustomerID,
           @ContactPersonID          = PrimaryContactPersonID,
           @CustomerDeliveryMethodID = DeliveryMethodID
    FROM dbo.syn_Customers
    WHERE CustomerID = @CustomerID;

    IF @BillToCustomerID IS NULL
        THROW 50003, 'El cliente indicado no existe.', 1;

    -- El contacto de cuentas es el contacto principal del cliente que paga
    SELECT @AccountsPersonID = PrimaryContactPersonID
    FROM dbo.syn_Customers
    WHERE CustomerID = @BillToCustomerID;

    DECLARE @InvoiceID INT;
    SET @InvoiceID = NEXT VALUE FOR Sequences.InvoiceID;

    BEGIN TRY
        BEGIN TRANSACTION;

        INSERT INTO dbo.syn_Invoices (
            InvoiceID, CustomerID, BillToCustomerID, DeliveryMethodID,
            ContactPersonID, AccountsPersonID, SalespersonPersonID, PackedByPersonID,
            InvoiceDate, CustomerPurchaseOrderNumber, IsCreditNote,
            Comments, DeliveryInstructions, TotalDryItems, TotalChillerItems,
            LastEditedBy
        )
        VALUES (
            @InvoiceID, @CustomerID, @BillToCustomerID, ISNULL(@DeliveryMethodID, @CustomerDeliveryMethodID),
            @ContactPersonID, @AccountsPersonID, @SalespersonPersonID, ISNULL(@PackedByPersonID, @SalespersonPersonID),
            ISNULL(@InvoiceDate, CAST(SYSDATETIME() AS DATE)), @CustomerPurchaseOrderNumber, 0,
            @Comments, @DeliveryInstructions, 0, 0,          -- los totales los calcula el SP de líneas
            @LastEditedBy
        );

        EXEC InsertInvoiceLinesFromJson @InvoiceID = @InvoiceID, @Lines = @Lines, @LastEditedBy = @LastEditedBy;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH;

    SELECT @InvoiceID AS InvoiceID;
END
GO

-- El cliente de una factura no se cambia: habría que recalcular cuentas y
-- contactos. Para eso se elimina y se crea otra.
CREATE OR ALTER PROCEDURE UpdateInvoice (
    @InvoiceID                   INT,
    @DeliveryMethodID            INT = NULL,
    @SalespersonPersonID         INT = NULL,
    @PackedByPersonID            INT = NULL,
    @InvoiceDate                 DATE = NULL,
    @CustomerPurchaseOrderNumber NVARCHAR(20) = NULL,
    @DeliveryInstructions        NVARCHAR(MAX) = NULL,
    @Comments                    NVARCHAR(MAX) = NULL,
    @Lines                       NVARCHAR(MAX) = NULL,  -- si viene, reemplaza todas las líneas
    @LastEditedBy                INT = NULL
)
AS
BEGIN
    SET NOCOUNT ON;
    SET @LastEditedBy = ISNULL(@LastEditedBy, 1);

    IF NOT EXISTS (SELECT 1 FROM dbo.syn_Invoices WHERE InvoiceID = @InvoiceID)
        THROW 50001, 'La factura no existe.', 1;

    BEGIN TRY
        BEGIN TRANSACTION;

        UPDATE dbo.syn_Invoices SET
            DeliveryMethodID            = ISNULL(@DeliveryMethodID, DeliveryMethodID),
            SalespersonPersonID         = ISNULL(@SalespersonPersonID, SalespersonPersonID),
            PackedByPersonID            = ISNULL(@PackedByPersonID, PackedByPersonID),
            InvoiceDate                 = ISNULL(@InvoiceDate, InvoiceDate),
            CustomerPurchaseOrderNumber = ISNULL(@CustomerPurchaseOrderNumber, CustomerPurchaseOrderNumber),
            DeliveryInstructions        = ISNULL(@DeliveryInstructions, DeliveryInstructions),
            Comments                    = ISNULL(@Comments, Comments),
            LastEditedBy                = @LastEditedBy,
            LastEditedWhen              = SYSDATETIME()
        WHERE InvoiceID = @InvoiceID;

        IF @Lines IS NOT NULL
        BEGIN
            DELETE FROM dbo.syn_InvoiceLines WHERE InvoiceID = @InvoiceID;
            EXEC InsertInvoiceLinesFromJson @InvoiceID = @InvoiceID, @Lines = @Lines, @LastEditedBy = @LastEditedBy;
        END

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH;
END
GO

-- Borra la factura junto con todo lo que depende de ella: sus líneas y
-- las transacciones de cliente e inventario que generó.
CREATE OR ALTER PROCEDURE DeleteInvoice (
    @InvoiceID INT
)
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM dbo.syn_Invoices WHERE InvoiceID = @InvoiceID)
        THROW 50001, 'La factura no existe.', 1;

    BEGIN TRY
        BEGIN TRANSACTION;

        DELETE FROM dbo.syn_StockItemTransactions WHERE InvoiceID = @InvoiceID;
        DELETE FROM dbo.syn_CustomerTransactions  WHERE InvoiceID = @InvoiceID;
        DELETE FROM dbo.syn_InvoiceLines          WHERE InvoiceID = @InvoiceID;
        DELETE FROM dbo.syn_Invoices              WHERE InvoiceID = @InvoiceID;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;
        THROW;
    END CATCH;
END
GO
