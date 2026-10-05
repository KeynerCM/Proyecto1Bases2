import { useEffect, useState } from 'react';

import styles from './estadistica3Section.module.css';

interface ProductoGanancia {
    Anio: number;
    Producto: string;
    GananciaTotal: number;
}

export default function Estadistica3Section() {
    const [productos, setProductos] = useState<ProductoGanancia[]>([]);

    const [anio, setAnio] = useState('2016');

    const [loading, setLoading] = useState(false);

    const obtenerProductos = async () => {
        try {
            setLoading(true);

            const response = await fetch(
                `http://localhost:3000/api/estadisticas/productos/top5?anio=${anio}`,
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

            setProductos(data);

        } catch (error) {
            console.error(
                'Error obteniendo Top 5 productos:',
                error
            );

            setProductos([]);

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (anio) {
            obtenerProductos();
        }
    }, [anio]);

    return (
        <section className={styles.section}>

            <h2>Estadística 3 - Top 5 Productos</h2>

            <div className={styles.filters}>

                <label htmlFor="anio">
                    Seleccionar año
                </label>

                <input
                    id="anio"
                    type="number"
                    value={anio}
                    onChange={(event) =>
                        setAnio(event.target.value)
                    }
                    min="2000"
                    max="2100"
                />

            </div>

            {loading ? (
                <p className={styles.loading}>
                    Loading...
                </p>
            ) : productos.length === 0 ? (
                <p className={styles.noResults}>
                    No se encontraron productos para este año.
                </p>
            ) : (
                <div className={styles.cards}>

                    {productos.map((producto, index) => (

                        <div
                            className={styles.card}
                            key={`${producto.Producto}-${index}`}
                        >

                            <div className={styles.position}>
                                #{index + 1}
                            </div>

                            <div className={styles.cardContent}>

                                <h3>
                                    {producto.Producto}
                                </h3>

                                <p>
                                    Año: {producto.Anio}
                                </p>

                                <div className={styles.gain}>
                                    <span>
                                        Ganancia total
                                    </span>

                                    <strong>
                                        {producto.GananciaTotal.toLocaleString(
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

                    ))}

                </div>
            )}

        </section>
    );
}