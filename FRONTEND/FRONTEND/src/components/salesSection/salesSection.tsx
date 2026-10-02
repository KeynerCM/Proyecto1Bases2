import { useEffect, useState } from "react";
import styles from "./salesSection.module.css";

const ROWS_PER_PAGE = 20;

type Sale = {
    InvoiceID: number;
    InvoiceDate: string;
    CustomerName: string;
    DeliveryMethodName: string;
    Amount: number;
};

export function SalesSection() {
    const [currentPage, setCurrentPage] = useState(1);
    const [sales, setSales] = useState<Sale[]>([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const getSales = async () => {
            try {
                setLoading(true);
                setErrorMessage("");

                const response = await fetch(
                    `http://localhost:3000/api/sales?pageNumber=${currentPage}`,
                    {
                        headers: {
                            "x-api-key": "6ef7908d83e853df10583389fd0279f67196882d4614da87f9b732330c94bab4",
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error("Error al obtener las ventas");
                }

                const data = await response.json();

                setSales(data);

            } catch (error) {
                console.error(error);
                setSales([]);
                setErrorMessage("Could not load the sales. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        getSales();

    }, [currentPage]);

    return (
        <section className={styles.salesSection}>

            {errorMessage && (
                <p className={styles.errorMessage}>
                    {errorMessage}
                </p>
            )}

            {loading && (
                <p className={styles.loading}>
                    Loading sales...
                </p>
            )}

            {!loading && !errorMessage && sales.length === 0 && (
                <p className={styles.emptyMessage}>
                    No sales match the selected filters.
                </p>
            )}

            <div className={styles.salesCards}>

                {sales.map((sale) => (
                    <div
                        key={sale.InvoiceID}
                        className={styles.saleCard}
                    >
                        <h3>Invoice #{sale.InvoiceID}</h3>

                        <p>{sale.CustomerName}</p>

                        <p>Date: {sale.InvoiceDate.slice(0, 10)}</p>

                        <p>{sale.DeliveryMethodName}</p>

                        <p>Amount: ${sale.Amount.toFixed(2)}</p>
                    </div>
                ))}

            </div>

            <div className={styles.pagination}>
                <button
                    className={styles.PaginationButton}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    Previous page
                </button>

                <span className={styles.PageNumber}>
                    Page {currentPage}
                </span>

                <button
                    className={styles.PaginationButton}
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={sales.length < ROWS_PER_PAGE}
                >
                    Next page
                </button>
            </div>

        </section>
    );
}
