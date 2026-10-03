# App del clima

Aplicación web que muestra el clima actual de cualquier ciudad del mundo, hecha con HTML, CSS y JavaScript puro.

**Demo en vivo:** https://iimartin1.github.io/app-del-clima/

## Características
- Búsqueda por nombre de ciudad
- Temperatura, sensación térmica, humedad y viento
- Descripción y emoji según el código del clima
- Estados de carga y manejo de errores (ciudad inexistente, sin conexión)
- Recuerda la última ciudad buscada (localStorage)
- Diseño responsive

## Tecnologías
- HTML5
- CSS3 (Flexbox y Grid)
- JavaScript (ES6, async/await, fetch)
- API: [Open-Meteo](https://open-meteo.com/) (geocodificación y pronóstico, sin API key)

## Lo que aprendí
- Consumir una API externa con `fetch` y `async/await`
- Encadenar dos llamadas dependientes (ciudad → coordenadas → clima)
- Manejar errores con `try/catch/finally` y revisar `response.ok`
- Armar URLs seguras con `URLSearchParams`
- Traducir códigos de la API a texto con un objeto de datos
- Diseñar los estados de una interfaz: inicio, cargando, éxito y error