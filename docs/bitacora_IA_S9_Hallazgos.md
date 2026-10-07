# Bitácora de uso de IA — Corrección de H3, H4, H5 y limpieza del tablero (S9, 06/10/2026)

| Campo | Detalle |
|---|---|
| Herramienta | Asistente de IA (tutor PP2). Sección "Qué aprendí": redacción propia, corregida con IA en los puntos técnicos de H4 y H5 |
| Objetivo | Saldar los 3 hallazgos pendientes desde S6 (H3, H4, H5) y limpiar los datos de prueba que ensuciaban el tablero de KPIs de S8 |
| Consulta | Diagnóstico de los 3 bugs y dos alternativas para cada decisión abierta (alcance del bloqueo de H3, y cómo limpiar el tablero) |
| Resultado | Newman: 70/70 (antes 67/70). Tablero de KPIs sin proveedores dados de baja mezclados con los reales |

## Hallazgos corregidos

**H3 — Se puede editar una MP ya utilizada** (`backend/controllers/materiaPrimaController.js`)
- Problema: `actualizar` no consultaba el `estado` antes del UPDATE, así que se podía cambiar el proveedor, la fecha de ingreso o el QR de una materia prima que ya estaba asociada a un lote — eso rompe la trazabilidad hacia atrás, que depende de que esos datos originales no cambien después de usarse.
- Decisión: bloqueo total (si `estado === 'utilizada'`, 409 ante cualquier edición), no bloqueo parcial. Reutiliza el mismo patrón de H2 (`getById` + verificar estado + 409 antes del UPDATE). Elegí el bloqueo total porque es más simple de defender ("lo que entró a un lote no se toca") y porque un bloqueo parcial agregaba lógica y casos de prueba nuevos sin un beneficio claro para este sistema.

**H4 — Editar un lote sin enviar `estado` lo reabre** (`backend/controllers/loteProduccionController.js`)
- Problema: `estado: estado || 'en_proceso'` pisaba el estado con `'en_proceso'` cada vez que el campo no venía en el body, aunque el lote estuviera `finalizado`.
- Corrección: se consulta el lote actual antes del UPDATE y, si no viene `estado`, se conserva el valor que ya tenía (`estado || loteActual.estado`) en vez de defaultear.

**H5 — Un DELETE repetido devuelve 200 en vez de 404** (`darDeBaja` en `proveedorModel.js`, `materiaPrimaModel.js`, `loteProduccionModel.js` y `usuarioModel.js`)
- Problema: el UPDATE de baja lógica hacía `WHERE id = $1`, sin `AND activo = true`. Encontraba la fila aunque ya estuviera dada de baja, y la "apagaba" de nuevo sin error.
- Corrección: se agregó `AND activo = true` al WHERE en las 4 entidades (el hallazgo original solo mencionaba Proveedor, pero el mismo patrón estaba repetido en Materia Prima, Lote de Producción y Usuario, así que se corrigieron las 4 para no dejar la misma falla en otro lado).

## Limpieza del tablero de KPIs (decisión B)
Entre seed de datos de demo (B1) y filtrar `activo = true` en la consulta (B2), elegí **B2**: se agregó `AND p.activo = true` al JOIN de `mpPorProveedor` en `backend/models/reporteModel.js`. Es un cambio de una línea y alcanza para sacar del tablero a los proveedores que quedaron dados de baja durante las pruebas (los que la colección de Postman crea y da de baja en el mismo run). Queda como limitación conocida que los proveedores de prueba que *no* se dieron de baja (los que el runner deja activos) van a seguir apareciendo — ver "Limitación conocida".

## Qué acepté / modifiqué / cómo lo probé
- Acepté: el diagnóstico de los 3 bugs y la pista de reutilizar el patrón de H2 para H3.
- Modifiqué: extendí la corrección de H5 a las 4 entidades en vez de solo Proveedor, porque el mismo bug estaba en los otros 3 modelos.
- Prueba: corrí la colección de Postman con Newman (CLI) contra una instancia propia del backend con los 3 fixes aplicados → resultado: 70 passed / 0 failed, exportado a `tests/postman/resultados_s9.json`.

## Qué aprendí

**H5**
- El segundo `DELETE` devolvía 200 porque el `WHERE id = $1` no tenía en cuenta si el registro ya estaba dado de baja. Encontraba la fila igual, la volvía a marcar `activo = false` y el `RETURNING` la devolvía, así que el controller respondía como si todo estuviera bien.
- Aprendí que en una baja lógica no se borra nada, se hace un `UPDATE`. Al agregar `AND activo = true` al `WHERE`, un registro que ya fue dado de baja no cumple la condición, el `RETURNING` viene vacío, `rows[0]` queda `undefined` y el controller responde **404**. Ese es el comportamiento correcto.

**H4**
- `estado || 'en_proceso'` era peligroso porque `||` es un O lógico: si `estado` no venía en el body (`undefined`), se usaba `'en_proceso'` aunque el lote ya estuviera `finalizado`, y así se reabría sin que nadie lo pidiera.
- Aprendí que el `DEFAULT` de una columna solo se aplica al hacer un `INSERT`, nunca en un `UPDATE`. Cuando un campo no viene en el body de una edición, lo correcto es conservar el valor actual del registro (`loteActual.estado`), no reemplazarlo por un valor fijo.

**H3 y H2**
- Una materia prima que ya está en un lote no debería poder editarse porque rompe la trazabilidad.
- La trazabilidad exige que cada lote conserve el registro exacto de qué materias primas se usaron, de qué proveedor vinieron, con qué fecha de ingreso y con qué código QR. Si esos datos se modifican después, se pierde la capacidad de reconstruir el origen del producto y de garantizar calidad, seguridad o auditoría.
- En otras palabras: lo que ya se registró en un lote debe quedar inmutable para que el seguimiento sea confiable.

## Limitación conocida
- Filtro B2 del tablero: un proveedor de prueba que quede `activo` (no dado de baja) sigue apareciendo en el gráfico de materia prima por proveedor. Si molesta en la defensa, la alternativa es B1 (seed de datos de demo).
