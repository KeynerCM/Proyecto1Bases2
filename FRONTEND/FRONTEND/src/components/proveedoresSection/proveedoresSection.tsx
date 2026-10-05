import React, { useEffect, useState } from "react";
import styles from "./proveedoresSection.module.css";

export function ProveedoresSection() {

    const [proveedores, setProveedores] = useState([]);

    const [nombreProveedor, setNombreProveedor] = useState("");
    const [nombreCategoria, setNombreCategoria] = useState("");
    const [selectedProveedor, setSelectedProveedor] = useState(null);
    const [proveedorDetails, setProveedorDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    const [loading, setLoading] = useState(false);

    const handleSearch = (event) => {
        setNombreProveedor(event.target.value);
    };
    const handleProveedorClick = async (proveedor) => {
        try {
            setSelectedProveedor(proveedor);
            setProveedorDetails(null);
            setLoadingDetails(true);

            const response = await fetch(
                `http://localhost:3000/api/proveedores/specific?name=${encodeURIComponent(
                    proveedor.SupplierName
                )}`,
                {
                    headers: {
                        "x-api-key": import.meta.env.VITE_API_KEY
                    }
                }
            );

            if (!response.ok) {
                throw new Error(
                    `Error ${response.status}: ${response.statusText}`
                );
            }

            const data = await response.json();

            console.log("Detalles del proveedor:", data);

            setProveedorDetails(data[0]);

        } catch (error) {

            console.error(
                "Error al obtener los detalles del proveedor:",
                error
            );

        } finally {
            setLoadingDetails(false);
        }
    };
    const closeProveedorDetails = () => {
        setSelectedProveedor(null);
        setProveedorDetails(null);
    };

    const handleCategoryChange = (event) => {
        setNombreCategoria(event.target.value);
    };

    useEffect(() => {

        const getProveedores = async () => {

            try {

                setLoading(true);

                const params = new URLSearchParams();

                if (nombreProveedor.trim() !== "") {
                    params.append("nombre", nombreProveedor);
                }

                if (nombreCategoria.trim() !== "") {
                    params.append("categoria", nombreCategoria);
                }

                const response = await fetch(
                    `http://localhost:3000/api/proveedores?${params.toString()}`,
                    {
                        headers: {
                            "x-api-key": import.meta.env.VITE_API_KEY
                        }
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        `Error ${response.status}: ${response.statusText}`
                    );
                }

                const data = await response.json();

                setProveedores(data);

            } catch (error) {

                console.error(
                    "Error al obtener proveedores:",
                    error
                );

            } finally {

                setLoading(false);

            }
        };

        getProveedores();

    }, [nombreProveedor, nombreCategoria]);


    return (
        <section className={styles.proveedoresSection}>

            {/* =========================
                FILTROS
            ========================= */}

            <div className={styles.filterContainer}>

                <input
                    type="text"
                    placeholder="Search supplier..."
                    className={styles.searchInput}
                    value={nombreProveedor}
                    onChange={handleSearch}
                />

                <select
                    className={styles.categorySelect}
                    value={nombreCategoria}
                    onChange={handleCategoryChange}
                >
                    <option value="">
                        All categories
                    </option>

                    <option value="Novelty Goods Supplier">
                        Novelty Goods Supplier
                    </option>

                    <option value="Clothing Supplier">
                        Clothing Supplier
                    </option>

                    <option value="Packaging Supplier">
                        Packaging Supplier
                    </option>

                    <option value="Toy Supplier">
                        Toy Supplier
                    </option>
                </select>

            </div>


            {/* =========================
                PROVEEDORES
            ========================= */}

            {loading ? (

                <div className={styles.loading}>
                    Loading suppliers...
                </div>

            ) : proveedores.length === 0 ? (

                <div className={styles.emptyMessage}>
                    No suppliers found.
                </div>

            ) : (

                <div className={styles.proveedoresCards}>

                   {proveedores.map((proveedor, index) => (
                        <div
                            key={index}
                            className={styles.proveedorCard}
                            onClick={() => handleProveedorClick(proveedor)}
                        >

                            <h3>
                                {proveedor.SupplierName}
                            </h3>

                            <p>
                                <span>Category</span>
                                {proveedor.SupplierCategoryName}
                            </p>

                            <p>
                                <span>Delivery method</span>
                                {proveedor.DeliveryMethodName}
                            </p>

                        </div>

                    ))}

                </div>

            )}
            {selectedProveedor && (
    <div
        className={styles.modalOverlay}
        onClick={closeProveedorDetails}
    >
        <div
            className={styles.proveedorDetails}
            onClick={(event) => event.stopPropagation()}
        >

            <button
                className={styles.closeButton}
                onClick={closeProveedorDetails}
            >
                ×
            </button>


            {loadingDetails ? (

                <p className={styles.loading}>
                    Loading supplier details...
                </p>

                ) : proveedorDetails ? (

                    <>
                        <h2>
                            {proveedorDetails.SupplierName}
                        </h2>


                        {/* =========================
                            INFORMACIÓN GENERAL
                        ========================= */}

                        <h4 className={styles.sectionTitle}>
                            General information
                        </h4>

                        <div className={styles.detailsContainer}>

                            <div className={styles.detailItem}>
                                <span>Supplier reference</span>

                                <strong>
                                    {proveedorDetails.SupplierReference}
                                </strong>
                            </div>


                            <div className={styles.detailItem}>
                                <span>Category</span>

                                <strong>
                                    {proveedorDetails.SupplierCategoryName}
                                </strong>
                            </div>


                            <div className={styles.detailItem}>
                                <span>Delivery method</span>

                                <strong>
                                    {proveedorDetails.DeliveryMethodName}
                                </strong>
                            </div>


                            <div className={styles.detailItem}>
                                <span>Payment days</span>

                                <strong>
                                    {proveedorDetails.PaymentDays} days
                                </strong>
                            </div>

                        </div>


                        {/* =========================
                            CONTACTO
                        ========================= */}

                        <h4 className={styles.sectionTitle}>
                            Contact
                        </h4>

                        <div className={styles.detailsContainer}>

                            <div className={styles.detailItem}>
                                <span>Phone</span>

                                <strong>
                                    {proveedorDetails.PhoneNumber}
                                </strong>
                            </div>


                            <div className={styles.detailItem}>
                                <span>Fax</span>

                                <strong>
                                    {proveedorDetails.FaxNumber}
                                </strong>
                            </div>


                            <div className={styles.detailItem}>
                                <span>City</span>

                                <strong>
                                    {proveedorDetails.CityName}
                                </strong>
                            </div>


                            <div className={styles.detailItem}>
                                <span>Website</span>

                                <a
                                    href={proveedorDetails.WebsiteURL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Visit website
                                </a>
                            </div>

                        </div>


                        {/* =========================
                            DIRECCIÓN DE ENTREGA
                        ========================= */}

                        <h4 className={styles.sectionTitle}>
                            Delivery address
                        </h4>

                        <div className={styles.addressCard}>

                            <p>
                                {proveedorDetails.DeliveryAddressLine1}
                            </p>

                            <p>
                                {proveedorDetails.DeliveryAddressLine2}
                            </p>

                            <p>
                                Postal code:{" "}
                                {proveedorDetails.DeliveryPostalCode}
                            </p>

                        </div>


                        {/* =========================
                            DIRECCIÓN POSTAL
                        ========================= */}

                        <h4 className={styles.sectionTitle}>
                            Postal address
                        </h4>

                        <div className={styles.addressCard}>

                            <p>
                                {proveedorDetails.PostalAddressLine1}
                            </p>

                            <p>
                                {proveedorDetails.PostalAddressLine2}
                            </p>

                        </div>


                        {/* =========================
                            INFORMACIÓN BANCARIA
                        ========================= */}

                        <h4 className={styles.sectionTitle}>
                            Bank information
                        </h4>

                        <div className={styles.bankCard}>

                            <p>
                                <strong>
                                    Account name:
                                </strong>{" "}
                                {proveedorDetails.BankAccountName}
                            </p>

                            <p>
                                <strong>
                                    Account number:
                                </strong>{" "}
                                {proveedorDetails.BankAccountNumber}
                            </p>

                        </div>


                        {/* =========================
                            UBICACIÓN
                        ========================= */}

                        <h4 className={styles.sectionTitle}>
                            Delivery location
                        </h4>

                        {proveedorDetails.DeliveryLocation?.points?.[0] ? (
                            <>
                                <div className={styles.mapContainer}>
                                    <iframe
                                        title={`Delivery location of ${proveedorDetails.SupplierName}`}
                                        src={`https://www.google.com/maps?q=${proveedorDetails.DeliveryLocation.points[0].lat},${proveedorDetails.DeliveryLocation.points[0].lng}&output=embed`}
                                        loading="lazy"
                                    />
                                </div>

                                <a
                                    className={styles.mapButton}
                                    href={`https://www.google.com/maps?q=${proveedorDetails.DeliveryLocation.points[0].lat},${proveedorDetails.DeliveryLocation.points[0].lng}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Open in Google Maps
                                </a>
                            </>
                        ) : (
                            <p className={styles.noLocation}>
                                Delivery location not available.
                            </p>
                        )}
                    </>

                ) : (

                    <p>
                        Unable to load supplier details.
                    </p>

                )}

            </div>
        </div>
    )}

        </section>
    );
}