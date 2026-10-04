import { useEffect, useState } from 'react';

import styles from './estadistica2Section.module.css';

interface EstadisticaVenta {
    Cliente: string | null;
    Categoria: string | null;
    VentaMaxima: number | null;
    VentaMinima: number | null;
    PromedioVentas: number | null;
}

export default function Estadistica2Section() {
    const [estadisticas, setEstadisticas] = useState<EstadisticaVenta[]>([]);

    const [cliente, setCliente] = useState('');
    const [categoria, setCategoria] = useState('');

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const obtenerEstadisticas = async () => {
            try {
                setLoading(true);

                const params = new URLSearchParams();

                if (cliente.trim()) {
                    params.append('cliente', cliente);
                }

                if (categoria.trim()) {
                    params.append('categoria', categoria);
                }

                const response = await fetch(
                    `http://localhost:3000/api/estadisticas/ventas?${params.toString()}`,
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
                    'Error obteniendo estadísticas de ventas:',
                    error
                );

                setEstadisticas([]);

            } finally {
                setLoading(false);
            }
        };

        obtenerEstadisticas();

    }, [cliente, categoria]);

    return (
        <section className={styles.section}>

            <h2>Estadística 2 - Ventas</h2>

            <div className={styles.filters}>

                <input
                    type="text"
                    placeholder="Buscar cliente..."
                    value={cliente}
                    onChange={(event) =>
                        setCliente(event.target.value)
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
                <p className={styles.loading}>
                    Loading...
                </p>
            ) : estadisticas.length === 0 ? (
                <p className={styles.noResults}>
                    No se encontraron estadísticas.
                </p>
            ) : (
                <div className={styles.cards}>

                    {estadisticas.map((estadistica, index) => (

                        <div
                            className={styles.card}
                            key={index}
                        >

                            <h3>
                                {estadistica.Cliente || 'Total'}
                            </h3>

                            <p>
                                <strong>Categoría:</strong>{' '}
                                {estadistica.Categoria || 'Todas'}
                            </p>

                            <div className={styles.statRow}>
                                <span>Venta máxima</span>
                                <strong>
                                    {estadistica.VentaMaxima?.toLocaleString(
                                        'es-CR',
                                        {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        }
                                    ) ?? 'N/A'}
                                </strong>
                            </div>

                            <div className={styles.statRow}>
                                <span>Venta mínima</span>
                                <strong>
                                    {estadistica.VentaMinima?.toLocaleString(
                                        'es-CR',
                                        {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        }
                                    ) ?? 'N/A'}
                                </strong>
                            </div>

                            <div className={styles.statRow}>
                                <span>Promedio de ventas</span>
                                <strong>
                                    {estadistica.PromedioVentas?.toLocaleString(
                                        'es-CR',
                                        {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        }
                                    ) ?? 'N/A'}
                                </strong>
                            </div>

                        </div>

                    ))}

                </div>
            )}

        </section>
    );
}