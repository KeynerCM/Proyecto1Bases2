import { useEffect, useState } from "react";
import styles from "./stockItemDetails.module.css";

type ProductDetails = {
    StockItemID: number;
    StockItemName: string;
    SupplierID: number;
    SupplierName: string;
    SupplierWebsiteURL: string;
    ColorName: string | null;
    UnitPackage: string;
    OuterPackage: string;
    QuantityPerOuter: number;
    Brand: string | null;
    Size: string | null;
    TaxRate: number;
    UnitPrice: number;
    RecommendedRetailPrice: number | null;
    TypicalWeightPerUnit: number;
    SearchDetails: string;
    QuantityOnHand: number;
    BinLocation: string;
};

type StockItemDetailsProps = {
    stockItemId: number;
    onClose: () => void;
};

export function StockItemDetails({ stockItemId, onClose }: StockItemDetailsProps) {
    const [productDetails, setProductDetails] = useState<ProductDetails | null>(null);
    const [loadingDetails, setLoadingDetails] = useState(true);

    useEffect(() => {
        const getProductDetails = async () => {
            try {
                const response = await fetch(
                    `http://localhost:3000/api/inventory/specific?id=${stockItemId}`,
                    {
                        headers: {
                            "x-api-key": "6ef7908d83e853df10583389fd0279f67196882d4614da87f9b732330c94bab4",
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error("Error al obtener los detalles del producto");
                }

                const data = await response.json();

                // El endpoint devuelve un array
                setProductDetails(data[0] || null);

            } catch (error) {
                console.error(error);
            } finally {
                setLoadingDetails(false);
            }
        };

        getProductDetails();

    }, [stockItemId]);

    return (
        <div
            className={styles.modalOverlay}
            onClick={onClose}
        >
            <div
                className={styles.productDetails}
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
                        Loading product details...
                    </p>
                ) : productDetails ? (
                    <>
                        <h2>{productDetails.StockItemName}</h2>

                        <h4 className={styles.sectionTitle}>
                            General information
                        </h4>

                        <div className={styles.detailsContainer}>
                            <div className={styles.detailItem}>
                                <span>Supplier</span>
                                <a
                                    href={productDetails.SupplierWebsiteURL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {productDetails.SupplierName}
                                </a>
                            </div>

                            <div className={styles.detailItem}>
                                <span>Brand</span>
                                <strong>
                                    {productDetails.Brand || "N/A"}
                                </strong>
                            </div>

                            <div className={styles.detailItem}>
                                <span>Color</span>
                                <strong>
                                    {productDetails.ColorName || "N/A"}
                                </strong>
                            </div>

                            <div className={styles.detailItem}>
                                <span>Size</span>
                                <strong>
                                    {productDetails.Size || "N/A"}
                                </strong>
                            </div>
                        </div>

                        <h4 className={styles.sectionTitle}>
                            Packaging
                        </h4>

                        <div className={styles.detailsContainer}>
                            <div className={styles.detailItem}>
                                <span>Unit package</span>
                                <strong>
                                    {productDetails.UnitPackage}
                                </strong>
                            </div>

                            <div className={styles.detailItem}>
                                <span>Outer package</span>
                                <strong>
                                    {productDetails.OuterPackage}
                                </strong>
                            </div>

                            <div className={styles.detailItem}>
                                <span>Quantity per outer</span>
                                <strong>
                                    {productDetails.QuantityPerOuter}
                                </strong>
                            </div>

                            <div className={styles.detailItem}>
                                <span>Weight</span>
                                <strong>
                                    {productDetails.TypicalWeightPerUnit} kg
                                </strong>
                            </div>
                        </div>

                        <h4 className={styles.sectionTitle}>
                            Prices
                        </h4>

                        <div className={styles.detailsContainer}>
                            <div className={styles.detailItem}>
                                <span>Unit price</span>
                                <strong>
                                    ${productDetails.UnitPrice.toFixed(2)}
                                </strong>
                            </div>

                            <div className={styles.detailItem}>
                                <span>Recommended retail price</span>
                                <strong>
                                    {productDetails.RecommendedRetailPrice !== null
                                        ? `$${productDetails.RecommendedRetailPrice.toFixed(2)}`
                                        : "N/A"}
                                </strong>
                            </div>

                            <div className={styles.detailItem}>
                                <span>Tax</span>
                                <strong>
                                    {productDetails.TaxRate}%
                                </strong>
                            </div>
                        </div>

                        <h4 className={styles.sectionTitle}>
                            Stock
                        </h4>

                        <div className={styles.detailsContainer}>
                            <div className={styles.detailItem}>
                                <span>Quantity on hand</span>
                                <strong>
                                    {productDetails.QuantityOnHand}
                                </strong>
                            </div>

                            <div className={styles.detailItem}>
                                <span>Location</span>
                                <strong>
                                    {productDetails.BinLocation}
                                </strong>
                            </div>
                        </div>

                        <h4 className={styles.sectionTitle}>
                            Search details
                        </h4>

                        <div className={styles.keywordsCard}>
                            <p>
                                {productDetails.SearchDetails}
                            </p>
                        </div>
                    </>
                ) : (
                    <p>
                        Unable to load product details.
                    </p>
                )}
            </div>
        </div>
    );
}
