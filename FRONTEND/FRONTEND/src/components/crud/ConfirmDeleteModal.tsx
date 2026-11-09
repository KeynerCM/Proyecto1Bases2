import { useState } from "react";
import styles from "./crudModal.module.css";
import { CrudModal } from "./CrudModal";
import { errorMessage } from "./apiClient";

type ConfirmDeleteModalProps = {
    title: string;
    itemName: string;
    warning?: string;
    onConfirm: () => Promise<void>;
    onDeleted: () => void;
    onClose: () => void;
};

export function ConfirmDeleteModal({
    title, itemName, warning, onConfirm, onDeleted, onClose,
}: ConfirmDeleteModalProps) {
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState("");

    const handleDelete = async () => {
        try {
            setDeleting(true);
            setError("");
            await onConfirm();
            onDeleted();
        } catch (err) {
            setError(errorMessage(err, "No se pudo eliminar el registro."));
            setDeleting(false);
        }
    };

    return (
        <CrudModal title={title} onClose={onClose} closeOnOverlay size="small">
            <p className={styles.confirmText}>
                ¿Seguro que quieres eliminar <strong>{itemName}</strong>?
                Esta acción no se puede deshacer.
            </p>

            {warning && <p className={styles.warningBox}>{warning}</p>}

            {error && <p className={styles.errorBox}>{error}</p>}

            <div className={styles.formActions}>
                <button
                    type="button"
                    className={styles.cancelButton}
                    onClick={onClose}
                    disabled={deleting}
                >
                    Cancelar
                </button>

                <button
                    type="button"
                    className={styles.deleteButton}
                    onClick={handleDelete}
                    disabled={deleting}
                >
                    {deleting ? "Eliminando..." : "Eliminar"}
                </button>
            </div>
        </CrudModal>
    );
}
