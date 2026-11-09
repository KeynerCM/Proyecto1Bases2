export type FormValue = string | boolean;

export type FormValues = Record<string, FormValue>;

export type CatalogItem = {
    id: number;
    name: string;
    UnitPrice?: number;
    TaxRate?: number;
};

export type FormMode = "create" | "update";
