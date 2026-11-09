import { useEffect, useState, type FormEvent } from "react";
import styles from "./crudModal.module.css";
import { CrudModal } from "./CrudModal";
import { CatalogSearch, CatalogSelect, FormActions, TextField } from "./formFields";
import { buildPayload, emptyValues, recordToValues, useFormValues } from "./formUtils";
import { apiRequest, errorMessage } from "./apiClient";
import type { CatalogItem, FormMode } from "./types";

const KEYS = [
    "CustomerID", "SalespersonPersonID", "PackedByPersonID", "DeliveryMethodID",
    "InvoiceDate", "CustomerPurchaseOrderNumber", "DeliveryInstructions", "Comments",
];

const NUMBER_KEYS = ["CustomerID", "SalespersonPersonID", "PackedByPersonID", "DeliveryMethodID"];

type LineForm = {
    key: number;
    StockItemID: string;
    StockItemName: string;
    Quantity: string;
    UnitPrice: string;      // vacío = precio del producto
    listPrice: number | null;
    taxRate: number | null;
};

// Identificador único para cada fila de líneas (solo se usa como key de React)
let lineKeyCounter = 0;
const nextLineKey = () => ++lineKeyCounter;

const newLine = (): LineForm => ({
    key: nextLineKey(),
    StockItemID: "", StockItemName: "", Quantity: "1", UnitPrice: "",
    listPrice: null, taxRate: null,
});

type InvoiceDetailsResponse = {
    header: Record<string, unknown> | null;
    lines: {
        StockItemID: number;
        StockItemName: string;
        Quantity: number;
        UnitPrice: number;
        TaxRate: number;
    }[];
};

type InvoiceFormModalProps = {
    mode: FormMode;
    invoiceId?: number;     // obligatorio en modo "update"
    onClose: () => void;
    onSaved: (message: string) => void;
};

export function InvoiceFormModal({ mode, invoiceId, onClose, onSaved }: InvoiceFormModalProps) {
    const { values, setValues, set, text } = useFormValues(emptyValues(KEYS));
    const [lines, setLines] = useState<LineForm[]>(() => [newLine()]);
    const [linesChanged, setLinesChanged] = useState(false);
    const [customerName, setCustomerName] = useState("");
    const [loading, setLoading] = useState(mode === "update");
    const [loadError, setLoadError] = useState("");
    const [formError, setFormError] = useState("");
    const [saving, setSaving] = useState(false);

    const isCreate = mode === "create";

    // En modo actualizar se cargan el encabezado y las líneas actuales
    useEffect(() => {
        if (mode !== "update" || invoiceId == null) return;

        let ignore = false;

        const loadInvoice = async () => {
            try {
                const data = await apiRequest<InvoiceDetailsResponse>(`/sales/specific?id=${invoiceId}`);

                if (!data.header) throw new Error("No se encontró la factura.");
                if (data.header.SalespersonPersonID === undefined) {
                    throw new Error("El detalle no trae los IDs de edición. Ejecuta los scripts SQL actualizados.");
                }

                if (ignore) return;

                setValues(recordToValues(data.header, KEYS));
                setCustomerName(String(data.header.CustomerName ?? ""));
                setLines(data.lines.map((line) => ({
                    key: nextLineKey(),
                    StockItemID: String(line.StockItemID),
                    StockItemName: line.StockItemName,
                    Quantity: String(line.Quantity),
                    UnitPrice: String(line.UnitPrice),
                    listPrice: line.UnitPrice,
                    taxRate: line.TaxRate,
                })));
            } catch (error) {
                if (!ignore) setLoadError(errorMessage(error));
            } finally {
                if (!ignore) setLoading(false);
            }
        };

        loadInvoice();

        return () => {
            ignore = true;
        };
    }, [mode, invoiceId, setValues]);


    // =========================
    // LÍNEAS
    // =========================

    const updateLine = (key: number, changes: Partial<LineForm>) => {
        setLines((current) => current.map((line) => (line.key === key ? { ...line, ...changes } : line)));
        setLinesChanged(true);
    };

    const addLine = () => {
        setLines((current) => [...current, newLine()]);
        setLinesChanged(true);
    };

    const removeLine = (key: number) => {
        setLines((current) => current.filter((line) => line.key !== key));
        setLinesChanged(true);
    };

    const selectProduct = (key: number, id: string, item?: CatalogItem) => {
        updateLine(key, {
            StockItemID: id,
            StockItemName: item?.name ?? "",
            listPrice: item?.UnitPrice ?? null,
            taxRate: item?.TaxRate ?? null,
        });
    };

    // Total aproximado (el cálculo real lo hace el procedimiento almacenado)
    const estimatedTotal = lines.reduce((total, line) => {
        const quantity = Number(line.Quantity);
        const price = line.UnitPrice.trim() !== "" ? Number(line.UnitPrice) : line.listPrice;
        if (!line.StockItemID || !quantity || price == null || line.taxRate == null) return total;
        return total + quantity * price * (1 + line.taxRate / 100);
    }, 0);


    // =========================
    // GUARDAR
    // =========================

    const validate = (): string => {
        if (isCreate && !text("CustomerID")) return "Selecciona un cliente.";
        if (isCreate && !text("SalespersonPersonID")) return "Selecciona un vendedor.";

        if (isCreate || linesChanged) {
            if (lines.length === 0) return "La factura debe tener al menos una línea.";

            const invalid = lines.find((line) => {
                const quantity = Number(line.Quantity);
                return !line.StockItemID || !Number.isInteger(quantity) || quantity <= 0;
            });

            if (invalid) return "Cada línea necesita un producto y una cantidad entera mayor que 0.";
        }

        return "";
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();

        const validationError = validate();
        if (validationError) {
            setFormError(validationError);
            return;
        }

        try {
            setSaving(true);
            setFormError("");

            const payload = buildPayload(values, NUMBER_KEYS);

            const linesPayload = lines.map((line) => ({
                StockItemID: Number(line.StockItemID),
                Quantity: Number(line.Quantity),
                ...(line.UnitPrice.trim() !== "" ? { UnitPrice: Number(line.UnitPrice) } : {}),
            }));

            if (isCreate) {
                await apiRequest("/sales", {
                    method: "POST",
                    body: { ...payload, Lines: linesPayload },
                });
                onSaved("Venta creada correctamente.");
            } else {
                // El cliente de una factura no se puede cambiar
                delete payload.CustomerID;

                await apiRequest(`/sales/${invoiceId}`, {
                    method: "PUT",
                    body: linesChanged ? { ...payload, Lines: linesPayload } : payload,
                });
                onSaved("Venta actualizada correctamente.");
            }
        } catch (error) {
            setFormError(errorMessage(error, "No se pudo guardar la venta."));
            setSaving(false);
        }
    };

    return (
        <CrudModal
            title={isCreate ? "Nueva venta" : `Actualizar factura #${invoiceId}`}
            subtitle={isCreate
                ? "Selecciona el cliente, el vendedor y agrega los productos."
                : "Los campos que dejes vacíos conservan su valor actual."}
            onClose={onClose}
        >
            {loading ? (
                <p className={styles.loading}>Cargando datos de la factura...</p>
            ) : loadError ? (
                <p className={styles.errorBox}>{loadError}</p>
            ) : (
                <form onSubmit={handleSubmit}>
                    <h4 className={styles.sectionTitle}>Información general</h4>

                    <div className={styles.formGrid}>
                        {isCreate ? (
                            <CatalogSearch label="Cliente" required catalog="customers" full
                                placeholder="Buscar cliente..."
                                value={text("CustomerID")} onChange={set("CustomerID")} />
                        ) : (
                            <div className={`${styles.field} ${styles.fullWidth}`}>
                                <span className={styles.fieldLabel}>Cliente</span>
                                <div className={styles.readOnlyValue}>{customerName}</div>
                            </div>
                        )}

                        <CatalogSelect label="Vendedor" required={isCreate} catalog="salespeople"
                            value={text("SalespersonPersonID")} onChange={set("SalespersonPersonID")} />

                        <CatalogSearch label="Empacado por" catalog="people"
                            placeholder="Buscar persona..."
                            hint={isCreate ? "Si lo dejas vacío se usa el vendedor." : undefined}
                            value={text("PackedByPersonID")} onChange={set("PackedByPersonID")} />

                        <CatalogSelect label="Método de entrega" catalog="deliveryMethods"
                            emptyLabel={isCreate ? "El del cliente" : "Seleccione..."}
                            value={text("DeliveryMethodID")} onChange={set("DeliveryMethodID")} />

                        <TextField label="Fecha" type="date"
                            hint={isCreate ? "Si la dejas vacía se usa la fecha de hoy." : undefined}
                            value={text("InvoiceDate")} onChange={set("InvoiceDate")} />

                        <TextField label="Orden de compra del cliente" maxLength={20}
                            value={text("CustomerPurchaseOrderNumber")} onChange={set("CustomerPurchaseOrderNumber")} />

                        <TextField label="Instrucciones de entrega" full multiline
                            value={text("DeliveryInstructions")} onChange={set("DeliveryInstructions")} />

                        <TextField label="Comentarios" full multiline
                            value={text("Comments")} onChange={set("Comments")} />
                    </div>

                    <h4 className={styles.sectionTitle}>
                        Productos{isCreate && <span className={styles.requiredMark}> *</span>}
                    </h4>

                    <div className={styles.linesList}>
                        {lines.map((line) => (
                            <div key={line.key} className={styles.lineRow}>
                                <CatalogSearch label="Producto" catalog="stockItems"
                                    placeholder="Buscar producto..."
                                    initialLabel={line.StockItemName || undefined}
                                    value={line.StockItemID}
                                    onChange={(id, item) => selectProduct(line.key, id, item)} />

                                <TextField label="Cantidad" type="number" min={1} step="1"
                                    value={line.Quantity}
                                    onChange={(value) => updateLine(line.key, { Quantity: value })} />

                                <TextField label="Precio unitario" type="number" min={0} step="0.01"
                                    placeholder={line.listPrice != null ? String(line.listPrice) : "Precio de lista"}
                                    value={line.UnitPrice}
                                    onChange={(value) => updateLine(line.key, { UnitPrice: value })} />

                                <button
                                    type="button"
                                    className={styles.removeLineButton}
                                    onClick={() => removeLine(line.key)}
                                    disabled={lines.length === 1}
                                >
                                    Quitar
                                </button>
                            </div>
                        ))}

                        <button type="button" className={styles.addLineButton} onClick={addLine}>
                            + Agregar producto
                        </button>

                        <p className={styles.linesTotal}>
                            Total estimado (con impuesto): <strong>${estimatedTotal.toFixed(2)}</strong>
                        </p>
                    </div>

                    {formError && <p className={styles.errorBox}>{formError}</p>}

                    <FormActions mode={mode} saving={saving} onCancel={onClose} />
                </form>
            )}
        </CrudModal>
    );
}
