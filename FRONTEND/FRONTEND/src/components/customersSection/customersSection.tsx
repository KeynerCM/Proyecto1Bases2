import React, { useEffect, useState } from "react";
import styles from "./customersSection.module.css";

export function CustomersSection() {
    const [currentPage, setCurrentPage] = useState(1);
    const [nameFilter, setNameFilter] = useState("");
    const [customers, setCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [customerDetails, setCustomerDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    const handleCustomerClick = async (customer) => {
        try {
            setSelectedCustomer(customer);
            setCustomerDetails(null);
            setLoadingDetails(true);

            const response = await fetch(
                `http://localhost:3000/api/customers/specific?name=${encodeURIComponent(customer.CUSTOMERNAME)}`,
                {
                    headers: {
                        "x-api-key": "6ef7908d83e853df10583389fd0279f67196882d4614da87f9b732330c94bab4"
                    },
                }
            );

            if (!response.ok) {
                throw new Error("Error al obtener los detalles del cliente");
            }

            const data = await response.json();

            // El endpoint devuelve un array
            setCustomerDetails(data[0]);

        } catch (error) {
            console.error(error);
        } finally {
            setLoadingDetails(false);
        }
    };

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


    const closeCustomerDetails = () => {
        setSelectedCustomer(null);
        setCustomerDetails(null);
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
                    <div
                        key={index}
                        className={styles.customerCard}
                        onClick={() => handleCustomerClick(customer)}
                    >
                        <h3>{customer.CUSTOMERNAME}</h3>

                        <p>{customer.CustomerCategoryName}</p>

                        <p>{customer.DeliveryMethodName}</p>
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
                >
                    Next page
                </button>
            </div>


            {/* =========================
                CUSTOMER DETAILS
            ========================= */}

            {selectedCustomer && (
                <div
                    className={styles.modalOverlay}
                    onClick={closeCustomerDetails}
                >
                    <div
                        className={styles.customerDetails}
                        onClick={(event) => event.stopPropagation()}
                    >
                        <button
                            className={styles.closeButton}
                            onClick={closeCustomerDetails}
                        >
                            ×
                        </button>

                        {loadingDetails ? (
                            <p className={styles.loading}>
                                Loading customer details...
                            </p>
                        ) : customerDetails ? (
                            <>
                                <h2>{customerDetails.CustomerName}</h2>

                                <h4 className={styles.sectionTitle}>
                                    General information
                                </h4>

                                <div className={styles.detailsContainer}>
                                    <div className={styles.detailItem}>
                                        <span>Category</span>
                                        <strong>
                                            {customerDetails.CustomerCategoryName}
                                        </strong>
                                    </div>

                                    <div className={styles.detailItem}>
                                        <span>Buying group</span>
                                        <strong>
                                            {customerDetails.BuyingGroupName || "N/A"}
                                        </strong>
                                    </div>

                                    <div className={styles.detailItem}>
                                        <span>Payment days</span>
                                        <strong>
                                            {customerDetails.PaymentDays} days
                                        </strong>
                                    </div>

                                    <div className={styles.detailItem}>
                                        <span>Delivery method</span>
                                        <strong>
                                            {customerDetails.DeliveryMethodName}
                                        </strong>
                                    </div>
                                </div>

                                <h4 className={styles.sectionTitle}>
                                    Contact
                                </h4>

                                <div className={styles.detailsContainer}>
                                    <div className={styles.detailItem}>
                                        <span>Phone</span>
                                        <strong>
                                            {customerDetails.PhoneNumber}
                                        </strong>
                                    </div>

                                    <div className={styles.detailItem}>
                                        <span>Fax</span>
                                        <strong>
                                            {customerDetails.FaxNumber}
                                        </strong>
                                    </div>

                                    <div className={styles.detailItem}>
                                        <span>City</span>
                                        <strong>
                                            {customerDetails.CityName}
                                        </strong>
                                    </div>

                                    <div className={styles.detailItem}>
                                        <span>Website</span>
                                        <a
                                            href={customerDetails.WebsiteURL}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            Visit website
                                        </a>
                                    </div>
                                </div>

                                <h4 className={styles.sectionTitle}>
                                    Delivery address
                                </h4>

                                <div className={styles.addressCard}>
                                    <p>
                                        {customerDetails.DeliveryAddressLine1}
                                    </p>

                                    <p>
                                        {customerDetails.DeliveryAddressLine2}
                                    </p>

                                    <p>
                                        Postal code:{" "}
                                        {customerDetails.DeliveryPostalCode}
                                    </p>
                                </div>

                                <h4 className={styles.sectionTitle}>
                                    Postal address
                                </h4>

                                <div className={styles.addressCard}>
                                    <p>
                                        {customerDetails.PostalAddressLine1}
                                    </p>

                                    <p>
                                        {customerDetails.PostalAddressLine2}
                                    </p>

                                    <p>
                                        Postal code:{" "}
                                        {customerDetails.PostalPostalCode}
                                    </p>
                                </div>

                                <h4 className={styles.sectionTitle}>
                                    Delivery location
                                </h4>

                                <a
                                    className={styles.mapContainer}
                                    href={`https://www.google.com/maps?q=${customerDetails.DeliveryLocation?.points?.[0]?.lat},${customerDetails.DeliveryLocation?.points?.[0]?.lng}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <iframe
                                        title="Customer delivery location"
                                        src={`https://www.google.com/maps?q=${customerDetails.DeliveryLocation?.points?.[0]?.lat},${customerDetails.DeliveryLocation?.points?.[0]?.lng}&output=embed`}
                                        loading="lazy"
                                    />
                                </a>

                                <p className={styles.mapHint}>
                                    Click the map to open the location in Google Maps
                                </p>
                            </>
                        ) : (
                            <p>
                                Unable to load customer details.
                            </p>
                        )}
                    </div>
                </div>
            )}

        </section>
    );
}