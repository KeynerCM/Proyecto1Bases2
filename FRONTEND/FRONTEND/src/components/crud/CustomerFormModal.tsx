import { useEffect, useState, type FormEvent } from "react";
import styles from "./crudModal.module.css";
import { CrudModal } from "./CrudModal";
import { CatalogSearch, CatalogSelect, CheckboxField, FormActions, TextField } from "./formFields";
import { buildPayload, emptyValues, missingRequired, recordToValues, useFormValues } from "./formUtils";
import { apiRequest, errorMessage } from "./apiClient";
import type { FormMode } from "./types";

const KEYS = [
    "CustomerName", "CustomerCategoryID", "BuyingGroupID", "DeliveryMethodID",
    "PaymentDays", "CreditLimit", "StandardDiscountPercentage",
    "IsStatementSent", "IsOnCreditHold",
    "PrimaryContactPersonID", "AlternateContactPersonID",
    "PhoneNumber", "FaxNumber", "WebsiteURL",
    "DeliveryCityID", "DeliveryAddressLine1", "DeliveryAddressLine2", "DeliveryPostalCode",
    "PostalCityID", "PostalAddressLine1", "PostalAddressLine2", "PostalPostalCode",
];

const BOOLEAN_KEYS = ["IsStatementSent", "IsOnCreditHold"];

const NUMBER_KEYS = [
    "CustomerCategoryID", "BuyingGroupID", "DeliveryMethodID", "PaymentDays",
    "CreditLimit", "StandardDiscountPercentage",
    "PrimaryContactPersonID", "AlternateContactPersonID", "DeliveryCityID", "PostalCityID",
];

const REQUIRED: Record<string, string> = {
    CustomerName: "Nombre",
    CustomerCategoryID: "Categoría",
    DeliveryMethodID: "Método de entrega",
    PaymentDays: "Días de pago",
    PrimaryContactPersonID: "Contacto principal",
    PhoneNumber: "Teléfono",
    FaxNumber: "Fax",
    WebsiteURL: "Sitio web",
    DeliveryCityID: "Ciudad de entrega",
    DeliveryAddressLine1: "Dirección de entrega",
    DeliveryPostalCode: "Código postal de entrega",
    PostalAddressLine1: "Dirección postal",
    PostalPostalCode: "Código postal",
};

type CustomerFormModalProps = {
    mode: FormMode;
    customerName?: string;   // obligatorio en modo "update"
    onClose: () => void;
    onSaved: (message: string) => void;
};

export function CustomerFormModal({ mode, customerName, onClose, onSaved }: CustomerFormModalProps) {
    const { values, setValues, set, text, checked } = useFormValues(emptyValues(KEYS, BOOLEAN_KEYS));
    const [customerId, setCustomerId] = useState<number | null>(null);
    const [loading, setLoading] = useState(mode === "update");
    const [loadError, setLoadError] = useState("");
    const [formError, setFormError] = useState("");
    const [saving, setSaving] = useState(false);

    const isCreate = mode === "create";

    // En modo actualizar se cargan los datos actuales del cliente
    useEffect(() => {
        if (mode !== "update" || !customerName) return;

        let ignore = false;

        const loadCustomer = async () => {
            try {
                const data = await apiRequest<Record<string, unknown>[]>(
                    `/customers/specific?name=${encodeURIComponent(customerName)}`
                );
                const record = data[0];

                if (!record) throw new Error("No se encontró el cliente.");
                if (record.CustomerID == null) {
                    throw new Error("El detalle no trae CustomerID. Ejecuta los scripts SQL actualizados.");
                }

                if (!ignore) {
                    setCustomerId(Number(record.CustomerID));
                    setValues(recordToValues(record, KEYS, BOOLEAN_KEYS));
                }
            } catch (error) {
                if (!ignore) setLoadError(errorMessage(error));
            } finally {
                if (!ignore) setLoading(false);
            }
        };

        loadCustomer();

        return () => {
            ignore = true;
        };
    }, [mode, customerName, setValues]);

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();

        if (isCreate) {
            const missing = missingRequired(values, REQUIRED);
            if (missing.length > 0) {
                setFormError(`Completa los campos obligatorios: ${missing.join(", ")}.`);
                return;
            }
        }

        try {
            setSaving(true);
            setFormError("");

            const payload = buildPayload(values, NUMBER_KEYS);

            if (isCreate) {
                await apiRequest("/customers", { method: "POST", body: payload });
                onSaved("Cliente creado correctamente.");
            } else {
                await apiRequest(`/customers/${customerId}`, { method: "PUT", body: payload });
                onSaved("Cliente actualizado correctamente.");
            }
        } catch (error) {
            setFormError(errorMessage(error, "No se pudo guardar el cliente."));
            setSaving(false);
        }
    };

    return (
        <CrudModal
            title={isCreate ? "Nuevo cliente" : `Actualizar ${customerName ?? "cliente"}`}
            subtitle={isCreate
                ? "Los campos con * son obligatorios."
                : "Los campos que dejes vacíos conservan su valor actual."}
            onClose={onClose}
        >
            {loading ? (
                <p className={styles.loading}>Cargando datos del cliente...</p>
            ) : loadError ? (
                <p className={styles.errorBox}>{loadError}</p>
            ) : (
                <form onSubmit={handleSubmit}>
                    <h4 className={styles.sectionTitle}>Información general</h4>

                    <div className={styles.formGrid}>
                        <TextField label="Nombre" required={isCreate} full maxLength={100}
                            value={text("CustomerName")} onChange={set("CustomerName")} />

                        <CatalogSelect label="Categoría" required={isCreate} catalog="customerCategories"
                            value={text("CustomerCategoryID")} onChange={set("CustomerCategoryID")} />

                        <CatalogSelect label="Grupo de compra" catalog="buyingGroups" emptyLabel="Ninguno"
                            value={text("BuyingGroupID")} onChange={set("BuyingGroupID")} />

                        <CatalogSelect label="Método de entrega" required={isCreate} catalog="deliveryMethods"
                            value={text("DeliveryMethodID")} onChange={set("DeliveryMethodID")} />

                        <TextField label="Días de pago" required={isCreate} type="number" min={0} step="1"
                            value={text("PaymentDays")} onChange={set("PaymentDays")} />

                        <TextField label="Límite de crédito" type="number" min={0} step="0.01"
                            value={text("CreditLimit")} onChange={set("CreditLimit")} />

                        <TextField label="Descuento estándar (%)" type="number" min={0} step="0.001"
                            value={text("StandardDiscountPercentage")} onChange={set("StandardDiscountPercentage")} />

                        <CheckboxField label="Estado de cuenta enviado"
                            checked={checked("IsStatementSent")} onChange={set("IsStatementSent")} />

                        <CheckboxField label="Crédito retenido"
                            checked={checked("IsOnCreditHold")} onChange={set("IsOnCreditHold")} />
                    </div>

                    <h4 className={styles.sectionTitle}>Contacto</h4>

                    <div className={styles.formGrid}>
                        <CatalogSearch label="Contacto principal" required={isCreate} catalog="people"
                            placeholder="Buscar persona..."
                            value={text("PrimaryContactPersonID")} onChange={set("PrimaryContactPersonID")} />

                        <CatalogSearch label="Contacto alterno" catalog="people"
                            placeholder="Buscar persona..."
                            value={text("AlternateContactPersonID")} onChange={set("AlternateContactPersonID")} />

                        <TextField label="Teléfono" required={isCreate} maxLength={20}
                            value={text("PhoneNumber")} onChange={set("PhoneNumber")} />

                        <TextField label="Fax" required={isCreate} maxLength={20}
                            value={text("FaxNumber")} onChange={set("FaxNumber")} />

                        <TextField label="Sitio web" required={isCreate} full maxLength={256}
                            placeholder="http://www.ejemplo.com"
                            value={text("WebsiteURL")} onChange={set("WebsiteURL")} />
                    </div>

                    <h4 className={styles.sectionTitle}>Dirección de entrega</h4>

                    <div className={styles.formGrid}>
                        <CatalogSearch label="Ciudad" required={isCreate} catalog="cities" full
                            placeholder="Buscar ciudad..."
                            value={text("DeliveryCityID")} onChange={set("DeliveryCityID")} />

                        <TextField label="Dirección (línea 1)" required={isCreate} full maxLength={60}
                            value={text("DeliveryAddressLine1")} onChange={set("DeliveryAddressLine1")} />

                        <TextField label="Dirección (línea 2)" maxLength={60}
                            value={text("DeliveryAddressLine2")} onChange={set("DeliveryAddressLine2")} />

                        <TextField label="Código postal" required={isCreate} maxLength={10}
                            value={text("DeliveryPostalCode")} onChange={set("DeliveryPostalCode")} />
                    </div>

                    <h4 className={styles.sectionTitle}>Dirección postal</h4>

                    <div className={styles.formGrid}>
                        <CatalogSearch label="Ciudad" catalog="cities" full
                            placeholder="Buscar ciudad..."
                            hint={isCreate ? "Si la dejas vacía se usa la ciudad de entrega." : undefined}
                            value={text("PostalCityID")} onChange={set("PostalCityID")} />

                        <TextField label="Dirección (línea 1)" required={isCreate} full maxLength={60}
                            value={text("PostalAddressLine1")} onChange={set("PostalAddressLine1")} />

                        <TextField label="Dirección (línea 2)" maxLength={60}
                            value={text("PostalAddressLine2")} onChange={set("PostalAddressLine2")} />

                        <TextField label="Código postal" required={isCreate} maxLength={10}
                            value={text("PostalPostalCode")} onChange={set("PostalPostalCode")} />
                    </div>

                    {formError && <p className={styles.errorBox}>{formError}</p>}

                    <FormActions mode={mode} saving={saving} onCancel={onClose} />
                </form>
            )}
        </CrudModal>
    );
}
