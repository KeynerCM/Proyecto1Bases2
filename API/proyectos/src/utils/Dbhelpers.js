// ========================================
// Utilidades compartidas por los controladores
// ========================================

// Códigos de error de SQL Server -> códigos HTTP
const SQL_ERROR_STATUS = {
    50001: 404, // THROW propio: el registro no existe
    50002: 409, // THROW propio: duplicado o registro en uso
    50003: 400, // THROW propio: datos inválidos
    2627: 409,  // Violación de UNIQUE / PRIMARY KEY
    2601: 409,  // Índice único duplicado
    547: 400,   // FK o CHECK: algún ID de catálogo no existe
    515: 400    // Se intentó guardar NULL en una columna obligatoria
};

const handleSqlError = (res, error, fallbackMessage) => {
    console.error(error);

    const status = SQL_ERROR_STATUS[error.number] || 500;

    let message = fallbackMessage;
    if (error.number >= 50000) {
        // Los THROW de los procedimientos ya traen un mensaje para el usuario
        message = error.message;
    } else if (status !== 500) {
        message = `${fallbackMessage}: ${error.message}`;
    }

    res.status(status).json({ message });
};

// Convierte undefined y '' (campos vacíos de un formulario) en null
const orNull = (value) => (value === undefined || value === '' ? null : value);

// Devuelve la lista de campos obligatorios que faltan en el body
const missingFields = (body, fields) =>
    fields.filter((field) => orNull(body?.[field]) === null);

// Valida que el :id de la ruta sea un entero positivo
const parseId = (value) => {
    const id = Number(value);
    return Number.isInteger(id) && id > 0 ? id : null;
};

module.exports = {
    handleSqlError,
    orNull,
    missingFields,
    parseId
};