USE WideWorldImporters;
GO

CREATE OR ALTER PROCEDURE GetInvoicesGeneralInfo(
    @PageNumber INT,
    @CustomerFilter NVARCHAR(100) = NULL,
    @StartDate DATE = NULL,
    @EndDate DATE = NULL,
    @MinAmount DECIMAL(18,2) = NULL,
    @MaxAmount DECIMAL(18,2) = NULL
)
AS
BEGIN
DECLARE @RowsOfPage as INT
SET @RowsOfPage=20
SELECT i.InvoiceID, i.InvoiceDate, c.CustomerName, d.DeliveryMethodName, SUM(il.ExtendedPrice) AS Amount FROM syn_Invoices i
INNER JOIN syn_Customers c ON c.CustomerID = i.CustomerID
INNER JOIN syn_DeliveryMethods d ON d.DeliveryMethodID = i.DeliveryMethodID
INNER JOIN syn_InvoiceLines il ON il.InvoiceID = i.InvoiceID
WHERE (@CustomerFilter IS NULL OR c.CustomerName LIKE '%' + @CustomerFilter + '%')
AND (@StartDate IS NULL OR i.InvoiceDate >= @StartDate)
AND (@EndDate IS NULL OR i.InvoiceDate <= @EndDate)
GROUP BY i.InvoiceID, i.InvoiceDate, c.CustomerName, d.DeliveryMethodName
HAVING (@MinAmount IS NULL OR SUM(il.ExtendedPrice) >= @MinAmount)
AND (@MaxAmount IS NULL OR SUM(il.ExtendedPrice) <= @MaxAmount)
ORDER BY c.CustomerName, i.InvoiceID
OFFSET (@PageNumber-1)*@RowsOfPage ROWS FETCH NEXT @RowsOfPage ROWS ONLY;
END

GO

CREATE OR ALTER PROCEDURE GetInvoiceAdvancedInfo (
    @InvoiceID INT
)
AS
BEGIN
    -- Encabezado de la factura
    SELECT i.InvoiceID, i.CustomerID, c.CustomerName, d.DeliveryMethodName, i.CustomerPurchaseOrderNumber,
    cp.FullName AS ContactPerson, sp.FullName AS Salesperson, i.InvoiceDate, i.DeliveryInstructions

    FROM syn_Invoices i
    INNER JOIN syn_Customers c
    ON i.CustomerID = c.CustomerID
    INNER JOIN syn_DeliveryMethods d
    ON i.DeliveryMethodID = d.DeliveryMethodID
    INNER JOIN syn_People cp
    ON i.ContactPersonID = cp.PersonID
    INNER JOIN syn_People sp
    ON i.SalespersonPersonID = sp.PersonID
    WHERE i.InvoiceID = @InvoiceID;

    -- Detalle de la factura
    SELECT il.InvoiceLineID, il.StockItemID, s.StockItemName, il.Quantity, il.UnitPrice,
    il.TaxRate, il.TaxAmount, il.ExtendedPrice

    FROM syn_InvoiceLines il
    INNER JOIN syn_StockItems s
    ON il.StockItemID = s.StockItemID
    WHERE il.InvoiceID = @InvoiceID
    ORDER BY il.InvoiceLineID;
END

GO


EXEC GetInvoicesGeneralInfo @PageNumber = 1;
EXEC GetInvoicesGeneralInfo @PageNumber = 1, @CustomerFilter = 'Tailspin', @StartDate = '2015-01-01', @EndDate = '2015-12-31', @MinAmount = 1000, @MaxAmount = 5000;
EXEC GetInvoiceAdvancedInfo @InvoiceID = 1;
GO
