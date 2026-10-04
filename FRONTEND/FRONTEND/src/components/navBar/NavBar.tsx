import React from 'react';
import styles from './NavBar.module.css';
export function NavBar({setSelectedSection}) {
    return(
        <nav className={styles.navBar}>
            <ul>
                <li> <button onClick={() => setSelectedSection('Inicio')}>Inicio</button></li>
                <li> <button onClick={() => setSelectedSection('Clientes')}>Clientes</button></li>
                <li> <button onClick={() => setSelectedSection('Proveedores')}>Proveedores</button></li>
                <li> <button onClick={() => setSelectedSection('Inventarios')}>Inventarios</button></li>
                <li> <button onClick={() => setSelectedSection('Ventas')}>Ventas</button></li>
                <li> <button onClick={() => setSelectedSection('Estadísticas')}>Estadísticas</button></li>
            </ul>
        </nav>
    )
}
