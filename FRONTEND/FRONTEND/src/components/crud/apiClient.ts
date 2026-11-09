import type { CatalogItem } from "./types";

const API_URL = "http://localhost:3000/api";

// La llave se toma de .env (VITE_API_KEY). Si no está definida,
// se usa la misma que ya tenían escrita las secciones.
const API_KEY: string =
    import.meta.env.VITE_API_KEY ??
    "6ef7908d83e853df10583389fd0279f67196882d4614da87f9b732330c94bab4";

type RequestOptions = {
    method?: "GET" | "POST" | "PUT" | "DELETE";
    body?: unknown;
};

type ErrorBody = {
    message?: string;
    fields?: string[];
};

// Hace la petición y, si falla, lanza un Error con el mensaje que manda la API
export async function apiRequest<T = unknown>(path: string, options: RequestOptions = {}): Promise<T> {
    const { method = "GET", body } = options;

    const headers: Record<string, string> = { "x-api-key": API_KEY };
    if (body !== undefined) {
        headers["Content-Type"] = "application/json";
    }

    const response = await fetch(`${API_URL}${path}`, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    let data: unknown = null;
    try {
        data = await response.json();
    } catch {
        data = null;
    }

    if (!response.ok) {
        const errorBody = (data ?? {}) as ErrorBody;
        let message = errorBody.message ?? `Error ${response.status}`;

        if (Array.isArray(errorBody.fields) && errorBody.fields.length > 0) {
            message += `: ${errorBody.fields.join(", ")}`;
        }

        throw new Error(message);
    }

    return data as T;
}


// =========================
// CATÁLOGOS
// =========================

// Los catálogos pequeños se piden una sola vez y se guardan en memoria
const catalogCache = new Map<string, Promise<CatalogItem[]>>();

export function getCatalog(name: string): Promise<CatalogItem[]> {
    let request = catalogCache.get(name);

    if (!request) {
        request = apiRequest<CatalogItem[]>(`/catalogs/${name}`).catch((error) => {
            catalogCache.delete(name);
            throw error;
        });
        catalogCache.set(name, request);
    }

    return request;
}

export function clearCatalogCache(name?: string) {
    if (name) {
        catalogCache.delete(name);
    } else {
        catalogCache.clear();
    }
}

export function searchCatalog(name: string, search: string): Promise<CatalogItem[]> {
    return apiRequest<CatalogItem[]>(`/catalogs/${name}?search=${encodeURIComponent(search)}`);
}

export async function getCatalogItem(name: string, id: string): Promise<CatalogItem | null> {
    const items = await apiRequest<CatalogItem[]>(`/catalogs/${name}?id=${encodeURIComponent(id)}`);
    return items[0] ?? null;
}

export function errorMessage(error: unknown, fallback = "Ocurrió un error inesperado.") {
    return error instanceof Error ? error.message : fallback;
}
