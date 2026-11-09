# Proyecto1Bases2

## Integrantes

### Keyner Cerdas Morales 2024108270
### Chedrick Uzaga Lopez 2021144175

## Objetivos alcanzados

Este proyecto podemos dividirlo en 2 grandes secciones y cada una con ciertas subsecciones

### Seccion de consultas
#### Clientes
    Se alcanzo a mostrar todos los clientes con sus respectivos filtros
#### Proveedores
    Se muestran todos los proveedores con sus respectivos filtros
#### Inventarios
    Se muestran los inventarios con sus respectivos filtros
#### Facturas (ventas) 
    Se muestran todas las facturas con sus respectivos filtros

### Seccion de mantenimiento (CRUD)
    Clientes, proveedores, inventarios y ventas permiten insertar, actualizar y eliminar.
    - Insertar (verde): abre un formulario vacío.
    - Actualizar (azul) y Eliminar (rojo): activan un modo de selección; al hacer clic
      en una card se abre el formulario con los datos actuales o la confirmación.
    - Los combos se llenan con GET /api/catalogs/:name (categorías, ciudades, personas, etc.).
    - Solo se pueden eliminar clientes, productos y proveedores sin historial
      (facturas, pedidos o transacciones). Al eliminar una factura se eliminan
      también sus líneas y las transacciones que generó.

### Seccion de estadisticas
    Para este proyecto hay 10 estadisticas a mostrar y se lograraon mostrar las 10 estadisticas
    con sus rrespectivos filtros
## Objetivos alcanzados
    Se alcanzaron todos los objetivos mencionados anteriormente
    No hubo ningun objetivo que no se pudiera alcanzar
    A nivel grafico se muestran todas las buenas practicas de diseno de una GUI

## Enlace al video demostrativo 
https://youtu.be/U95mnKQBYxU

## Configuración y ejecución

### Base de datos (WideWorldImporters)
Ejecutar los scripts de la carpeta `DBProcedures` en este orden:
1. `sinonimos.sql`
2. `clientesProcedures.sql`, `proveedoresProcedures.sql`, `inventariosProcedures.sql`, `ventasProcedures.sql`
3. `CrudProcedures.sql` (insertar, actualizar y eliminar)
4. `catalogosProcedures.sql` (catálogos de los formularios)
5. `estadisticas1to5.sql`, `estadisticas6to10.sql`

Todos usan `CREATE OR ALTER`, así que se pueden volver a ejecutar sin borrar nada.

### API (`API/proyectos`)
1. Copiar `.env.example` a `.env` y completar los datos. `DB_NAME` debe ser `WideWorldImporters`.
2. `npm install`
3. `npm run dev`

### Frontend (`FRONTEND/FRONTEND`)
1. Copiar `.env.example` a `.env` y poner en `VITE_API_KEY` la misma llave que `API_KEY` de la API.
2. `npm install`
3. `npm run dev`

