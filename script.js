// ===== 1. Configuración =====
const URL_GEOCODIFICACION = "https://geocoding-api.open-meteo.com/v1/search";
const URL_CLIMA = "https://api.open-meteo.com/v1/forecast";

// Códigos del clima (estándar WMO) → texto y emoji
const CODIGOS_CLIMA = {
    0: { texto: "Cielo despejado", icono: "☀️" },
    1: { texto: "Mayormente despejado", icono: "🌤️" },
    2: { texto: "Parcialmente nublado", icono: "⛅" },
    3: { texto: "Nublado", icono: "☁️" },
    45: { texto: "Niebla", icono: "🌫️" },
    48: { texto: "Niebla con escarcha", icono: "🌫️" },
    51: { texto: "Llovizna ligera", icono: "🌦️" },
    53: { texto: "Llovizna moderada", icono: "🌦️" },
    55: { texto: "Llovizna intensa", icono: "🌧️" },
    56: { texto: "Llovizna helada ligera", icono: "🌧️" },
    57: { texto: "Llovizna helada intensa", icono: "🌧️" },
    61: { texto: "Lluvia ligera", icono: "🌧️" },
    63: { texto: "Lluvia moderada", icono: "🌧️" },
    65: { texto: "Lluvia fuerte", icono: "🌧️" },
    66: { texto: "Lluvia helada ligera", icono: "🌧️" },
    67: { texto: "Lluvia helada fuerte", icono: "🌧️" },
    71: { texto: "Nevada ligera", icono: "🌨️" },
    73: { texto: "Nevada moderada", icono: "🌨️" },
    75: { texto: "Nevada fuerte", icono: "❄️" },
    77: { texto: "Granos de nieve", icono: "❄️" },
    80: { texto: "Chubascos ligeros", icono: "🌦️" },
    81: { texto: "Chubascos moderados", icono: "🌧️" },
    82: { texto: "Chubascos violentos", icono: "⛈️" },
    85: { texto: "Chubascos de nieve", icono: "🌨️" },
    86: { texto: "Chubascos de nieve fuertes", icono: "❄️" },
    95: { texto: "Tormenta eléctrica", icono: "⛈️" },
    96: { texto: "Tormenta con granizo", icono: "⛈️" },
    99: { texto: "Tormenta con granizo fuerte", icono: "⛈️" },
};

// ===== 2. Referencias al HTML =====
const formulario = document.getElementById("formulario");
const entrada = document.getElementById("ciudad");
const botonBuscar = document.getElementById("buscar");
const mensaje = document.getElementById("mensaje");
const clima = document.getElementById("clima");
const ubicacion = document.getElementById("ubicacion");
const icono = document.getElementById("icono");
const temperatura = document.getElementById("temperatura");
const descripcion = document.getElementById("descripcion");
const sensacion = document.getElementById("sensacion");
const humedad = document.getElementById("humedad");
const viento = document.getElementById("viento");

// ===== 3. Funciones de interfaz =====
function mostrarMensaje(texto, tipo = "") {
    mensaje.textContent = texto;
    mensaje.className = tipo ? `mensaje ${tipo}` : "mensaje";
}

function mostrarClima(lugar, actual) {
    const info = CODIGOS_CLIMA[actual.weather_code] ?? { texto: "Sin descripción", icono: "🌡️" };

    // Nombre, región (si existe) y país
    const partes = [lugar.name, lugar.admin1, lugar.country].filter(Boolean);
    ubicacion.textContent = partes.join(", ");

    icono.textContent = info.icono;
    temperatura.textContent = `${Math.round(actual.temperature_2m)}°C`;
    descripcion.textContent = info.texto;
    sensacion.textContent = `${Math.round(actual.apparent_temperature)}°C`;
    humedad.textContent = `${actual.relative_humidity_2m}%`;
    viento.textContent = `${Math.round(actual.wind_speed_10m)} km/h`;

    clima.classList.remove("oculto");
}

function establecerCargando(cargando) {
    botonBuscar.disabled = cargando;
    entrada.disabled = cargando;
}

// ===== 4. Funciones que hablan con la API =====
async function obtenerJSON(url) {
    const respuesta = await fetch(url);
    // fetch NO falla con errores 404 o 500: hay que revisarlo a mano
    if (!respuesta.ok) {
        throw new Error(`Error del servidor (${respuesta.status})`);
    }
    return respuesta.json();
}

// Llamada 1: nombre de ciudad → coordenadas
async function buscarCiudad(nombre) {
    const parametros = new URLSearchParams({
        name: nombre,
        count: 1,
        language: "es",
        format: "json",
    });
    const datos = await obtenerJSON(`${URL_GEOCODIFICACION}?${parametros}`);

    // Si no hay coincidencias, la API no manda "results"
    if (!datos.results || datos.results.length === 0) return null;
    return datos.results[0];
}

// Llamada 2: coordenadas → clima actual
async function obtenerClima(latitud, longitud) {
    const parametros = new URLSearchParams({
        latitude: latitud,
        longitude: longitud,
        current: "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m",
        timezone: "auto",
    });
    const datos = await obtenerJSON(`${URL_CLIMA}?${parametros}`);
    return datos.current;
}

// ===== 5. Flujo principal =====
async function buscarClima(nombreCiudad) {
    establecerCargando(true);
    clima.classList.add("oculto");
    mostrarMensaje("Buscando...", "cargando");

    try {
        const lugar = await buscarCiudad(nombreCiudad);

        if (lugar === null) {
            mostrarMensaje(`No encontré la ciudad "${nombreCiudad}". Revisa el nombre.`, "error");
            return;
        }

        const actual = await obtenerClima(lugar.latitude, lugar.longitude);
        mostrarClima(lugar, actual);
        mostrarMensaje("");
        try {
            localStorage.setItem("ultimaCiudad", nombreCiudad);
        } catch (error) {
            console.warn("No se pudo guardar la ciudad en localStorage:", error);
        }
    } catch (error) {
        console.error(error); // el detalle técnico queda en la consola
        mostrarMensaje("No se pudo obtener el clima. Revisa tu conexión e intenta de nuevo.", "error");
    } finally {
        // finally se ejecuta siempre: con éxito, con error y con return
        establecerCargando(false);
        entrada.focus();
    }
}

// ===== 6. Eventos =====
formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();

    const nombre = entrada.value.trim();
    if (nombre === "") {
        mostrarMensaje("Escribe el nombre de una ciudad.", "error");
        return;
    }

    buscarClima(nombre);
});

// ===== 7. Al abrir la página =====
clima.classList.add("oculto"); // ocultamos los datos de ejemplo

let ultimaCiudad = null;
try {
    ultimaCiudad = localStorage.getItem("ultimaCiudad");
} catch (error) {
    console.warn("No se pudo leer localStorage:", error);
}

if (ultimaCiudad) {
    entrada.value = ultimaCiudad;
    buscarClima(ultimaCiudad);
} else {
    mostrarMensaje("Escribe una ciudad para ver su clima.");
}