import styles from './InicioSection.module.css'
import react from 'react'

export function InicioSection() {
    return (
        <section className={styles.inicioSection}>
            <div>
                <p>Clientes</p>
                <h1>+10000</h1>
            </div>
            <div>
                <p>Proveedores</p>
                <h1>+500</h1>
            </div>
            <div>
                <p>Inventarios</p>
                <h1>+450000</h1>
            </div>
        </section>
    )
}