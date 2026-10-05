import React, { useEffect, useState } from 'react';
import styles from './NavBar.module.css';

const SECTIONS = [
    'Inicio',
    'Clientes',
    'Proveedores',
    'Inventarios',
    'Ventas',
    'Estadísticas',
];

export function NavBar({ selectedSection, setSelectedSection }) {
    const [isOpen, setIsOpen] = useState(false);

    // Cerrar con la tecla Escape y bloquear el scroll del fondo mientras el menú está abierto
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') setIsOpen(false);
        };

        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Si la pantalla se agranda a escritorio, cerrar el menú móvil
    useEffect(() => {
        const media = window.matchMedia('(min-width: 901px)');
        const handleChange = (e) => {
            if (e.matches) setIsOpen(false);
        };
        media.addEventListener('change', handleChange);
        return () => media.removeEventListener('change', handleChange);
    }, []);

    const handleSelect = (section) => {
        setSelectedSection(section);
        setIsOpen(false);
    };

    return (
        <>
            {/* Barra superior: solo visible en móvil/tablet */}
            <header className={styles.topBar}>
                <button
                    type="button"
                    className={styles.menuButton}
                    onClick={() => setIsOpen(true)}
                    aria-label="Abrir menú"
                    aria-expanded={isOpen}
                    aria-controls="main-navigation"
                >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <line x1="4" y1="7" x2="20" y2="7" />
                        <line x1="4" y1="12" x2="20" y2="12" />
                        <line x1="4" y1="17" x2="20" y2="17" />
                    </svg>
                </button>

                <span className={styles.topBarTitle}>{selectedSection}</span>
            </header>

            {/* Fondo oscuro detrás del menú en móvil */}
            <div
                className={`${styles.backdrop} ${isOpen ? styles.backdropVisible : ''}`}
                onClick={() => setIsOpen(false)}
                aria-hidden="true"
            />

            {/* Menú lateral */}
            <nav
                id="main-navigation"
                className={`${styles.navBar} ${isOpen ? styles.navBarOpen : ''}`}
                aria-label="Navegación principal"
            >
                <div className={styles.navHeader}>
                    <span className={styles.navTitle}>Menú</span>

                    <button
                        type="button"
                        className={styles.closeButton}
                        onClick={() => setIsOpen(false)}
                        aria-label="Cerrar menú"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <line x1="6" y1="6" x2="18" y2="18" />
                            <line x1="18" y1="6" x2="6" y2="18" />
                        </svg>
                    </button>
                </div>

                <ul className={styles.navList}>
                    {SECTIONS.map((section) => {
                        const isActive = selectedSection === section;

                        return (
                            <li key={section}>
                                <button
                                    type="button"
                                    className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                                    onClick={() => handleSelect(section)}
                                    aria-current={isActive ? 'page' : undefined}
                                >
                                    {section}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </>
    );
}