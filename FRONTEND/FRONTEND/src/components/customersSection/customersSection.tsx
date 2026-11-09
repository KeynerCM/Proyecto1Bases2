import { useEffect, useState, type ChangeEvent } from "react";
import styles from "./customersSection.module.css";
import { CustomerDetails } from "../customerDetails/customerDetails";
import { CustomerFormModal } from "../crud/CustomerFormModal";
import { ConfirmDeleteModal } from "../crud/ConfirmDeleteModal";
import { useCrudActions } from "../crud/useCrudActions";
import { SelectionBanner, SuccessNotice } from "../crud/CrudNotices";
import { apiRequest } from "../crud/apiClient";

type Customer = {
    CustomerID: number;
    CUSTOMERNAME: string;
    CustomerCategoryName: string;
    DeliveryMethodName: string;
};

export function CustomersSection() {
    const [currentPage, setCurrentPage] = useState(1);
    const [nameFilter, setNameFilter] = useState("");
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

    const crud = useCrudActions<Customer>();

    useEffect(() => {
        const getCustomers = async () => {
            try {
                const data = await apiRequest<Customer[]>(
                    `/customers?pageNumber=${currentPage}&name=${encodeURIComponent(nameFilter)}`
                );

                setCustomers(data);

            } catch (error) {
                console.error("Error al obtener los clientes:", error);
            }
        };

        getCustomers();

    }, [currentPage, nameFilter, crud.refreshKey]);


    const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
        setNameFilter(event.target.value);
        setCurrentPage(1);
    };

    const handleCustomerClick = (customer: Customer) => {
        crud.handleCardClick(customer, setSelectedCustomer);
    };

    const closeCustomerDetails = () => {
        setSelectedCustomer(null);
    };

    const deleteCustomer = async () => {
        if (!crud.deleting?.CustomerID) {
            throw new Error("El listado no trae CustomerID. Ejecuta los scripts SQL actualizados.");
        }

        await apiRequest(`/customers/${crud.deleting.CustomerID}`, { method: "DELETE" });
    };

    return (
        <section className={styles.customersSection}>
            <div className={styles.actionsBar}>
                <button
                    className={styles.botonInsertarCliente}
                    onClick={crud.startCreate}
                >
                    Insertar Cliente
                </button>

                <button
                    className={`${styles.botonActualizarCliente} ${crud.activeClass("update")}`}
                    onClick={() => crud.toggleMode("update")}
                >
                    Actualizar Cliente
                </button>

                <button
                    className={`${styles.botonEliminarCliente} ${crud.activeClass("delete")}`}
                    onClick={() => crud.toggleMode("delete")}
                >
                    Eliminar Cliente
                </button>
            </div>

            <SuccessNotice message={crud.notice} />

            <SelectionBanner
                mode={crud.actionMode}
                entity="un cliente"
                pronoun="lo"
                onCancel={() => crud.setActionMode("view")}
            />

            <div className={styles.filterContainer}>
                <input
                    type="text"
                    placeholder="Search..."
                    className={styles.searchInput}
                    value={nameFilter}
                    onChange={handleSearch}
                />
            </div>

            <div className={`${styles.customersCards} ${crud.cardsClassName}`}>

                {customers.map((customer, index) => (
                    <div
                        key={customer.CustomerID ?? index}
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
                <CustomerDetails
                    customerName={selectedCustomer.CUSTOMERNAME}
                    onClose={closeCustomerDetails}
                />
            )}


            {/* =========================
                INSERTAR / ACTUALIZAR / ELIMINAR
            ========================= */}

            {crud.creating && (
                <CustomerFormModal
                    mode="create"
                    onClose={() => crud.setCreating(false)}
                    onSaved={crud.finish}
                />
            )}

            {crud.editing && (
                <CustomerFormModal
                    mode="update"
                    customerName={crud.editing.CUSTOMERNAME}
                    onClose={() => crud.setEditing(null)}
                    onSaved={crud.finish}
                />
            )}

            {crud.deleting && (
                <ConfirmDeleteModal
                    title="Eliminar cliente"
                    itemName={crud.deleting.CUSTOMERNAME}
                    warning="Solo se pueden eliminar clientes sin facturas, pedidos ni transacciones."
                    onConfirm={deleteCustomer}
                    onDeleted={() => crud.finish("Cliente eliminado correctamente.")}
                    onClose={() => crud.setDeleting(null)}
                />
            )}

        </section>
    );
}
