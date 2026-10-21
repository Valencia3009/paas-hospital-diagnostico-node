
CREATE TABLE IF NOT EXISTS solicitudes (
    id SERIAL PRIMARY KEY,

    solicitante VARCHAR(150) NOT NULL,

    servicio VARCHAR(150) NOT NULL,

    descripcion TEXT NOT NULL,

    prioridad VARCHAR(20) NOT NULL DEFAULT 'Normal'
        CHECK (prioridad IN ('Baja', 'Normal', 'Alta')),

    estado VARCHAR(30) NOT NULL DEFAULT 'Pendiente'
        CHECK (
            estado IN (
                'Pendiente',
                'En proceso',
                'Completada',
                'Cancelada'
            )
        ),

    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
