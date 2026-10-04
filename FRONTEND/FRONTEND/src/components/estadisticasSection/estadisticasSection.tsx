import { useState } from 'react';

import Estadistica1Section from './estadistica1Section';
import Estadistica2Section from './estadistica2Section';
import Estadistica3Section from './estadistica3Section';
import Estadistica4Section from './estadistica4Section';
import Estadistica5Section from './estadistica5Section';
import Estadistica6Section from './estadistica6Section';

import styles from './estadisticasSection.module.css';

export function EstadisticasSection() {
    const [estadisticaSeleccionada, setEstadisticaSeleccionada] = useState(1);

    const renderEstadistica = () => {
        switch (estadisticaSeleccionada) {
            case 1:
                return <Estadistica1Section />;

            case 2:
                return <Estadistica2Section />;

            case 3:
                return <Estadistica3Section />;

            case 4:
                return <Estadistica4Section />;

            case 5:
                return <Estadistica5Section />;

            case 6:
                return <Estadistica6Section />;

            default:
                return <Estadistica1Section />;
        }
    };

    return (
        <section className={styles.estadisticasSection}>

            <div className={styles.estadisticasNav}>
                {[1, 2, 3, 4, 5, 6].map((numero) => (
                    <button
                        key={numero}
                        className={
                            estadisticaSeleccionada === numero
                                ? styles.activeButton
                                : styles.estadisticaButton
                        }
                        onClick={() =>
                            setEstadisticaSeleccionada(numero)
                        }
                    >
                        Estadística {numero}
                    </button>
                ))}
            </div>

            <div className={styles.estadisticaContent}>
                {renderEstadistica()}
            </div>

        </section>
    );
}