import React from 'react';
import styles from './NavBar.module.css';
export function NavBar() {
    return(
        <nav className={styles.navBar}>
            <ul>
                <li> <button>Inicio</button></li>
                <li> <button>Clientes</button></li>
                <li> <button>Proveedores</button></li>
                <li> <button>Inventarios</button></li>
            </ul>
        </nav>
    )
}
