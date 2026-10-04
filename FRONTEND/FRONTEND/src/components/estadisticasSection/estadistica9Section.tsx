import { useEffect, useState } from 'react';

import styles from './estadistica9Section.module.css';

interface RotacionProducto {
    Producto: string;
    Proveedor: string;
    InventarioPromedio: number;
    UnidadesVendidas: number;
    PromedioDiasRotacion: number;
}

const FILAS_POR_PAGINA = 20;

export default function Estadistica9Section() {
    const [productos, setProductos] = useState<RotacionProducto[]>([]);

    const [categoria, setCategoria] = useState('');
    const [anio, setAnio] = useState('');
    const [proveedor, setProveedor] = useState('');
    const [pagina, setPagina] = useState(1);

    const [loading, setLoading] = useState(false);

    const anioInvalido =
        anio !== '' && (Number(anio) < 2013 || Number(anio) > 2016);

    useEffect(() => {
        if (anioInvalido) {
            return;
        }

        let ignorar = false;

        const obtenerRotacion = async () => {
            try {
                setLoading(true);

                const response = await fetch(
                    `http://localhost:3000/api/estadisticas/inventario/rotacion?pageNumber=${pagina}&categoria=${encodeURIComponent(categoria)}&anio=${anio}&proveedor=${encodeURIComponent(proveedor)}`,
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
                    setProductos(data);
                }

            } catch (error) {
                console.error(
                    'Error obteniendo promedio de rotación de inventario:',
                    error
                );

                setProductos([]);

            } finally {
                if (!ignorar) {
                    setLoading(false);
                }
            }
        };

        obtenerRotacion();

        return () => {
            ignorar = true;
        };

    }, [categoria, anio, proveedor, pagina, anioInvalido]);

    const cambiarFiltro = (setFiltro: (valor: string) => void, valor: string) => {
        setFiltro(valor);
        setPagina(1);
    };

    const restaurarFiltros = () => {
        setCategoria('');
        setAnio('');
        setProveedor('');
        setPagina(1);
    };

    return (
        <section className={styles.section}>

            <h2>Estadística 9 - Promedio de días de rotación de inventario</h2>

            <p className={styles.formula}>
                Días de rotación = días del período × inventario promedio ÷ unidades vendidas.
                El inventario promedio es (nivel de reorden + nivel objetivo) ÷ 2.
            </p>

            <div className={styles.filters}>

                <div className={styles.filterGroup}>
                    <label htmlFor="categoriaRotacion">
                        Categoría
                    </label>

                    <input
                        id="categoriaRotacion"
                        type="text"
                        placeholder="Ej: Toys"
                        value={categoria}
                        onChange={(event) =>
                            cambiarFiltro(setCategoria, event.target.value)
                        }
                    />
                </div>

                <div className={styles.filterGroup}>
                    <label htmlFor="anioRotacion">
                        Año
                    </label>

                    <input
                        id="anioRotacion"
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
                    <label htmlFor="proveedorRotacion">
                        Proveedor
                    </label>

                    <input
                        id="proveedorRotacion"
                        type="text"
                        placeholder="Ej: Northwind"
                        value={proveedor}
                        onChange={(event) =>
                            cambiarFiltro(setProveedor, event.target.value)
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
            ) : productos.length === 0 ? (
                <p className={styles.noResults}>
                    No se encontraron productos para los filtros seleccionados.
                </p>
            ) : (
                <div className={styles.cards}>

                    {productos.map((producto) => (

                        <div
                            className={styles.card}
                            key={producto.Producto}
                        >

                            <div className={styles.header}>
                                <h3>
                                    {producto.Producto}
                                </h3>
                            </div>

                            <span className={styles.year}>
                                {producto.Proveedor}
                            </span>

                            <div className={styles.stats}>

                                <div className={styles.stat}>
                                    <span>Días de rotación</span>
                                    <strong>{producto.PromedioDiasRotacion}</strong>
                                </div>

                                <div className={styles.stat}>
                                    <span>Inventario promedio</span>
                                    <strong>{producto.InventarioPromedio}</strong>
                                </div>

                                <div className={styles.stat}>
                                    <span>Unidades vendidas</span>
                                    <strong>
                                        {producto.UnidadesVendidas.toLocaleString('es-CR')}
                                    </strong>
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
                    disabled={anioInvalido || productos.length < FILAS_POR_PAGINA}
                >
                    Siguiente
                </button>
            </div>

        </section>
    );
}
