
const API = "/api/solicitudes";

const formulario = document.getElementById("formulario");
const tabla = document.getElementById("tablaSolicitudes");
const mensaje = document.getElementById("mensaje");
const tituloFormulario = document.getElementById("tituloFormulario");
const botonGuardar = document.getElementById("botonGuardar");
const botonCancelar = document.getElementById("botonCancelar");

const solicitante = document.getElementById("solicitante");
const servicio = document.getElementById("servicio");
const descripcion = document.getElementById("descripcion");
const prioridad = document.getElementById("prioridad");
const estado = document.getElementById("estado");

let solicitudEnEdicion = null;
let solicitudes = [];

function mostrarMensaje(texto, esError = false) {
    mensaje.textContent = texto;
    mensaje.style.color = esError ? "#b91c1c" : "#15803d";
}

function agregarCelda(fila, contenido) {
    const celda = document.createElement("td");
    celda.textContent = contenido;
    fila.appendChild(celda);
    return celda;
}

// CONSULTAR SOLICITUDES
async function cargarSolicitudes() {
    try {
        const respuesta = await fetch(API);

        if (!respuesta.ok) {
            throw new Error("No se pudieron consultar las solicitudes");
        }

        solicitudes = await respuesta.json();
        tabla.replaceChildren();

        if (solicitudes.length === 0) {
            const fila = document.createElement("tr");
            const celda = document.createElement("td");

            celda.colSpan = 7;
            celda.textContent = "No hay solicitudes registradas.";

            fila.appendChild(celda);
            tabla.appendChild(fila);
            return;
        }

        solicitudes.forEach((solicitud) => {
            const fila = document.createElement("tr");

            agregarCelda(fila, solicitud.id);
            agregarCelda(fila, solicitud.solicitante);
            agregarCelda(fila, solicitud.servicio);
            agregarCelda(fila, solicitud.prioridad);
            agregarCelda(fila, solicitud.estado);

            const fecha = solicitud.fecha_registro
                ? new Date(solicitud.fecha_registro).toLocaleString("es-SV")
                : "";

            agregarCelda(fila, fecha);

            const celdaAcciones = document.createElement("td");

            const botonEditar = document.createElement("button");
            botonEditar.textContent = "Editar";
            botonEditar.className = "editar";
            botonEditar.type = "button";
            botonEditar.addEventListener("click", () => {
                editarSolicitud(solicitud.id);
            });

            const botonEliminar = document.createElement("button");
            botonEliminar.textContent = "Eliminar";
            botonEliminar.className = "eliminar";
            botonEliminar.type = "button";
            botonEliminar.addEventListener("click", () => {
                eliminarSolicitud(solicitud.id);
            });

            celdaAcciones.appendChild(botonEditar);
            celdaAcciones.appendChild(botonEliminar);
            fila.appendChild(celdaAcciones);

            tabla.appendChild(fila);
        });

    } catch (error) {
        tabla.replaceChildren();

        const fila = document.createElement("tr");
        const celda = document.createElement("td");

        celda.colSpan = 7;
        celda.textContent = "Error al cargar las solicitudes.";

        fila.appendChild(celda);
        tabla.appendChild(fila);

        mostrarMensaje(error.message, true);
    }
}

// REGISTRAR O ACTUALIZAR
formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const datos = {
        solicitante: solicitante.value.trim(),
        servicio: servicio.value.trim(),
        descripcion: descripcion.value.trim(),
        prioridad: prioridad.value
    };

    const editando = solicitudEnEdicion !== null;

    if (editando) {
        datos.estado = estado.value;
    }

    const url = editando
        ? `${API}/${solicitudEnEdicion}`
        : API;

    const metodo = editando ? "PUT" : "POST";

    botonGuardar.disabled = true;

    try {
        const respuesta = await fetch(url, {
            method: metodo,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(datos)
        });

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(
                resultado.error || "No se pudo guardar la solicitud"
            );
        }

        limpiarFormulario();
        await cargarSolicitudes();

        mostrarMensaje(
            editando
                ? "Solicitud actualizada correctamente."
                : "Solicitud registrada correctamente."
        );

    } catch (error) {
        mostrarMensaje(error.message, true);

    } finally {
        botonGuardar.disabled = false;
    }
});

// EDITAR
function editarSolicitud(id) {
    const solicitud = solicitudes.find(
        (elemento) => elemento.id === id
    );

    if (!solicitud) {
        mostrarMensaje("No se encontró la solicitud.", true);
        return;
    }

    solicitudEnEdicion = id;

    solicitante.value = solicitud.solicitante;
    servicio.value = solicitud.servicio;
    descripcion.value = solicitud.descripcion;
    prioridad.value = solicitud.prioridad;
    estado.value = solicitud.estado;

    estado.disabled = false;

    tituloFormulario.textContent = `Editar solicitud #${id}`;
    botonGuardar.textContent = "Guardar cambios";
    botonCancelar.hidden = false;

    mostrarMensaje("");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// ELIMINAR
async function eliminarSolicitud(id) {
    if (!confirm(`¿Deseas eliminar la solicitud #${id}?`)) {
        return;
    }

    try {
        const respuesta = await fetch(`${API}/${id}`, {
            method: "DELETE"
        });

        const resultado = await respuesta.json();

        if (!respuesta.ok) {
            throw new Error(
                resultado.error || "No se pudo eliminar la solicitud"
            );
        }

        if (solicitudEnEdicion === id) {
            limpiarFormulario();
        }

        await cargarSolicitudes();
        mostrarMensaje("Solicitud eliminada correctamente.");

    } catch (error) {
        mostrarMensaje(error.message, true);
    }
}

// LIMPIAR FORMULARIO
function limpiarFormulario() {
    formulario.reset();

    solicitudEnEdicion = null;

    estado.value = "Pendiente";
    estado.disabled = true;

    tituloFormulario.textContent = "Registrar nueva solicitud";
    botonGuardar.textContent = "Guardar solicitud";
    botonCancelar.hidden = true;
}

botonCancelar.addEventListener("click", () => {
    limpiarFormulario();
    mostrarMensaje("");
});

// CARGAR DATOS AL ABRIR LA PÁGINA
cargarSolicitudes();
