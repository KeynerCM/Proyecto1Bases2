import React, { useEffect, useState } from "react";
import styles from "./customersSection.module.css";

export function CustomersSection() {
    const [currentPage, setCurrentPage] = useState(1);
    const [nameFilter, setNameFilter] = useState("");
    const [customers, setCustomers] = useState([]);

    useEffect(() => {
        const getCustomers = async () => {
            try {
                const response = await fetch(
                    `http://localhost:3000/api/customers?pageNumber=${currentPage}&name=${encodeURIComponent(nameFilter)}`,
                    {
                        headers: {
                            "x-api-key": "6ef7908d83e853df10583389fd0279f67196882d4614da87f9b732330c94bab4",
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error("Error al obtener los clientes");
                }

                const data = await response.json();

                setCustomers(data);

            } catch (error) {
                console.error(error);
            }
        };

        getCustomers();

    }, [currentPage, nameFilter]);

    const handleSearch = (event) => {
        setNameFilter(event.target.value);
        setCurrentPage(1);
    };

    return (
        <section className={styles.customersSection}>

            <div className={styles.filterContainer}>
                <input
                    type="text"
                    placeholder="Search..."
                    className={styles.searchInput}
                    value={nameFilter}
                    onChange={handleSearch}
                />
            </div>

            <div className={styles.customersCards}>

                {customers.map((customer, index) => (
                    <div key={index} className={styles.customerCard}>
                        <h3>{customer.CUSTOMERNAME}</h3>
                        <p>{customer.CustomerCategoryName}</p>
                        <p>{customer.DeliveryMethodName}</p>
                    </div>
                ))}

            </div>

            <div>
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
                >
                    Next page
                </button>
            </div>

        </section>
    );
}