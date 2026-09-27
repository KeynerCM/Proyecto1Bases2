import React from 'react';
import styles from './NavBar.module.css';
export function NavBar() {
    return(
        <nav className={styles.navBar}>
            <ul>
                <li><a href="/">Home</a></li>
                <li><a href="/about">About</a></li>
                <li><a href="/contact">Contact</a></li>
            </ul>
        </nav>
    )
}
