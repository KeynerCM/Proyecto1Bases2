import { useEffect, useState } from 'react';

import styles from './estadistica1Section.module.css';

interface EstadisticaCompra {
    Proveedor: string | null;
    Categoria: string | null;
    CompraMaxima: number | null;
    CompraMinima: number | null;
    PromedioCompras: number | null;
}

export default function Estadistica1Section() {
    const [estadisticas, setEstadisticas] = useState<EstadisticaCompra[]>([]);

    const [proveedor, setProveedor] = useState('');
    const [categoria, setCategoria] = useState('');

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const obtenerEstadisticas = async () => {
            try {
                setLoading(true);

                const params = new URLSearchParams();

                if (proveedor.trim()) {
                    params.append('proveedor', proveedor);
                }

                if (categoria.trim()) {
                    params.append('categoria', categoria);
                }

                const response = await fetch(
                    `http://localhost:3000/api/estadisticas/compras?${params.toString()}`,
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

                setEstadisticas(data);

            } catch (error) {
                console.error(
                    'Error obteniendo estadísticas de compras:',
                    error
                );
            } finally {
                setLoading(false);
            }
        };

        obtenerEstadisticas();

    }, [proveedor, categoria]);

    return (
        <section className={styles.section}>

            <h2>Estadística 1 - Compras</h2>

            <div className={styles.filters}>

                <input
                    type="text"
                    placeholder="Buscar proveedor..."
                    value={proveedor}
                    onChange={(event) =>
                        setProveedor(event.target.value)
                    }
                />

                <input
                    type="text"
                    placeholder="Buscar categoría..."
                    value={categoria}
                    onChange={(event) =>
                        setCategoria(event.target.value)
                    }
                />

            </div>

            {loading ? (
                <p>Loading...</p>
            ) : (
                <div className={styles.cards}>

                    {estadisticas.map((estadistica, index) => (
                        <div
                            className={styles.card}
                            key={index}
                        >
                            <h3>
                                {estadistica.Proveedor ||
                                    'Total'}
                            </h3>

                            <p>
                                Categoría:{' '}
                                {estadistica.Categoria ||
                                    'Todas'}
                            </p>

                            <p>
                                Compra máxima:{' '}
                                {estadistica.CompraMaxima}
                            </p>

                            <p>
                                Compra mínima:{' '}
                                {estadistica.CompraMinima}
                            </p>

                            <p>
                                Promedio:{' '}
                                {estadistica.PromedioCompras}
                            </p>
                        </div>
                    ))}

                </div>
            )}

        </section>
    );
}