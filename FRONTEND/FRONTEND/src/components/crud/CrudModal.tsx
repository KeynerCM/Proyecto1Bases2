import { useEffect, type ReactNode } from "react";
import styles from "./crudModal.module.css";

type CrudModalProps = {
    title: string;
    subtitle?: string;
    onClose: () => void;
    // En formularios no se cierra al hacer clic afuera, para no perder lo escrito
    closeOnOverlay?: boolean;
    size?: "normal" | "small";
    children: ReactNode;
};

export function CrudModal({
    title, subtitle, onClose, closeOnOverlay = false, size = "normal", children,
}: CrudModalProps) {
    // Cerrar con la tecla Escape
    useEffect(() => {
        const handleKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        };

        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [onClose]);

    return (
        <div
            className={styles.modalOverlay}
            onClick={closeOnOverlay ? onClose : undefined}
        >
            <div
                className={size === "small" ? `${styles.crudCard} ${styles.crudCardSmall}` : styles.crudCard}
                role="dialog"
                aria-modal="true"
                aria-label={title}
                onClick={(event) => event.stopPropagation()}
            >
                <button
                    type="button"
                    className={styles.closeButton}
                    onClick={onClose}
                    aria-label="Cerrar"
                >
                    ×
                </button>

                <h2>{title}</h2>

                {subtitle && <p className={styles.subtitle}>{subtitle}</p>}

                {children}
            </div>
        </div>
    );
}
