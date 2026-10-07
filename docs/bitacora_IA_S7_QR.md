# Bitácora de uso de IA — Funcionalidad del KIT: etiqueta QR (S7, 02/10/2026)

| Campo | Detalle |
|---|---|
| Herramienta | Asistente de IA (tutor PP2) |
| Objetivo | Cumplir la funcionalidad específica del KIT AVZ-03: que la materia prima tenga una **etiqueta QR real** (imagen) y que al escanearla se acceda a su trazabilidad. Hasta S6 el "QR" era solo un texto (`MP-<timestamp>`). |
| Consulta | Cómo generar la imagen QR al registrar una MP y cómo leerla para abrir la trazabilidad; en qué archivos del proyecto colocar cada parte. |
| Resultado | Generación del QR en el frontend con `qrcode.react` + lectura con la cámara del celular (el QR codifica una URL a la pantalla de trazabilidad). |

## Decisión de diseño
La IA presentó dos alternativas:

| | Opción A (elegida) | Opción B (descartada) |
|---|---|---|
| Generación | Frontend (`qrcode.react`) | Backend (`qrcode`) + endpoint |
| Lectura | Cámara del celular abre una URL | Pantalla "Escanear QR" dentro de la app (`html5-qrcode`) |
| Esfuerzo | Bajo | Medio |

Elegí la **Opción A** por plazo (S7 ya estaba atrasada) y porque reutiliza la pantalla y el endpoint de trazabilidad existentes sin tocar el backend.

**Criterio del QR:** el código guarda solo una URL con el ID de la materia prima (`/trazabilidad/adelante?id=<id>`), no los datos. Los datos siguen en PostgreSQL, por lo que la etiqueta impresa nunca queda desactualizada.

## Cambios realizados
- `frontend/src/pages/RegistrarMPPage.jsx`: al registrar la MP se muestra el QR (`QRCodeCanvas`) con botón **Descargar etiqueta** (PNG).
- `frontend/src/pages/TrazabilidadAdelantePage.jsx`: si la URL trae `?id=`, la búsqueda se ejecuta sola (`useSearchParams` + `useEffect`). La búsqueda manual sigue funcionando igual.
- `frontend/src/services/api.js`: `baseURL` se toma de `VITE_API_URL` (para que el celular llegue al backend; en el celular `localhost` es el propio celular).
- `frontend/.env` (no se sube a GitHub): `VITE_APP_URL` y `VITE_API_URL` con la IP de la PC.
- Sin cambios en backend ni en `App.jsx` (la ruta ya existía; CORS ya estaba abierto).

## Correcciones a la propuesta de la IA
- La primera propuesta apuntaba el QR a **Trazabilidad hacia atrás** y buscaba por **código**. Al revisar el repositorio se detectó que en este proyecto la pantalla que parte de una MP es **hacia adelante** y que el endpoint busca por **ID** (`GET /api/materia-prima/:id/trazabilidad`). Se corrigió antes de implementar.
- Al pegar los 3 archivos generados por la IA en el proyecto, se encontraron y corrigieron 3 errores antes de poder probarlos: en `RegistrarMPPage.jsx` se guardaba el resultado del QR (`setMpCreada`) antes de que existieran los datos de la respuesta del backend; en `TrazabilidadAdelantePage.jsx` faltaba el `import` de `api`; y `api.js` todavía tenía la URL del backend fija en `localhost` en vez de leerla de `VITE_API_URL`.

## Qué acepté / modifiqué / cómo lo probé
- Acepté: la opción A (QR con URL + cámara del celular) y la estructura del código propuesto.
- Modifiqué: integré el código a mano en mis archivos en lugar de reemplazarlos completos.
- Prueba: registré la MP "Crispines" (ID 8) → se mostró el QR → descargué el PNG → lo escaneé con el celular en la misma red → se abrió la trazabilidad de esa MP: OK.
- Evidencias: `tests/evidencias_s7/01_qr_generado.jpg` (PC, MP registrada con QR en pantalla), `tests/evidencias_s7/02_celular_trazabilidad.jpg` (celular, trazabilidad abierta al escanear), `tests/evidencias_s7/03_etiqueta_QR_MP-8.png` (etiqueta PNG descargada)
- Qué aprendí: aprendí a generar un código QR para cada materia prima y a seguirla dentro de la planta: al escanear el QR se ve de qué proveedor vino y en qué lote de producción se usó.

## Limitaciones conocidas
- La lectura depende de que el celular esté en la misma red que la PC y tenga sesión iniciada (la ruta está protegida por JWT).
- Mejora futura: lector integrado en la app (Opción B), útil si la planta no tiene celulares disponibles en el depósito.
