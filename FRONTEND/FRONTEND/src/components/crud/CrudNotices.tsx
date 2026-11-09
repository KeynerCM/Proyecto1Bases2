import styles from "./crudModal.module.css";
import type { ActionMode } from "./useCrudActions";

// =========================
// AVISO DE SELECCIÓN Y MENSAJE DE ÉXITO
// =========================

type SelectionBannerProps = {
    mode: ActionMode;
    entity: string;          // "un cliente", "una venta"...
    pronoun: "lo" | "la";
    onCancel: () => void;
};

export function SelectionBanner({ mode, entity, pronoun, onCancel }: SelectionBannerProps) {
    if (mode === "view") return null;

    const isDelete = mode === "delete";

    return (
        <div className={`${styles.selectionBanner} ${isDelete ? styles.bannerDelete : styles.bannerUpdate}`}>
            <span>
                Haz clic en {entity} para {isDelete ? `eliminar${pronoun}` : `actualizar${pronoun}`}.
            </span>

            <button type="button" onClick={onCancel}>
                Cancelar
            </button>
        </div>
    );
}

export function SuccessNotice({ message }: { message: string }) {
    if (!message) return null;

    return (
        <div className={styles.successNotice} role="status">
            {message}
        </div>
    );
}
