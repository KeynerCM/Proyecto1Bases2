import { useEffect, useState } from "react";
import styles from "./crudModal.module.css";

export type ActionMode = "view" | "update" | "delete";

// Estado compartido por las secciones: qué botón está activo, qué registro
// se está editando o eliminando, el mensaje de éxito y cuándo recargar la lista.
export function useCrudActions<T>() {
    const [actionMode, setActionMode] = useState<ActionMode>("view");
    const [creating, setCreating] = useState(false);
    const [editing, setEditing] = useState<T | null>(null);
    const [deleting, setDeleting] = useState<T | null>(null);
    const [notice, setNotice] = useState("");
    const [refreshKey, setRefreshKey] = useState(0);

    // El mensaje de éxito se oculta solo
    useEffect(() => {
        if (!notice) return;
        const timer = setTimeout(() => setNotice(""), 4000);
        return () => clearTimeout(timer);
    }, [notice]);

    const toggleMode = (mode: Exclude<ActionMode, "view">) =>
        setActionMode((current) => (current === mode ? "view" : mode));

    const startCreate = () => {
        setActionMode("view");
        setCreating(true);
    };

    // Clic en una card: según el botón activo abre editar, eliminar o el detalle
    const handleCardClick = (item: T, openDetails: (item: T) => void) => {
        if (actionMode === "update") {
            setEditing(item);
            setActionMode("view");
        } else if (actionMode === "delete") {
            setDeleting(item);
            setActionMode("view");
        } else {
            openDetails(item);
        }
    };

    // Después de guardar o eliminar: cerrar modales, avisar y recargar
    const finish = (message: string) => {
        setCreating(false);
        setEditing(null);
        setDeleting(null);
        setNotice(message);
        setRefreshKey((key) => key + 1);
    };

    const cardsClassName =
        actionMode === "update" ? styles.selectableUpdate
        : actionMode === "delete" ? styles.selectableDelete
        : "";

    return {
        actionMode, setActionMode, toggleMode,
        creating, setCreating, startCreate,
        editing, setEditing,
        deleting, setDeleting,
        notice, refreshKey,
        handleCardClick, finish,
        cardsClassName,
        activeClass: (mode: ActionMode) => (actionMode === mode ? styles.activeAction : ""),
    };
}
