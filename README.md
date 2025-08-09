# ConciliaPe - Conciliación de Equipajes

Aplicación web moderna y responsiva para el registro y conciliación de equipajes por vuelo en aeropuertos.

## Descripción
ConciliaPe permite ingresar el código de vuelo y las cantidades de equipaje por categoría (Normales, Conexiones, Prioritarios, Stand by), generando automáticamente un mensaje listo para copiar o enviar por WhatsApp a los grupos de Counter. Pensada para uso rápido en dispositivos móviles y escritorio.

## Características
- Registro rápido de equipajes por vuelo y categoría.
- Detección automática de destino según código de vuelo.
- Cálculo automático del total de equipajes.
- Generación de mensaje listo para copiar o enviar por WhatsApp.
- Botón de reinicio para limpiar el formulario.
- Modal de ayuda accesible y clara.
- Persistencia automática de datos (localStorage, expira en 24h).
- Interfaz mobile-first, optimizada para 360x800px y otros dispositivos comunes.
- Accesibilidad y usabilidad mejoradas.

## Tecnologías
- HTML5 semántico
- CSS moderno (mobile-first, custom properties, responsivo)
- JavaScript vanilla (sin frameworks)
- Despliegue recomendado: Netlify, Vercel o servidor estático

## Instalación y uso
1. Clona o descarga este repositorio.
2. Asegúrate de que el archivo `favicon-96x96.png` esté en la raíz.
3. Abre `index.html` en tu navegador o sube el proyecto a tu hosting estático preferido.

## Estructura del proyecto
- `index.html`: Página principal y única.
- `src/css/styles.css`: Estilos globales y responsivos.
- `src/app.js`: Lógica de la aplicación.
- `favicon-96x96.png`: Favicon de la app.
- `README.md`: Este archivo.

## Colores de marca
- Verde: #91bd3c
- Azul: #1a3072
- Gris suave: #f5f5f5

## Autor
Hernan B. Apaza

---

Para dudas, mejoras o reportes, contacta al autor o revisa los archivos de planeación incluidos en el repositorio.
