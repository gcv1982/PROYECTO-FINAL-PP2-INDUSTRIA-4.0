# Bitácora de uso de IA — Corrección de hallazgos H1 y H2 (S6, 30/09/2026)

| Campo | Detalle |
|---|---|
| Herramienta | Claude (tutor PP2) |
| Objetivo | Probar Update/Delete de las 4 entidades (deuda S4) y corregir los hallazgos críticos antes del flujo integral S6 |
| Consulta | Generar colección Postman de Update/Delete; luego corregir H1 y H2 detectados por esa colección |
| Resultado | Colección de 62 requests / 70 aserciones (`tests/postman/`). Antes de corregir: 61 OK / 9 fallan. Después: 67 OK / 3 fallan (H3–H5, deuda planificada para S9) |

## Hallazgos corregidos

**H1 — Escalada de privilegios en usuarios** (`backend/routes/usuarioRoutes.js`, `frontend/src/App.jsx`)
- Problema: POST/PUT/DELETE de `/api/usuarios` solo exigían token. Un usuario de Logística podía cambiarse el rol a Supervisión; uno de Calidad podía dar de baja a otros.
- Corrección: `verificarRol(['supervision'])` en las rutas de escritura. Los GET siguen abiertos a usuarios autenticados. La pantalla `/usuarios` queda solo para Supervisión.
- Revierte la decisión de S4 ("solo autenticado"), que las pruebas demostraron insegura.

**H2 — Materia prima reasignable** (`backend/models/materiaPrimaModel.js`, `backend/controllers/materiaPrimaController.js`)
- Problema: `asociarALote` no controlaba el estado. Una MP ya utilizada podía moverse a otro lote, y se perdía la trazabilidad hacia atrás del lote original. Tampoco validaba el lote: un lote inexistente daba 500 y uno finalizado aceptaba MP.
- Corrección: 404 si la MP o el lote no existen o están inactivos; 409 si la MP ya fue utilizada o el lote está finalizado. El UPDATE incluye `estado = 'disponible'` para evitar la doble asociación simultánea.

## Qué acepté / modifiqué / cómo lo probé
- Acepté: _(completar)_
- Modifiqué: _(completar)_
- Prueba: colección Postman corrida en mi entorno → resultado: _(completar con passed/failed)_
- Qué aprendí: _(completar con tus palabras — se pregunta en la defensa)_

## Pendiente (deuda técnica conocida, S9)
- H3: se puede editar el proveedor/QR de una MP ya utilizada.
- H4: editar un lote sin enviar `estado` lo reabre (`estado || 'en_proceso'`).
- H5: DELETE repetido responde 200 en lugar de 404.

---

# Bitácora de uso de IA — Escenario integral S6 (30/09/2026)

| Campo | Detalle |
|---|---|
| Herramienta | Claude (tutor PP2) |
| Objetivo | Evidenciar el flujo integral frontend → API → BD → interfaz sin capturas manuales |
| Resultado | Script `tests/e2e/escenario_s6.mjs` (Playwright): recorre 8 pasos en el navegador, guarda una captura por paso en `tests/e2e/evidencias/` y genera `tests/e2e/informe_s6.md` |

## Hallazgo H6 (detectado al preparar el escenario) — corregido
- Problema: la pantalla "Trazabilidad hacia adelante" llamaba a `GET /api/materia-prima/:id/trazabilidad`, pero ese endpoint **no existía** en el backend (la pantalla siempre mostraba "Error al buscar").
- Corrección: nuevo endpoint (`materiaPrimaRoutes.js`, `materiaPrimaController.obtenerTrazabilidad`, `materiaPrimaModel.getTrazabilidad`) que devuelve la MP, su proveedor de origen y el lote donde se utilizó.
- Mejora: la trazabilidad hacia atrás ahora incluye el **proveedor** y el **QR** de cada MP (antes solo el nombre), que es el objetivo del problema planteado en S1.

## Resultado de mi corrida
- Escenario S6: _(completar: X/8 pasos OK)_
- Colección Postman después de los cambios: _(completar: 67 passed / 3 failed esperado)_
