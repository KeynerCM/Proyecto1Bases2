import { useEffect, useState } from "react";
import styles from "./crudModal.module.css";
import { getCatalog, getCatalogItem, searchCatalog } from "./apiClient";
import type { CatalogItem, FormMode } from "./types";

type BaseFieldProps = {
    label: string;
    required?: boolean;
    full?: boolean;     // ocupa las dos columnas
    hint?: string;
};

const fieldClass = (full?: boolean) =>
    full ? `${styles.field} ${styles.fullWidth}` : styles.field;

function FieldLabel({ label, required }: { label: string; required?: boolean }) {
    return (
        <span className={styles.fieldLabel}>
            {label}
            {required && <em className={styles.requiredMark}> *</em>}
        </span>
    );
}


// =========================
// TEXTO / NÚMERO / FECHA
// =========================

type TextFieldProps = BaseFieldProps & {
    value: string;
    onChange: (value: string) => void;
    type?: "text" | "number" | "date";
    min?: number;
    step?: string;
    maxLength?: number;
    placeholder?: string;
    multiline?: boolean;
};

export function TextField({
    label, required, full, hint, value, onChange,
    type = "text", min, step, maxLength, placeholder, multiline,
}: TextFieldProps) {
    return (
        <label className={fieldClass(full)}>
            <FieldLabel label={label} required={required} />

            {multiline ? (
                <textarea
                    className={styles.input}
                    rows={3}
                    value={value}
                    maxLength={maxLength}
                    placeholder={placeholder}
                    onChange={(event) => onChange(event.target.value)}
                />
            ) : (
                <input
                    className={styles.input}
                    type={type}
                    value={value}
                    min={min}
                    step={step}
                    maxLength={maxLength}
                    placeholder={placeholder}
                    onChange={(event) => onChange(event.target.value)}
                />
            )}

            {hint && <small className={styles.fieldHint}>{hint}</small>}
        </label>
    );
}


// =========================
// CHECKBOX
// =========================

type CheckboxFieldProps = {
    label: string;
    checked: boolean;
    onChange: (value: boolean) => void;
};

export function CheckboxField({ label, checked, onChange }: CheckboxFieldProps) {
    return (
        <label className={styles.checkboxField}>
            <input
                type="checkbox"
                checked={checked}
                onChange={(event) => onChange(event.target.checked)}
            />
            <span>{label}</span>
        </label>
    );
}


// =========================
// COMBO CON CATÁLOGO PEQUEÑO
// =========================

type CatalogSelectProps = BaseFieldProps & {
    catalog: string;
    value: string;
    onChange: (value: string) => void;
    emptyLabel?: string;
};

export function CatalogSelect({
    label, required, full, hint, catalog, value, onChange, emptyLabel = "Seleccione...",
}: CatalogSelectProps) {
    const [items, setItems] = useState<CatalogItem[]>([]);
    const [error, setError] = useState("");

    useEffect(() => {
        let ignore = false;

        getCatalog(catalog)
            .then((data) => {
                if (!ignore) setItems(data);
            })
            .catch((err: unknown) => {
                if (!ignore) setError(err instanceof Error ? err.message : "No se pudo cargar la lista");
            });

        return () => {
            ignore = true;
        };
    }, [catalog]);

    return (
        <label className={fieldClass(full)}>
            <FieldLabel label={label} required={required} />

            <select
                className={styles.input}
                value={value}
                onChange={(event) => onChange(event.target.value)}
            >
                <option value="">{emptyLabel}</option>
                {items.map((item) => (
                    <option key={item.id} value={String(item.id)}>
                        {item.name}
                    </option>
                ))}
            </select>

            {error && <small className={styles.fieldError}>{error}</small>}
            {hint && !error && <small className={styles.fieldHint}>{hint}</small>}
        </label>
    );
}


// =========================
// BUSCADOR CON CATÁLOGO GRANDE (ciudades, personas, clientes, productos)
// =========================

type CatalogSearchProps = BaseFieldProps & {
    catalog: string;
    value: string;
    onChange: (value: string, item?: CatalogItem) => void;
    initialLabel?: string;
    placeholder?: string;
};

export function CatalogSearch({
    label, required, full, hint, catalog, value, onChange, initialLabel,
    placeholder = "Escribe al menos 2 letras...",
}: CatalogSearchProps) {
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);
    // Nombre del ID seleccionado y resultados de la última búsqueda
    const [resolved, setResolved] = useState<{ id: string; name: string }>(
        { id: initialLabel ? value : "", name: initialLabel ?? "" }
    );
    const [results, setResults] = useState<{ query: string; items: CatalogItem[] }>({ query: "", items: [] });

    const trimmedQuery = query.trim();
    const canSearch = open && trimmedQuery.length >= 2;
    const searching = canSearch && results.query !== trimmedQuery;
    const options = canSearch && !searching ? results.items : [];
    const selectedLabel = value && resolved.id === value ? resolved.name : "";

    // Si ya hay un ID (modo actualizar), se busca su nombre para mostrarlo
    useEffect(() => {
        if (!value || value === resolved.id) return;

        let ignore = false;

        getCatalogItem(catalog, value)
            .then((item) => {
                if (!ignore) setResolved({ id: value, name: item ? item.name : `ID ${value}` });
            })
            .catch(() => {
                if (!ignore) setResolved({ id: value, name: `ID ${value}` });
            });

        return () => {
            ignore = true;
        };
    }, [catalog, value, resolved.id]);

    // Búsqueda mientras se escribe (espera 300 ms entre teclas)
    useEffect(() => {
        if (!canSearch) return;

        let ignore = false;

        const timer = setTimeout(() => {
            searchCatalog(catalog, trimmedQuery)
                .then((items) => {
                    if (!ignore) setResults({ query: trimmedQuery, items });
                })
                .catch(() => {
                    if (!ignore) setResults({ query: trimmedQuery, items: [] });
                });
        }, 300);

        return () => {
            ignore = true;
            clearTimeout(timer);
        };
    }, [catalog, trimmedQuery, canSearch]);

    const selectItem = (item: CatalogItem) => {
        setResolved({ id: String(item.id), name: item.name });
        setOpen(false);
        setQuery("");
        onChange(String(item.id), item);
    };

    const clearSelection = () => {
        setResolved({ id: "", name: "" });
        onChange("");
    };

    return (
        <div className={fieldClass(full)}>
            <FieldLabel label={label} required={required} />

            <div className={styles.searchWrapper}>
                <input
                    className={styles.input}
                    type="text"
                    aria-label={label}
                    value={open ? query : selectedLabel}
                    placeholder={selectedLabel || placeholder}
                    onFocus={() => {
                        setOpen(true);
                        setQuery("");
                    }}
                    onBlur={() => setOpen(false)}
                    onChange={(event) => {
                        setOpen(true);
                        setQuery(event.target.value);
                    }}
                />

                {value && !open && (
                    <button
                        type="button"
                        className={styles.clearSearch}
                        onClick={clearSelection}
                        aria-label={`Quitar ${label}`}
                    >
                        ×
                    </button>
                )}

                {canSearch && (
                    <ul className={styles.searchResults}>
                        {searching && <li className={styles.searchInfo}>Buscando...</li>}

                        {!searching && options.length === 0 && (
                            <li className={styles.searchInfo}>Sin resultados</li>
                        )}

                        {options.map((item) => (
                            <li key={item.id}>
                                <button
                                    type="button"
                                    // onMouseDown para que el input no pierda el foco antes del clic
                                    onMouseDown={(event) => {
                                        event.preventDefault();
                                        selectItem(item);
                                    }}
                                >
                                    {item.name}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {hint && <small className={styles.fieldHint}>{hint}</small>}
        </div>
    );
}


// =========================
// BOTONES DEL FORMULARIO
// =========================

type FormActionsProps = {
    mode: FormMode;
    saving: boolean;
    onCancel: () => void;
};

export function FormActions({ mode, saving, onCancel }: FormActionsProps) {
    return (
        <div className={styles.formActions}>
            <button
                type="button"
                className={styles.cancelButton}
                onClick={onCancel}
                disabled={saving}
            >
                Cancelar
            </button>

            <button
                type="submit"
                className={mode === "create" ? styles.createButton : styles.updateButton}
                disabled={saving}
            >
                {saving ? "Guardando..." : mode === "create" ? "Insertar" : "Guardar cambios"}
            </button>
        </div>
    );
}
