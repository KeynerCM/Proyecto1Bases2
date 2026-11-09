import { useState } from "react";
import type { FormValue, FormValues } from "./types";

// Valores vacíos para un formulario nuevo
export function emptyValues(keys: string[], booleanKeys: string[] = []): FormValues {
    const values: FormValues = {};
    keys.forEach((key) => {
        values[key] = booleanKeys.includes(key) ? false : "";
    });
    return values;
}

// Convierte un registro de la API en valores del formulario
export function recordToValues(
    record: Record<string, unknown>,
    keys: string[],
    booleanKeys: string[] = []
): FormValues {
    const values: FormValues = {};

    keys.forEach((key) => {
        const value = record[key];

        if (booleanKeys.includes(key)) {
            values[key] = value === true || value === 1;
        } else if (value === null || value === undefined) {
            values[key] = "";
        } else if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
            values[key] = value.slice(0, 10); // fechas ISO -> yyyy-mm-dd
        } else {
            values[key] = String(value);
        }
    });

    return values;
}

// Arma el body para la API: '' -> null, números como number, texto sin espacios extra
export function buildPayload(values: FormValues, numberKeys: string[]): Record<string, unknown> {
    const payload: Record<string, unknown> = {};

    Object.entries(values).forEach(([key, value]) => {
        if (typeof value === "boolean") {
            payload[key] = value;
        } else if (value.trim() === "") {
            payload[key] = null;
        } else if (numberKeys.includes(key)) {
            payload[key] = Number(value);
        } else {
            payload[key] = value.trim();
        }
    });

    return payload;
}

// Devuelve las etiquetas de los campos obligatorios que están vacíos
export function missingRequired(values: FormValues, required: Record<string, string>): string[] {
    return Object.entries(required)
        .filter(([key]) => {
            const value = values[key];
            return typeof value !== "boolean" && (value === undefined || value.trim() === "");
        })
        .map(([, label]) => label);
}

export function useFormValues(initial: FormValues) {
    const [values, setValues] = useState<FormValues>(initial);

    const set = (key: string) => (value: FormValue) =>
        setValues((previous) => ({ ...previous, [key]: value }));

    const text = (key: string) => {
        const value = values[key];
        return typeof value === "string" ? value : "";
    };

    const checked = (key: string) => values[key] === true;

    return { values, setValues, set, text, checked };
}
