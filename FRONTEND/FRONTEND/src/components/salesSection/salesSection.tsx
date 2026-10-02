import React, { useEffect, useState } from "react";
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
    const [customerFilter, setCustomerFilter] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [minAmount, setMinAmount] = useState("");
    const [maxAmount, setMaxAmount] = useState("");
    const [sales, setSales] = useState<Sale[]>([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const validateFilters = () => {
        if (startDate !== "" && endDate !== "" && startDate > endDate) {
            return "Start date cannot be after end date";
        }

        if (minAmount !== "" && (isNaN(Number(minAmount)) || Number(minAmount) < 0)) {
            return "Minimum amount must be a number greater than or equal to 0";
        }

        if (maxAmount !== "" && (isNaN(Number(maxAmount)) || Number(maxAmount) < 0)) {
            return "Maximum amount must be a number greater than or equal to 0";
        }

        if (minAmount !== "" && maxAmount !== "" && Number(minAmount) > Number(maxAmount)) {
            return "Minimum amount cannot be greater than maximum amount";
        }

        return "";
    };

    const validationError = validateFilters();

    useEffect(() => {
        if (validationError) {
            return;
        }

        // Evita que una respuesta vieja sobrescriba los resultados de un filtro nuevo
        let ignore = false;

        const getSales = async () => {
            try {
                setLoading(true);
                setErrorMessage("");

                const response = await fetch(
                    `http://localhost:3000/api/sales?pageNumber=${currentPage}&customer=${encodeURIComponent(customerFilter)}&startDate=${startDate}&endDate=${endDate}&minAmount=${minAmount}&maxAmount=${maxAmount}`,
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

                if (!ignore) {
                    setSales(data);
                }

            } catch (error) {
                console.error(error);
                setSales([]);
                setErrorMessage("Could not load the sales. Please try again.");
            } finally {
                if (!ignore) {
                    setLoading(false);
                }
            }
        };

        getSales();

        return () => {
            ignore = true;
        };

    }, [currentPage, customerFilter, startDate, endDate, minAmount, maxAmount, validationError]);


    const handleFilterChange = (setFilter: (value: string) => void) =>
        (event: React.ChangeEvent<HTMLInputElement>) => {
            setFilter(event.target.value);
            setCurrentPage(1);
        };

    const restoreFilters = () => {
        setCustomerFilter("");
        setStartDate("");
        setEndDate("");
        setMinAmount("");
        setMaxAmount("");
        setCurrentPage(1);
    };

    return (
        <section className={styles.salesSection}>

            <div className={styles.filterContainer}>
                <input
                    type="text"
                    placeholder="Search by customer name..."
                    className={styles.searchInput}
                    value={customerFilter}
                    onChange={handleFilterChange(setCustomerFilter)}
                />

                <label className={styles.filterLabel}>
                    From
                    <input
                        type="date"
                        className={styles.dateInput}
                        value={startDate}
                        max={endDate || undefined}
                        onChange={handleFilterChange(setStartDate)}
                    />
                </label>

                <label className={styles.filterLabel}>
                    To
                    <input
                        type="date"
                        className={styles.dateInput}
                        value={endDate}
                        min={startDate || undefined}
                        onChange={handleFilterChange(setEndDate)}
                    />
                </label>

                <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Min amount"
                    className={styles.amountInput}
                    value={minAmount}
                    onChange={handleFilterChange(setMinAmount)}
                />

                <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Max amount"
                    className={styles.amountInput}
                    value={maxAmount}
                    onChange={handleFilterChange(setMaxAmount)}
                />

                <button
                    className={styles.restoreButton}
                    onClick={restoreFilters}
                >
                    Restore filters
                </button>
            </div>

            {(validationError || errorMessage) && (
                <p className={styles.errorMessage}>
                    {validationError || errorMessage}
                </p>
            )}

            {loading && (
                <p className={styles.loading}>
                    Loading sales...
                </p>
            )}

            {!loading && !validationError && !errorMessage && sales.length === 0 && (
                <p className={styles.emptyMessage}>
                    No sales match the selected filters.
                </p>
            )}

            <div className={styles.salesCards}>

                {!validationError && sales.map((sale) => (
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
                    disabled={validationError !== "" || sales.length < ROWS_PER_PAGE}
                >
                    Next page
                </button>
            </div>

        </section>
    );
}
