import { useEffect, useState } from 'react';

import styles from './estadistica10Section.module.css';

interface EnvioFavorito {
    Lugar: string;
    MetodoFavorito: string;
    CantidadVentas: number;
}

const MESES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export default function Estadistica10Section() {
    const [envios, setEnvios] = useState<EnvioFavorito[]>([]);

    const [anio, setAnio] = useState('');
    const [mes, setMes] = useState('');
    const [categoriaCliente, setCategoriaCliente] = useState('');
    const [categoriaProducto, setCategoriaProducto] = useState('');
    const [producto, setProducto] = useState('');

    const [loading, setLoading] = useState(false);

    const anioInvalido =
        anio !== '' && (Number(anio) < 2013 || Number(anio) > 2016);

    useEffect(() => {
        if (anioInvalido) {
            return;
        }

        let ignorar = false;

        const obtenerEnvios = async () => {
            try {
                setLoading(true);

                const response = await fetch(
                    `http://localhost:3000/api/estadisticas/envios/favorito?anio=${anio}&mes=${mes}&categoriaCliente=${encodeURIComponent(categoriaCliente)}&categoriaProducto=${encodeURIComponent(categoriaProducto)}&producto=${encodeURIComponent(producto)}`,
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
                    setEnvios(data);
                }

            } catch (error) {
                console.error(
                    'Error obteniendo método de envío favorito:',
                    error
                );

                setEnvios([]);

            } finally {
                if (!ignorar) {
                    setLoading(false);
                }
            }
        };

        obtenerEnvios();

        return () => {
            ignorar = true;
        };

    }, [anio, mes, categoriaCliente, categoriaProducto, producto, anioInvalido]);

    const restaurarFiltros = () => {
        setAnio('');
        setMes('');
        setCategoriaCliente('');
        setCategoriaProducto('');
        setProducto('');
    };

    return (
        <section className={styles.section}>

            <h2>Estadística 10 - Método de envío favorito por lugar</h2>

            <div className={styles.filters}>

                <div className={styles.filterGroup}>
                    <label htmlFor="anioEnvios">
                        Año
                    </label>

                    <input
                        id="anioEnvios"
                        type="number"
                        placeholder="Todos"
                        value={anio}
                        onChange={(event) => setAnio(event.target.value)}
                        min="2013"
                        max="2016"
                    />
                </div>

                <div className={styles.filterGroup}>
                    <label htmlFor="mesEnvios">
                        Mes
                    </label>

                    <select
                        id="mesEnvios"
                        value={mes}
                        onChange={(event) => setMes(event.target.value)}
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
                    <label htmlFor="categoriaClienteEnvios">
                        Categoría de cliente
                    </label>

                    <input
                        id="categoriaClienteEnvios"
                        type="text"
                        placeholder="Ej: Novelty Shop"
                        value={categoriaCliente}
                        onChange={(event) => setCategoriaCliente(event.target.value)}
                    />
                </div>

                <div className={styles.filterGroup}>
                    <label htmlFor="categoriaProductoEnvios">
                        Categoría de producto
                    </label>

                    <input
                        id="categoriaProductoEnvios"
                        type="text"
                        placeholder="Ej: Toys"
                        value={categoriaProducto}
                        onChange={(event) => setCategoriaProducto(event.target.value)}
                    />
                </div>

                <div className={styles.filterGroup}>
                    <label htmlFor="productoEnvios">
                        Producto
                    </label>

                    <input
                        id="productoEnvios"
                        type="text"
                        placeholder="Ej: RC toy"
                        value={producto}
                        onChange={(event) => setProducto(event.target.value)}
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
            ) : envios.length === 0 ? (
                <p className={styles.noResults}>
                    No se encontraron ventas para los filtros seleccionados.
                </p>
            ) : (
                <div className={styles.cards}>

                    {envios.map((envio, index) => (

                        <div
                            className={styles.card}
                            key={`${envio.Lugar}-${envio.MetodoFavorito}`}
                        >

                            <div className={styles.position}>
                                #{index + 1}
                            </div>

                            <div className={styles.cardContent}>

                                <div className={styles.header}>
                                    <h3>
                                        {envio.Lugar}
                                    </h3>
                                </div>

                                <div className={styles.stats}>

                                    <div className={styles.stat}>
                                        <span>Método favorito</span>
                                        <strong>{envio.MetodoFavorito}</strong>
                                    </div>

                                    <div className={styles.stat}>
                                        <span>Cantidad de ventas</span>
                                        <strong>
                                            {envio.CantidadVentas.toLocaleString('es-CR')}
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
