import { useEffect, useState } from "react";
import styles from "./inventorySection.module.css";

const ROWS_PER_PAGE = 20;

type Product = {
    StockItemID: number;
    StockItemName: string;
    StockGroups: string;
    QuantityOnHand: number;
};

export function InventorySection() {
    const [currentPage, setCurrentPage] = useState(1);
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        const getProducts = async () => {
            try {
                const response = await fetch(
                    `http://localhost:3000/api/inventory?pageNumber=${currentPage}`,
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
            }
        };

        getProducts();

    }, [currentPage]);

    return (
        <section className={styles.inventorySection}>

            <div className={styles.productsCards}>

                {products.map((product) => (
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
                    disabled={products.length < ROWS_PER_PAGE}
                >
                    Next page
                </button>
            </div>

        </section>
    );
}
