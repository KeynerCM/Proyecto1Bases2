import { useEffect, useState } from "react";
import styles from "./invoiceDetails.module.css";
import { StockItemDetails } from "../stockItemDetails/stockItemDetails";
import { CustomerDetails } from "../customerDetails/customerDetails";
import { apiRequest } from "../crud/apiClient";

type InvoiceHeader = {
    InvoiceID: number;
    CustomerID: number;
    CustomerName: string;
    DeliveryMethodName: string;
    CustomerPurchaseOrderNumber: string | null;
    ContactPerson: string;
    Salesperson: string;
    InvoiceDate: string;
    DeliveryInstructions: string | null;
};

type InvoiceLine = {
    InvoiceLineID: number;
    StockItemID: number;
    StockItemName: string;
    Quantity: number;
    UnitPrice: number;
    TaxRate: number;
    TaxAmount: number;
    ExtendedPrice: number;
};

type InvoiceDetailsProps = {
    invoiceId: number;
    onClose: () => void;
};

export function InvoiceDetails({ invoiceId, onClose }: InvoiceDetailsProps) {
    const [invoiceHeader, setInvoiceHeader] = useState<InvoiceHeader | null>(null);
    const [invoiceLines, setInvoiceLines] = useState<InvoiceLine[]>([]);
    const [loadingDetails, setLoadingDetails] = useState(true);
    const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
    const [showCustomerDetails, setShowCustomerDetails] = useState(false);

    useEffect(() => {
        const getInvoiceDetails = async () => {
            try {
                const data = await apiRequest<{ header: InvoiceHeader; lines: InvoiceLine[] }>(
                    `/sales/specific?id=${invoiceId}`
                );

                // El endpoint devuelve { header, lines }
                setInvoiceHeader(data.header);
                setInvoiceLines(data.lines);

            } catch (error) {
                console.error(error);
            } finally {
                setLoadingDetails(false);
            }
        };

        getInvoiceDetails();

    }, [invoiceId]);

    return (
        <>
            <div
                className={styles.modalOverlay}
                onClick={onClose}
            >
                <div
                    className={styles.invoiceDetails}
                    onClick={(event) => event.stopPropagation()}
                >
                    <button
                        className={styles.closeButton}
                        onClick={onClose}
                    >
                        ×
                    </button>

                    {loadingDetails ? (
                        <p className={styles.loading}>
                            Loading invoice details...
                        </p>
                    ) : invoiceHeader ? (
                        <>
                            <h2>Invoice #{invoiceHeader.InvoiceID}</h2>

                            <h4 className={styles.sectionTitle}>
                                Invoice header
                            </h4>

                            <div className={styles.detailsContainer}>
                                <div className={styles.detailItem}>
                                    <span>Customer</span>
                                    <button
                                        className={styles.linkButton}
                                        onClick={() => setShowCustomerDetails(true)}
                                    >
                                        {invoiceHeader.CustomerName}
                                    </button>
                                </div>

                                <div className={styles.detailItem}>
                                    <span>Invoice date</span>
                                    <strong>
                                        {invoiceHeader.InvoiceDate.slice(0, 10)}
                                    </strong>
                                </div>

                                <div className={styles.detailItem}>
                                    <span>Delivery method</span>
                                    <strong>
                                        {invoiceHeader.DeliveryMethodName}
                                    </strong>
                                </div>

                                <div className={styles.detailItem}>
                                    <span>Purchase order number</span>
                                    <strong>
                                        {invoiceHeader.CustomerPurchaseOrderNumber || "N/A"}
                                    </strong>
                                </div>

                                <div className={styles.detailItem}>
                                    <span>Contact person</span>
                                    <strong>
                                        {invoiceHeader.ContactPerson}
                                    </strong>
                                </div>

                                <div className={styles.detailItem}>
                                    <span>Salesperson</span>
                                    <strong>
                                        {invoiceHeader.Salesperson}
                                    </strong>
                                </div>
                            </div>

                            <h4 className={styles.sectionTitle}>
                                Delivery instructions
                            </h4>

                            <div className={styles.instructionsCard}>
                                <p>
                                    {invoiceHeader.DeliveryInstructions || "N/A"}
                                </p>
                            </div>

                            <h4 className={styles.sectionTitle}>
                                Invoice lines
                            </h4>

                            <div className={styles.tableContainer}>
                                <table className={styles.linesTable}>
                                    <thead>
                                        <tr>
                                            <th>Product</th>
                                            <th>Quantity</th>
                                            <th>Unit price</th>
                                            <th>Tax rate</th>
                                            <th>Tax amount</th>
                                            <th>Line total</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {invoiceLines.map((line) => (
                                            <tr key={line.InvoiceLineID}>
                                                <td>
                                                    <button
                                                        className={styles.linkButton}
                                                        onClick={() => setSelectedProductId(line.StockItemID)}
                                                    >
                                                        {line.StockItemName}
                                                    </button>
                                                </td>
                                                <td>{line.Quantity}</td>
                                                <td>${line.UnitPrice.toFixed(2)}</td>
                                                <td>{line.TaxRate}%</td>
                                                <td>${line.TaxAmount.toFixed(2)}</td>
                                                <td>${line.ExtendedPrice.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : (
                        <p>
                            Unable to load invoice details.
                        </p>
                    )}
                </div>
            </div>

            {showCustomerDetails && invoiceHeader && (
                <CustomerDetails
                    customerName={invoiceHeader.CustomerName}
                    onClose={() => setShowCustomerDetails(false)}
                />
            )}

            {selectedProductId !== null && (
                <StockItemDetails
                    stockItemId={selectedProductId}
                    onClose={() => setSelectedProductId(null)}
                />
            )}
        </>
    );
}
