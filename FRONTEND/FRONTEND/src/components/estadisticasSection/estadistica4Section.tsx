import { useEffect, useState } from 'react';

import styles from './estadistica4Section.module.css';

interface ClienteFacturas {
    Anio: number;
    Cliente: string;
    CantFacturas: number;
    MontoTotal: number;
}

export default function Estadistica4Section() {
    const [clientes, setClientes] = useState<ClienteFacturas[]>([]);

    const [anioInicio, setAnioInicio] = useState('2013');
    const [anioFin, setAnioFin] = useState('2016');

    const [loading, setLoading] = useState(false);

    const obtenerClientes = async () => {
        try {
            setLoading(true);

            const response = await fetch(
                `http://localhost:3000/api/estadisticas/clientes/top5?anioInicio=${anioInicio}&anioFin=${anioFin}`,
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

            setClientes(data);

        } catch (error) {
            console.error(
                'Error obteniendo Top 5 clientes:',
                error
            );

            setClientes([]);

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (anioInicio && anioFin) {
            obtenerClientes();
        }
    }, [anioInicio, anioFin]);

    return (
        <section className={styles.section}>

            <h2>Estadística 4 - Top 5 Clientes</h2>

            <div className={styles.filters}>

                <div className={styles.filterGroup}>
                    <label htmlFor="anioInicio">
                        Año inicial
                    </label>

                    <input
                        id="anioInicio"
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
                    <label htmlFor="anioFin">
                        Año final
                    </label>

                    <input
                        id="anioFin"
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
            ) : clientes.length === 0 ? (
                <p className={styles.noResults}>
                    No se encontraron clientes para el rango seleccionado.
                </p>
            ) : (
                <div className={styles.cards}>

                    {clientes.map((cliente, index) => (

                        <div
                            className={styles.card}
                            key={`${cliente.Cliente}-${cliente.Anio}-${index}`}
                        >

                            <div className={styles.position}>
                                #{index + 1}
                            </div>

                            <div className={styles.cardContent}>

                                <div className={styles.header}>
                                    <h3>
                                        {cliente.Cliente}
                                    </h3>

                                    <span className={styles.year}>
                                        {cliente.Anio}
                                    </span>
                                </div>

                                <div className={styles.stats}>

                                    <div className={styles.stat}>
                                        <span>
                                            Facturas
                                        </span>

                                        <strong>
                                            {cliente.CantFacturas.toLocaleString(
                                                'es-CR'
                                            )}
                                        </strong>
                                    </div>

                                    <div className={styles.stat}>
                                        <span>
                                            Monto total
                                        </span>

                                        <strong>
                                            {cliente.MontoTotal.toLocaleString(
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