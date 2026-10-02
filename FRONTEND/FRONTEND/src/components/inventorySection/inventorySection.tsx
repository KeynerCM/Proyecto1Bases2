import React, { useEffect, useState } from "react";
import styles from "./inventorySection.module.css";

const ROWS_PER_PAGE = 20;

type Product = {
    StockItemID: number;
    StockItemName: string;
    StockGroups: string;
    QuantityOnHand: number;
};

type StockGroup = {
    StockGroupID: number;
    StockGroupName: string;
};

export function InventorySection() {
    const [currentPage, setCurrentPage] = useState(1);
    const [nameFilter, setNameFilter] = useState("");
    const [groupFilter, setGroupFilter] = useState("");
    const [minQuantity, setMinQuantity] = useState("");
    const [maxQuantity, setMaxQuantity] = useState("");
    const [products, setProducts] = useState<Product[]>([]);
    const [stockGroups, setStockGroups] = useState<StockGroup[]>([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const validateQuantities = () => {
        if (minQuantity !== "" && (!Number.isInteger(Number(minQuantity)) || Number(minQuantity) < 1)) {
            return "Minimum quantity must be a whole number greater than 0";
        }

        if (maxQuantity !== "" && (!Number.isInteger(Number(maxQuantity)) || Number(maxQuantity) < 1)) {
            return "Maximum quantity must be a whole number greater than 0";
        }

        if (minQuantity !== "" && maxQuantity !== "" && Number(minQuantity) > Number(maxQuantity)) {
            return "Minimum quantity cannot be greater than maximum quantity";
        }

        return "";
    };

    const validationError = validateQuantities();

    useEffect(() => {
        const getStockGroups = async () => {
            try {
                const response = await fetch(
                    "http://localhost:3000/api/inventory/groups",
                    {
                        headers: {
                            "x-api-key": "6ef7908d83e853df10583389fd0279f67196882d4614da87f9b732330c94bab4",
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error("Error al obtener los grupos");
                }

                const data = await response.json();

                setStockGroups(data);

            } catch (error) {
                console.error(error);
            }
        };

        getStockGroups();

    }, []);

    useEffect(() => {
        if (validationError) {
            return;
        }

        const getProducts = async () => {
            try {
                setLoading(true);
                setErrorMessage("");

                const response = await fetch(
                    `http://localhost:3000/api/inventory?pageNumber=${currentPage}&name=${encodeURIComponent(nameFilter)}&groupId=${groupFilter}&minQuantity=${minQuantity}&maxQuantity=${maxQuantity}`,
                    {
                        headers: {
                            "x-api-key": "6ef7908d83e853df10583389fd0279f67196882d4614da87f9b732330c94bab4",
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error("Error al obtener los productos");
                }

                const data = await response.json();

                setProducts(data);

            } catch (error) {
                console.error(error);
                setProducts([]);
                setErrorMessage("Could not load the products. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        getProducts();

    }, [currentPage, nameFilter, groupFilter, minQuantity, maxQuantity, validationError]);


    const handleFilterChange = (setFilter: (value: string) => void) =>
        (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
            setFilter(event.target.value);
            setCurrentPage(1);
        };

    const restoreFilters = () => {
        setNameFilter("");
        setGroupFilter("");
        setMinQuantity("");
        setMaxQuantity("");
        setCurrentPage(1);
    };

    return (
        <section className={styles.inventorySection}>

            <div className={styles.filterContainer}>
                <input
                    type="text"
                    placeholder="Search by product name..."
                    className={styles.searchInput}
                    value={nameFilter}
                    onChange={handleFilterChange(setNameFilter)}
                />

                <select
                    className={styles.filterSelect}
                    value={groupFilter}
                    onChange={handleFilterChange(setGroupFilter)}
                >
                    <option value="">All groups</option>
                    {stockGroups.map((group) => (
                        <option key={group.StockGroupID} value={group.StockGroupID}>
                            {group.StockGroupName}
                        </option>
                    ))}
                </select>

                <input
                    type="number"
                    min="1"
                    step="1"
                    placeholder="Min quantity"
                    className={styles.quantityInput}
                    value={minQuantity}
                    onChange={handleFilterChange(setMinQuantity)}
                />

                <input
                    type="number"
                    min="1"
                    step="1"
                    placeholder="Max quantity"
                    className={styles.quantityInput}
                    value={maxQuantity}
                    onChange={handleFilterChange(setMaxQuantity)}
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
                    Loading products...
                </p>
            )}

            {!loading && !validationError && !errorMessage && products.length === 0 && (
                <p className={styles.emptyMessage}>
                    No products match the selected filters.
                </p>
            )}

            <div className={styles.productsCards}>

                {!validationError && products.map((product) => (
                    <div
                        key={product.StockItemID}
                        className={styles.productCard}
                    >
                        <h3>{product.StockItemName}</h3>

                        <p>{product.StockGroups}</p>

                        <p>Quantity on hand: {product.QuantityOnHand}</p>
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
                    disabled={validationError !== "" || products.length < ROWS_PER_PAGE}
                >
                    Next page
                </button>
            </div>

        </section>
    );
}
