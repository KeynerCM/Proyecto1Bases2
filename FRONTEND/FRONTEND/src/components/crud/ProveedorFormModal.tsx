import { useEffect, useState, type FormEvent } from "react";
import styles from "./crudModal.module.css";
import { CrudModal } from "./CrudModal";
import { CatalogSearch, CatalogSelect, FormActions, TextField } from "./formFields";
import { buildPayload, emptyValues, missingRequired, recordToValues, useFormValues } from "./formUtils";
import { apiRequest, clearCatalogCache, errorMessage } from "./apiClient";
import type { FormMode } from "./types";

const KEYS = [
    "SupplierName", "SupplierCategoryID", "DeliveryMethodID", "PaymentDays", "SupplierReference",
    "PrimaryContactPersonID", "AlternateContactPersonID", "PhoneNumber", "FaxNumber", "WebsiteURL",
    "DeliveryCityID", "DeliveryAddressLine1", "DeliveryAddressLine2", "DeliveryPostalCode",
    "PostalCityID", "PostalAddressLine1", "PostalAddressLine2", "PostalPostalCode",
    "BankAccountName", "BankAccountBranch", "BankAccountCode", "BankAccountNumber", "BankInternationalCode",
    "InternalComments",
];

const NUMBER_KEYS = [
    "SupplierCategoryID", "DeliveryMethodID", "PaymentDays",
    "PrimaryContactPersonID", "AlternateContactPersonID", "DeliveryCityID", "PostalCityID",
];

const REQUIRED: Record<string, string> = {
    SupplierName: "Nombre",
    SupplierCategoryID: "Categoría",
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

type ProveedorFormModalProps = {
    mode: FormMode;
    supplierName?: string;   // obligatorio en modo "update"
    onClose: () => void;
    onSaved: (message: string) => void;
};

export function ProveedorFormModal({ mode, supplierName, onClose, onSaved }: ProveedorFormModalProps) {
    const { values, setValues, set, text } = useFormValues(emptyValues(KEYS));
    const [supplierId, setSupplierId] = useState<number | null>(null);
    const [loading, setLoading] = useState(mode === "update");
    const [loadError, setLoadError] = useState("");
    const [formError, setFormError] = useState("");
    const [saving, setSaving] = useState(false);

    const isCreate = mode === "create";

    // En modo actualizar se cargan los datos actuales del proveedor
    useEffect(() => {
        if (mode !== "update" || !supplierName) return;

        let ignore = false;

        const loadSupplier = async () => {
            try {
                const data = await apiRequest<Record<string, unknown>[]>(
                    `/proveedores/specific?name=${encodeURIComponent(supplierName)}`
                );
                const record = data[0];

                if (!record) throw new Error("No se encontró el proveedor.");
                if (record.SupplierID == null) {
                    throw new Error("El detalle no trae SupplierID. Ejecuta los scripts SQL actualizados.");
                }

                if (!ignore) {
                    setSupplierId(Number(record.SupplierID));
                    setValues(recordToValues(record, KEYS));
                }
            } catch (error) {
                if (!ignore) setLoadError(errorMessage(error));
            } finally {
                if (!ignore) setLoading(false);
            }
        };

        loadSupplier();

        return () => {
            ignore = true;
        };
    }, [mode, supplierName, setValues]);

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
                await apiRequest("/proveedores", { method: "POST", body: payload });
            } else {
                await apiRequest(`/proveedores/${supplierId}`, { method: "PUT", body: payload });
            }

            // El combo de proveedores del formulario de inventario debe recargarse
            clearCatalogCache("suppliers");
            onSaved(isCreate ? "Proveedor creado correctamente." : "Proveedor actualizado correctamente.");
        } catch (error) {
            setFormError(errorMessage(error, "No se pudo guardar el proveedor."));
            setSaving(false);
        }
    };

    return (
        <CrudModal
            title={isCreate ? "Nuevo proveedor" : `Actualizar ${supplierName ?? "proveedor"}`}
            subtitle={isCreate
                ? "Los campos con * son obligatorios."
                : "Los campos que dejes vacíos conservan su valor actual."}
            onClose={onClose}
        >
            {loading ? (
                <p className={styles.loading}>Cargando datos del proveedor...</p>
            ) : loadError ? (
                <p className={styles.errorBox}>{loadError}</p>
            ) : (
                <form onSubmit={handleSubmit}>
                    <h4 className={styles.sectionTitle}>Información general</h4>

                    <div className={styles.formGrid}>
                        <TextField label="Nombre" required={isCreate} full maxLength={100}
                            value={text("SupplierName")} onChange={set("SupplierName")} />

                        <CatalogSelect label="Categoría" required={isCreate} catalog="supplierCategories"
                            value={text("SupplierCategoryID")} onChange={set("SupplierCategoryID")} />

                        <CatalogSelect label="Método de entrega" catalog="deliveryMethods" emptyLabel="Ninguno"
                            value={text("DeliveryMethodID")} onChange={set("DeliveryMethodID")} />

                        <TextField label="Días de pago" required={isCreate} type="number" min={0} step="1"
                            value={text("PaymentDays")} onChange={set("PaymentDays")} />

                        <TextField label="Referencia del proveedor" maxLength={20}
                            value={text("SupplierReference")} onChange={set("SupplierReference")} />
                    </div>

                    <h4 className={styles.sectionTitle}>Contacto</h4>

                    <div className={styles.formGrid}>
                        <CatalogSearch label="Contacto principal" required={isCreate} catalog="people"
                            placeholder="Buscar persona..."
                            value={text("PrimaryContactPersonID")} onChange={set("PrimaryContactPersonID")} />

                        <CatalogSearch label="Contacto alterno" catalog="people"
                            placeholder="Buscar persona..."
                            hint={isCreate ? "Si lo dejas vacío se usa el contacto principal." : undefined}
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

                    <h4 className={styles.sectionTitle}>Información bancaria</h4>

                    <div className={styles.formGrid}>
                        <TextField label="Nombre de la cuenta" maxLength={50}
                            value={text("BankAccountName")} onChange={set("BankAccountName")} />

                        <TextField label="Sucursal" maxLength={50}
                            value={text("BankAccountBranch")} onChange={set("BankAccountBranch")} />

                        <TextField label="Código bancario" maxLength={20}
                            value={text("BankAccountCode")} onChange={set("BankAccountCode")} />

                        <TextField label="Número de cuenta" maxLength={20}
                            value={text("BankAccountNumber")} onChange={set("BankAccountNumber")} />

                        <TextField label="Código internacional (SWIFT)" maxLength={20}
                            value={text("BankInternationalCode")} onChange={set("BankInternationalCode")} />
                    </div>

                    <h4 className={styles.sectionTitle}>Comentarios</h4>

                    <div className={styles.formGrid}>
                        <TextField label="Comentarios internos" full multiline
                            value={text("InternalComments")} onChange={set("InternalComments")} />
                    </div>

                    {formError && <p className={styles.errorBox}>{formError}</p>}

                    <FormActions mode={mode} saving={saving} onCancel={onClose} />
                </form>
            )}
        </CrudModal>
    );
}
