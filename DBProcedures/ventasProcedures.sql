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


EXEC GetInvoicesGeneralInfo @PageNumber = 1;
EXEC GetInvoicesGeneralInfo @PageNumber = 1, @CustomerFilter = 'Tailspin', @StartDate = '2015-01-01', @EndDate = '2015-12-31', @MinAmount = 1000, @MaxAmount = 5000;
GO
