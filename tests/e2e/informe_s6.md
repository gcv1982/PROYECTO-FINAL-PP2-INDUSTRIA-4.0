# Escenario integral S6 — Evidencia automática

- Fecha de ejecución: 30/9/2026, 12:09:49
- Frontend: http://127.0.0.1:5199 · API: http://localhost:3000/api
- Resultado: **8/8 pasos OK**
- Datos de la corrida: MP "Leche entera S6-983316" (id 7, QR MP-1790780987173), lote L-S6-983316 (id 8), proveedor "Lácteos Varillas S6-983316"

| Paso | Acción | Esperado | Resultado | Captura |
|---|---|---|---|---|
| 1 | Login de Supervisión | Navbar con nombre y rol (supervision) | ✅ OK | [paso1.png](evidencias/paso1.png) |
| 2 | Calidad registra materia prima con QR | Mensaje verde con ID y código QR | ✅ OK — MP id 7, QR MP-1790780987173 | [paso2.png](evidencias/paso2.png) |
| 3 | Logística crea lote de producción | Mensaje verde con ID y código de lote | ✅ OK — Lote id 8, código L-S6-983316 | [paso3.png](evidencias/paso3.png) |
| 4 | Logística asocia la MP al lote | Mensaje verde de asociación correcta | ✅ OK | [paso4.png](evidencias/paso4.png) |
| 5 | La MP utilizada no puede reasignarse (H2) | La MP ya no aparece en la lista y la API responde 409 | ✅ OK — API: HTTP 409 — La materia prima ya fue utilizada en otro lote y no puede reasignarse | [paso5.png](evidencias/paso5.png) |
| 6 | Trazabilidad hacia adelante (MP → lote) | Muestra proveedor y el lote L-S6-983316 | ✅ OK | [paso6.png](evidencias/paso6.png) |
| 7 | Trazabilidad hacia atrás (lote → MP → proveedor) | Muestra Leche entera S6-983316 y su proveedor | ✅ OK | [paso7.png](evidencias/paso7.png) |
| 8 | Logística intenta entrar a /usuarios (H1) | Pantalla "Acceso denegado" | ✅ OK | [paso8.png](evidencias/paso8.png) |
