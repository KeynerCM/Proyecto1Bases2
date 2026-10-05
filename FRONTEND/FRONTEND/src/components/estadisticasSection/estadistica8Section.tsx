import { useEffect, useState } from 'react';

import styles from './estadistica8Section.module.css';

interface SeguimientoProveedor {
    Proveedor: string;
    Anio: number;
    Mes: number;
    MontoTotal: number;
    PrimeraOrden: number;
    FechaPrimeraOrden: string;
    UltimaOrden: number;
    FechaUltimaOrden: string;
    CantidadTotal: number;
    CantidadMinima: number;
    CantidadMaxima: number;
}

const FILAS_POR_PAGINA = 20;

const MESES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export default function Estadistica8Section() {
    const [seguimiento, setSeguimiento] = useState<SeguimientoProveedor[]>([]);

    const [anio, setAnio] = useState('');
    const [mes, setMes] = useState('');
    const [categoria, setCategoria] = useState('');
    const [subcategoria, setSubcategoria] = useState('');
    const [pagina, setPagina] = useState(1);

    const [loading, setLoading] = useState(false);

    const anioInvalido =
        anio !== '' && (Number(anio) < 2013 || Number(anio) > 2016);

    useEffect(() => {
        if (anioInvalido) {
            return;
        }

        let ignorar = false;

        const obtenerSeguimiento = async () => {
            try {
                setLoading(true);

                const response = await fetch(
                    `http://localhost:3000/api/estadisticas/proveedores/seguimiento?pageNumber=${pagina}&anio=${anio}&mes=${mes}&categoria=${encodeURIComponent(categoria)}&subcategoria=${encodeURIComponent(subcategoria)}`,
                    {
                        headers: {
                            'x-api-key': import.meta.env.VITE_API_KEY
                        }
                    }
                );

                if (!response.ok) {
                    throw new Error(
                        `Error ${response.status}: ${response.statusText}`
                    );
                }

                const data = await response.json();

                if (!ignorar) {
                    setSeguimiento(data);
                }

            } catch (error) {
                console.error(
                    'Error obteniendo seguimiento de compras a proveedores:',
                    error
                );

                setSeguimiento([]);

            } finally {
                if (!ignorar) {
                    setLoading(false);
                }
            }
        };

        obtenerSeguimiento();

        return () => {
            ignorar = true;
        };

    }, [anio, mes, categoria, subcategoria, pagina, anioInvalido]);

    const cambiarFiltro = (setFiltro: (valor: string) => void, valor: string) => {
        setFiltro(valor);
        setPagina(1);
    };

    const restaurarFiltros = () => {
        setAnio('');
        setMes('');
        setCategoria('');
        setSubcategoria('');
        setPagina(1);
    };

    return (
        <section className={styles.section}>

            <h2>Estadística 8 - Seguimiento de compras a proveedores</h2>

            <div className={styles.filters}>

                <div className={styles.filterGroup}>
                    <label htmlFor="anioSeguimientoProveedores">
                        Año
                    </label>

                    <input
                        id="anioSeguimientoProveedores"
                        type="number"
                        placeholder="Todos"
                        value={anio}
                        onChange={(event) =>
                            cambiarFiltro(setAnio, event.target.value)
                        }
                        min="2013"
                        max="2016"
                    />
                </div>

                <div className={styles.filterGroup}>
                    <label htmlFor="mesSeguimientoProveedores">
                        Mes
                    </label>

                    <select
                        id="mesSeguimientoProveedores"
                        value={mes}
                        onChange={(event) =>
                            cambiarFiltro(setMes, event.target.value)
                        }
                    >
                        <option value="">Todos</option>

                        {MESES.map((nombreMes, index) => (
                            <option key={nombreMes} value={index + 1}>
                                {nombreMes}
                            </option>
                        ))}
                    </select>
                </div>

                <div className={styles.filterGroup}>
                    <label htmlFor="categoriaSeguimientoProveedores">
                        Categoría
                    </label>

                    <input
                        id="categoriaSeguimientoProveedores"
                        type="text"
                        placeholder="Ej: Clothing"
                        value={categoria}
                        onChange={(event) =>
                            cambiarFiltro(setCategoria, event.target.value)
                        }
                    />
                </div>

                <div className={styles.filterGroup}>
                    <label htmlFor="subcategoriaSeguimientoProveedores">
                        Subcategoría
                    </label>

                    <input
                        id="subcategoriaSeguimientoProveedores"
                        type="text"
                        placeholder="Ej: T-Shirts"
                        value={subcategoria}
                        onChange={(event) =>
                            cambiarFiltro(setSubcategoria, event.target.value)
                        }
                    />
                </div>

                <button
                    className={styles.restoreButton}
                    onClick={restaurarFiltros}
                >
                    Restaurar filtros
                </button>

            </div>

            {anioInvalido ? (
                <p className={styles.errorMessage}>
                    El año debe estar entre 2013 y 2016.
                </p>
            ) : loading ? (
                <p className={styles.loading}>
                    Loading...
                </p>
            ) : seguimiento.length === 0 ? (
                <p className={styles.noResults}>
                    No se encontraron compras para los filtros seleccionados.
                </p>
            ) : (
                <div className={styles.cards}>

                    {seguimiento.map((fila) => (

                        <div
                            className={styles.card}
                            key={`${fila.Proveedor}-${fila.Anio}-${fila.Mes}`}
                        >

                            <div className={styles.header}>
                                <h3>
                                    {fila.Proveedor}
                                </h3>

                                <span className={styles.year}>
                                    {MESES[fila.Mes - 1]} {fila.Anio}
                                </span>
                            </div>

                            <div className={styles.stats}>

                                <div className={styles.stat}>
                                    <span>Monto total</span>
                                    <strong>
                                        {fila.MontoTotal.toLocaleString(
                                            'es-CR',
                                            {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2
                                            }
                                        )}
                                    </strong>
                                </div>

                                <div className={styles.stat}>
                                    <span>Primera orden</span>
                                    <strong>
                                        #{fila.PrimeraOrden} ({fila.FechaPrimeraOrden.slice(0, 10)})
                                    </strong>
                                </div>

                                <div className={styles.stat}>
                                    <span>Última orden</span>
                                    <strong>
                                        #{fila.UltimaOrden} ({fila.FechaUltimaOrden.slice(0, 10)})
                                    </strong>
                                </div>

                                <div className={styles.stat}>
                                    <span>Cantidad total</span>
                                    <strong>{fila.CantidadTotal}</strong>
                                </div>

                                <div className={styles.stat}>
                                    <span>Cantidad mínima</span>
                                    <strong>{fila.CantidadMinima}</strong>
                                </div>

                                <div className={styles.stat}>
                                    <span>Cantidad máxima</span>
                                    <strong>{fila.CantidadMaxima}</strong>
                                </div>

                            </div>

                        </div>

                    ))}

                </div>
            )}

            <div className={styles.pagination}>
                <button
                    className={styles.paginationButton}
                    onClick={() => setPagina(pagina - 1)}
                    disabled={pagina === 1}
                >
                    Anterior
                </button>

                <span className={styles.pageNumber}>
                    Página {pagina}
                </span>

                <button
                    className={styles.paginationButton}
                    onClick={() => setPagina(pagina + 1)}
                    disabled={anioInvalido || seguimiento.length < FILAS_POR_PAGINA}
                >
                    Siguiente
                </button>
            </div>

        </section>
    );
}
