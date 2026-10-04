import { useEffect, useState } from 'react';

import styles from './estadistica5Section.module.css';

interface ProveedorCompras {
    Anio: number;
    Proveedor: string;
    CantOrdenes: number;
    MontoTotal: number;
}

export default function Estadistica5Section() {
    const [proveedores, setProveedores] = useState<ProveedorCompras[]>([]);

    const [anioInicio, setAnioInicio] = useState('2013');
    const [anioFin, setAnioFin] = useState('2016');

    const [loading, setLoading] = useState(false);

    const obtenerProveedores = async () => {
        try {
            setLoading(true);

            const response = await fetch(
                `http://localhost:3000/api/estadisticas/proveedores/top5?anioInicio=${anioInicio}&anioFin=${anioFin}`,
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

            setProveedores(data);

        } catch (error) {
            console.error(
                'Error obteniendo Top 5 proveedores:',
                error
            );

            setProveedores([]);

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (anioInicio && anioFin) {
            obtenerProveedores();
        }
    }, [anioInicio, anioFin]);

    return (
        <section className={styles.section}>

            <h2>Estadística 5 - Top 5 Proveedores</h2>

            <div className={styles.filters}>

                <div className={styles.filterGroup}>
                    <label htmlFor="anioInicioProveedor">
                        Año inicial
                    </label>

                    <input
                        id="anioInicioProveedor"
                        type="number"
                        value={anioInicio}
                        onChange={(event) =>
                            setAnioInicio(event.target.value)
                        }
                        min="2000"
                        max="2100"
                    />
                </div>

                <div className={styles.filterGroup}>
                    <label htmlFor="anioFinProveedor">
                        Año final
                    </label>

                    <input
                        id="anioFinProveedor"
                        type="number"
                        value={anioFin}
                        onChange={(event) =>
                            setAnioFin(event.target.value)
                        }
                        min="2000"
                        max="2100"
                    />
                </div>

            </div>

            {loading ? (
                <p className={styles.loading}>
                    Loading...
                </p>
            ) : proveedores.length === 0 ? (
                <p className={styles.noResults}>
                    No se encontraron proveedores para el rango seleccionado.
                </p>
            ) : (
                <div className={styles.cards}>

                    {proveedores.map((proveedor, index) => (

                        <div
                            className={styles.card}
                            key={`${proveedor.Proveedor}-${proveedor.Anio}-${index}`}
                        >

                            <div className={styles.position}>
                                #{index + 1}
                            </div>

                            <div className={styles.cardContent}>

                                <div className={styles.header}>
                                    <h3>
                                        {proveedor.Proveedor}
                                    </h3>

                                    <span className={styles.year}>
                                        {proveedor.Anio}
                                    </span>
                                </div>

                                <div className={styles.stats}>

                                    <div className={styles.stat}>
                                        <span>
                                            Órdenes de compra
                                        </span>

                                        <strong>
                                            {proveedor.CantOrdenes.toLocaleString(
                                                'es-CR'
                                            )}
                                        </strong>
                                    </div>

                                    <div className={styles.stat}>
                                        <span>
                                            Monto total
                                        </span>

                                        <strong>
                                            {proveedor.MontoTotal.toLocaleString(
                                                'es-CR',
                                                {
                                                    minimumFractionDigits: 2,
                                                    maximumFractionDigits: 2
                                                }
                                            )}
                                        </strong>
                                    </div>

                                </div>

                            </div>

                        </div>

                    ))}

                </div>
            )}

        </section>
    );
}