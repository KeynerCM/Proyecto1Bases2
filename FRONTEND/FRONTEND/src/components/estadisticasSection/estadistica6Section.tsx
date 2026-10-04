import { useEffect, useState } from 'react';

import styles from './estadistica6Section.module.css';

interface VentasCategoria {
    Categoria: string;
    '2013': number | null;
    '2014': number | null;
    '2015': number | null;
    '2016': number | null;
    Total: number;
}

const ANIOS = ['2013', '2014', '2015', '2016'] as const;

const formatearMonto = (monto: number | null) =>
    monto === null
        ? '-'
        : monto.toLocaleString('es-CR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

export default function Estadistica6Section() {
    const [ventas, setVentas] = useState<VentasCategoria[]>([]);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const obtenerMatriz = async () => {
            try {
                setLoading(true);

                const response = await fetch(
                    'http://localhost:3000/api/estadisticas/categorias/matriz',
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

                setVentas(data);

            } catch (error) {
                console.error(
                    'Error obteniendo matriz de ventas por categoría:',
                    error
                );

                setVentas([]);

            } finally {
                setLoading(false);
            }
        };

        obtenerMatriz();

    }, []);

    return (
        <section className={styles.section}>

            <h2>Estadística 6 - Ventas por categoría y año</h2>

            {loading ? (
                <p className={styles.loading}>
                    Loading...
                </p>
            ) : ventas.length === 0 ? (
                <p className={styles.noResults}>
                    No se encontraron ventas.
                </p>
            ) : (
                <div className={styles.tableContainer}>

                    <table className={styles.matrix}>

                        <thead>
                            <tr>
                                <th>Categoría</th>

                                {ANIOS.map((anio) => (
                                    <th key={anio}>{anio}</th>
                                ))}

                                <th>Total</th>
                            </tr>
                        </thead>

                        <tbody>
                            {ventas.map((venta) => (
                                <tr key={venta.Categoria}>
                                    <td>{venta.Categoria}</td>

                                    {ANIOS.map((anio) => (
                                        <td key={anio}>
                                            {formatearMonto(venta[anio])}
                                        </td>
                                    ))}

                                    <td className={styles.total}>
                                        {formatearMonto(venta.Total)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>

                    </table>

                </div>
            )}

        </section>
    );
}
