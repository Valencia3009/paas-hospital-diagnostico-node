
const express = require("express");
const db = require("./database");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("public"));

// INFORMACIÓN GENERAL
app.get("/", (req, res) => {
    res.json({
        aplicacion: "Hospital de Diagnóstico",
        sistema: "Gestión de solicitudes de servicios",
        tecnologia: "Node.js, Express y PostgreSQL",
        estado: "Funcionando"
    });
});

// ESTADO DE LA API
app.get("/api/salud", (req, res) => {
    res.json({
        estado: "ok",
        mensaje: "API REST funcionando correctamente"
    });
});

// CONSULTAR TODAS LAS SOLICITUDES
app.get("/api/solicitudes", async (req, res) => {
    try {
        const resultado = await db.query(
            "SELECT * FROM solicitudes ORDER BY id DESC"
        );

        res.json(resultado.rows);
    } catch (error) {
        console.error("Error al consultar:", error.message);
        res.status(500).json({
            error: "No se pudieron consultar las solicitudes"
        });
    }
});

// CONSULTAR UNA SOLICITUD POR ID
app.get("/api/solicitudes/:id", async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
        return res.status(400).json({
            error: "Identificador inválido"
        });
    }

    try {
        const resultado = await db.query(
            "SELECT * FROM solicitudes WHERE id = $1",
            [id]
        );

        if (resultado.rowCount === 0) {
            return res.status(404).json({
                error: "Solicitud no encontrada"
            });
        }

        res.json(resultado.rows[0]);
    } catch (error) {
        console.error("Error al consultar:", error.message);
        res.status(500).json({
            error: "Error al consultar la solicitud"
        });
    }
});

// REGISTRAR UNA SOLICITUD
app.post("/api/solicitudes", async (req, res) => {
    const {
        solicitante,
        servicio,
        descripcion,
        prioridad = "Normal"
    } = req.body || {};

    if (
        typeof solicitante !== "string" ||
        !solicitante.trim() ||
        solicitante.length > 150 ||
        typeof servicio !== "string" ||
        !servicio.trim() ||
        servicio.length > 150 ||
        typeof descripcion !== "string" ||
        !descripcion.trim() ||
        !["Baja", "Normal", "Alta"].includes(prioridad)
    ) {
        return res.status(400).json({
            error: "Verifique los datos de la solicitud"
        });
    }

    try {
        const resultado = await db.query(
            `INSERT INTO solicitudes
             (solicitante, servicio, descripcion, prioridad)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [
                solicitante.trim(),
                servicio.trim(),
                descripcion.trim(),
                prioridad
            ]
        );

        res.status(201).json({
            mensaje: "Solicitud registrada correctamente",
            solicitud: resultado.rows[0]
        });
    } catch (error) {
        console.error("Error al registrar:", error.message);
        res.status(500).json({
            error: "No se pudo registrar la solicitud"
        });
    }
});

// ACTUALIZAR UNA SOLICITUD
app.put("/api/solicitudes/:id", async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
        return res.status(400).json({
            error: "Identificador inválido"
        });
    }

    const {
        solicitante,
        servicio,
        descripcion,
        prioridad,
        estado
    } = req.body || {};

    if (
        typeof solicitante !== "string" ||
        !solicitante.trim() ||
        solicitante.length > 150 ||
        typeof servicio !== "string" ||
        !servicio.trim() ||
        servicio.length > 150 ||
        typeof descripcion !== "string" ||
        !descripcion.trim() ||
        !["Baja", "Normal", "Alta"].includes(prioridad) ||
        !["Pendiente", "En proceso", "Completada", "Cancelada"].includes(estado)
    ) {
        return res.status(400).json({
            error: "Verifique los datos de actualización"
        });
    }

    try {
        const resultado = await db.query(
            `UPDATE solicitudes
             SET solicitante = $1,
                 servicio = $2,
                 descripcion = $3,
                 prioridad = $4,
                 estado = $5
             WHERE id = $6
             RETURNING *`,
            [
                solicitante.trim(),
                servicio.trim(),
                descripcion.trim(),
                prioridad,
                estado,
                id
            ]
        );

        if (resultado.rowCount === 0) {
            return res.status(404).json({
                error: "Solicitud no encontrada"
            });
        }

        res.json({
            mensaje: "Solicitud actualizada correctamente",
            solicitud: resultado.rows[0]
        });
    } catch (error) {
        console.error("Error al actualizar:", error.message);
        res.status(500).json({
            error: "No se pudo actualizar la solicitud"
        });
    }
});

// ELIMINAR UNA SOLICITUD
app.delete("/api/solicitudes/:id", async (req, res) => {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
        return res.status(400).json({
            error: "Identificador inválido"
        });
    }

    try {
        const resultado = await db.query(
            "DELETE FROM solicitudes WHERE id = $1 RETURNING id",
            [id]
        );

        if (resultado.rowCount === 0) {
            return res.status(404).json({
                error: "Solicitud no encontrada"
            });
        }

        res.json({
            mensaje: "Solicitud eliminada correctamente",
            id: resultado.rows[0].id
        });
    } catch (error) {
        console.error("Error al eliminar:", error.message);
        res.status(500).json({
            error: "No se pudo eliminar la solicitud"
        });
    }
});

// INICIAR EL SERVIDOR
app.listen(PORT, "0.0.0.0", () => {
    console.log(
        `API del Hospital de Diagnóstico ejecutándose en el puerto ${PORT}`
    );
});
