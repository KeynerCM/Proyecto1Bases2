import { useEffect, useState, type FormEvent } from "react";
import styles from "./crudModal.module.css";
import { CrudModal } from "./CrudModal";
import { CatalogSelect, CheckboxField, FormActions, TextField } from "./formFields";
import { buildPayload, emptyValues, missingRequired, recordToValues, useFormValues } from "./formUtils";
import { apiRequest, errorMessage } from "./apiClient";
import type { FormMode } from "./types";

const KEYS = [
    "StockItemName", "SupplierID", "StockGroupIDs", "ColorID", "Brand", "Size", "Barcode",
    "UnitPackageID", "OuterPackageID", "QuantityPerOuter", "LeadTimeDays", "IsChillerStock",
    "TypicalWeightPerUnit", "UnitPrice", "RecommendedRetailPrice", "TaxRate",
    "QuantityOnHand", "BinLocation", "LastCostPrice", "ReorderLevel", "TargetStockLevel",
    "MarketingComments", "InternalComments",
];

const BOOLEAN_KEYS = ["IsChillerStock"];

const NUMBER_KEYS = [
    "SupplierID", "ColorID", "UnitPackageID", "OuterPackageID", "QuantityPerOuter",
    "LeadTimeDays", "TypicalWeightPerUnit", "UnitPrice", "RecommendedRetailPrice", "TaxRate",
    "QuantityOnHand", "LastCostPrice", "ReorderLevel", "TargetStockLevel",
];

const REQUIRED: Record<string, string> = {
    StockItemName: "Nombre",
    SupplierID: "Proveedor",
    StockGroupIDs: "Grupos",
    UnitPackageID: "Empaque unitario",
    OuterPackageID: "Empaque externo",
    QuantityPerOuter: "Cantidad por empaque",
    LeadTimeDays: "Días de entrega",
    TypicalWeightPerUnit: "Peso por unidad",
    UnitPrice: "Precio unitario",
    TaxRate: "Impuesto",
};

type StockGroup = {
    StockGroupID: number;
    StockGroupName: string;
};

type StockItemFormModalProps = {
    mode: FormMode;
    stockItemId?: number;     // obligatorio en modo "update"
    stockItemName?: string;
    onClose: () => void;
    onSaved: (message: string) => void;
};

export function StockItemFormModal({ mode, stockItemId, stockItemName, onClose, onSaved }: StockItemFormModalProps) {
    const { values, setValues, set, text, checked } = useFormValues(emptyValues(KEYS, BOOLEAN_KEYS));
    const [stockGroups, setStockGroups] = useState<StockGroup[]>([]);
    const [loading, setLoading] = useState(mode === "update");
    const [loadError, setLoadError] = useState("");
    const [formError, setFormError] = useState("");
    const [saving, setSaving] = useState(false);

    const isCreate = mode === "create";

    // Grupos de inventario para los checkboxes (endpoint que ya existía)
    useEffect(() => {
        apiRequest<StockGroup[]>("/inventory/groups")
            .then(setStockGroups)
            .catch((error) => console.error(error));
    }, []);

    // En modo actualizar se cargan los datos actuales del producto
    useEffect(() => {
        if (mode !== "update" || stockItemId == null) return;

        let ignore = false;

        const loadItem = async () => {
            try {
                const data = await apiRequest<Record<string, unknown>[]>(`/inventory/specific?id=${stockItemId}`);
                const record = data[0];

                if (!record) throw new Error("No se encontró el producto.");
                if (record.UnitPackageID === undefined) {
                    throw new Error("El detalle no trae los IDs de edición. Ejecuta los scripts SQL actualizados.");
                }

                if (!ignore) setValues(recordToValues(record, KEYS, BOOLEAN_KEYS));
            } catch (error) {
                if (!ignore) setLoadError(errorMessage(error));
            } finally {
                if (!ignore) setLoading(false);
            }
        };

        loadItem();

        return () => {
            ignore = true;
        };
    }, [mode, stockItemId, setValues]);

    const selectedGroups = text("StockGroupIDs").split(",").filter(Boolean);

    const toggleGroup = (groupId: string) => {
        const next = selectedGroups.includes(groupId)
            ? selectedGroups.filter((id) => id !== groupId)
            : [...selectedGroups, groupId];

        set("StockGroupIDs")(next.join(","));
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();

        if (isCreate) {
            const missing = missingRequired(values, REQUIRED);
            if (missing.length > 0) {
                setFormError(`Completa los campos obligatorios: ${missing.join(", ")}.`);
                return;
            }
        } else if (selectedGroups.length === 0) {
            setFormError("El producto debe pertenecer al menos a un grupo.");
            return;
        }

        try {
            setSaving(true);
            setFormError("");

            const payload = buildPayload(values, NUMBER_KEYS);

            if (isCreate) {
                await apiRequest("/inventory", { method: "POST", body: payload });
                onSaved("Producto creado correctamente.");
            } else {
                await apiRequest(`/inventory/${stockItemId}`, { method: "PUT", body: payload });
                onSaved("Producto actualizado correctamente.");
            }
        } catch (error) {
            setFormError(errorMessage(error, "No se pudo guardar el producto."));
            setSaving(false);
        }
    };

    return (
        <CrudModal
            title={isCreate ? "Nuevo producto" : `Actualizar ${stockItemName ?? "producto"}`}
            subtitle={isCreate
                ? "Los campos con * son obligatorios."
                : "Los campos que dejes vacíos conservan su valor actual."}
            onClose={onClose}
        >
            {loading ? (
                <p className={styles.loading}>Cargando datos del producto...</p>
            ) : loadError ? (
                <p className={styles.errorBox}>{loadError}</p>
            ) : (
                <form onSubmit={handleSubmit}>
                    <h4 className={styles.sectionTitle}>Información general</h4>

                    <div className={styles.formGrid}>
                        <TextField label="Nombre" required={isCreate} full maxLength={100}
                            value={text("StockItemName")} onChange={set("StockItemName")} />

                        <CatalogSelect label="Proveedor" required={isCreate} catalog="suppliers"
                            value={text("SupplierID")} onChange={set("SupplierID")} />

                        <CatalogSelect label="Color" catalog="colors" emptyLabel="Sin color"
                            value={text("ColorID")} onChange={set("ColorID")} />

                        <TextField label="Marca" maxLength={50}
                            value={text("Brand")} onChange={set("Brand")} />

                        <TextField label="Tamaño" maxLength={20}
                            value={text("Size")} onChange={set("Size")} />

                        <TextField label="Código de barras" maxLength={50}
                            value={text("Barcode")} onChange={set("Barcode")} />
                    </div>

                    <h4 className={styles.sectionTitle}>
                        Grupos{isCreate && <span className={styles.requiredMark}> *</span>}
                    </h4>

                    <div className={styles.formGrid}>
                        <div className={styles.checkboxGroup}>
                            {stockGroups.map((group) => (
                                <CheckboxField
                                    key={group.StockGroupID}
                                    label={group.StockGroupName}
                                    checked={selectedGroups.includes(String(group.StockGroupID))}
                                    onChange={() => toggleGroup(String(group.StockGroupID))}
                                />
                            ))}
                        </div>
                    </div>

                    <h4 className={styles.sectionTitle}>Empaque y logística</h4>

                    <div className={styles.formGrid}>
                        <CatalogSelect label="Empaque unitario" required={isCreate} catalog="packageTypes"
                            value={text("UnitPackageID")} onChange={set("UnitPackageID")} />

                        <CatalogSelect label="Empaque externo" required={isCreate} catalog="packageTypes"
                            value={text("OuterPackageID")} onChange={set("OuterPackageID")} />

                        <TextField label="Cantidad por empaque" required={isCreate} type="number" min={1} step="1"
                            value={text("QuantityPerOuter")} onChange={set("QuantityPerOuter")} />

                        <TextField label="Días de entrega" required={isCreate} type="number" min={0} step="1"
                            value={text("LeadTimeDays")} onChange={set("LeadTimeDays")} />

                        <TextField label="Peso por unidad (kg)" required={isCreate} type="number" min={0} step="0.001"
                            value={text("TypicalWeightPerUnit")} onChange={set("TypicalWeightPerUnit")} />

                        <CheckboxField label="Requiere refrigeración"
                            checked={checked("IsChillerStock")} onChange={set("IsChillerStock")} />
                    </div>

                    <h4 className={styles.sectionTitle}>Precios</h4>

                    <div className={styles.formGrid}>
                        <TextField label="Precio unitario" required={isCreate} type="number" min={0} step="0.01"
                            value={text("UnitPrice")} onChange={set("UnitPrice")} />

                        <TextField label="Precio de venta sugerido" type="number" min={0} step="0.01"
                            value={text("RecommendedRetailPrice")} onChange={set("RecommendedRetailPrice")} />

                        <TextField label="Impuesto (%)" required={isCreate} type="number" min={0} step="0.001"
                            value={text("TaxRate")} onChange={set("TaxRate")} />

                        <TextField label="Último costo" type="number" min={0} step="0.01"
                            hint={isCreate ? "Si lo dejas vacío se usa el precio unitario." : undefined}
                            value={text("LastCostPrice")} onChange={set("LastCostPrice")} />
                    </div>

                    <h4 className={styles.sectionTitle}>Existencias</h4>

                    <div className={styles.formGrid}>
                        <TextField label="Cantidad disponible" type="number" min={0} step="1"
                            value={text("QuantityOnHand")} onChange={set("QuantityOnHand")} />

                        <TextField label="Ubicación en bodega" maxLength={20} placeholder="L-1"
                            value={text("BinLocation")} onChange={set("BinLocation")} />

                        <TextField label="Nivel de reorden" type="number" min={0} step="1"
                            value={text("ReorderLevel")} onChange={set("ReorderLevel")} />

                        <TextField label="Nivel objetivo" type="number" min={0} step="1"
                            value={text("TargetStockLevel")} onChange={set("TargetStockLevel")} />
                    </div>

                    <h4 className={styles.sectionTitle}>Comentarios</h4>

                    <div className={styles.formGrid}>
                        <TextField label="Comentarios de marketing" full multiline
                            value={text("MarketingComments")} onChange={set("MarketingComments")} />

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
