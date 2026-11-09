import React, { useEffect, useState } from "react";
import styles from "./inventorySection.module.css";
import { StockItemDetails } from "../stockItemDetails/stockItemDetails";
import { StockItemFormModal } from "../crud/StockItemFormModal";
import { ConfirmDeleteModal } from "../crud/ConfirmDeleteModal";
import { useCrudActions } from "../crud/useCrudActions";
import { SelectionBanner, SuccessNotice } from "../crud/CrudNotices";
import { apiRequest } from "../crud/apiClient";

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
    const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

    const crud = useCrudActions<Product>();

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
                const data = await apiRequest<StockGroup[]>("/inventory/groups");

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

                const data = await apiRequest<Product[]>(
                    `/inventory?pageNumber=${currentPage}&name=${encodeURIComponent(nameFilter)}&groupId=${groupFilter}&minQuantity=${minQuantity}&maxQuantity=${maxQuantity}`
                );

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

    }, [currentPage, nameFilter, groupFilter, minQuantity, maxQuantity, validationError, crud.refreshKey]);


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

    const deleteProduct = async () => {
        if (!crud.deleting) return;
        await apiRequest(`/inventory/${crud.deleting.StockItemID}`, { method: "DELETE" });
    };

    return (
        <section className={styles.inventorySection}>
            <div className={styles.actionsBar}>
                <button
                    className={styles.botonInsertarCliente}
                    onClick={crud.startCreate}
                >
                    Insertar Producto
                </button>

                <button
                    className={`${styles.botonActualizarCliente} ${crud.activeClass("update")}`}
                    onClick={() => crud.toggleMode("update")}
                >
                    Actualizar Producto
                </button>

                <button
                    className={`${styles.botonEliminarCliente} ${crud.activeClass("delete")}`}
                    onClick={() => crud.toggleMode("delete")}
                >
                    Eliminar Producto
                </button>
            </div>

            <SuccessNotice message={crud.notice} />

            <SelectionBanner
                mode={crud.actionMode}
                entity="un producto"
                pronoun="lo"
                onCancel={() => crud.setActionMode("view")}
            />

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

            <div className={`${styles.productsCards} ${crud.cardsClassName}`}>

                {!validationError && products.map((product) => (
                    <div
                        key={product.StockItemID}
                        className={styles.productCard}
                        onClick={() => crud.handleCardClick(product, (item) => setSelectedProductId(item.StockItemID))}
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


            {/* =========================
                PRODUCT DETAILS
            ========================= */}

            {selectedProductId !== null && (
                <StockItemDetails
                    stockItemId={selectedProductId}
                    onClose={() => setSelectedProductId(null)}
                />
            )}


            {/* =========================
                INSERTAR / ACTUALIZAR / ELIMINAR
            ========================= */}

            {crud.creating && (
                <StockItemFormModal
                    mode="create"
                    onClose={() => crud.setCreating(false)}
                    onSaved={crud.finish}
                />
            )}

            {crud.editing && (
                <StockItemFormModal
                    mode="update"
                    stockItemId={crud.editing.StockItemID}
                    stockItemName={crud.editing.StockItemName}
                    onClose={() => crud.setEditing(null)}
                    onSaved={crud.finish}
                />
            )}

            {crud.deleting && (
                <ConfirmDeleteModal
                    title="Eliminar producto"
                    itemName={crud.deleting.StockItemName}
                    warning="Solo se pueden eliminar productos que no aparezcan en facturas, pedidos ni movimientos de inventario."
                    onConfirm={deleteProduct}
                    onDeleted={() => crud.finish("Producto eliminado correctamente.")}
                    onClose={() => crud.setDeleting(null)}
                />
            )}

        </section>
    );
}
