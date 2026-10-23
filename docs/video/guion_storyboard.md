# Guion / storyboard — Demo del sistema (máx. 50 seg, ajustable)

Para usar en otra app de video (CapCut, Canva, Pictory, un editor humano, etc.). Cada escena = 1 captura de `docs/capturas/` + texto. Los tiempos son orientativos; con narración en off subile 1-2 seg a cada escena.

| # | Duración | Imagen fuente | Título en pantalla | Texto / narración |
|---|---|---|---|---|
| 0 | 3s | (tarjeta de título, sin imagen) | **Sistema de Trazabilidad por QR** | "Helaspi — PP2 Industria 4.0 — Demo del sistema" |
| 1 | 4-5s | `01_login.png` | PASO 1 — Iniciar sesión | "Cada usuario entra con su email y contraseña; el rol define qué puede hacer." |
| 2 | 5s | `02_registrar_mp.png` | PASO 2 — Registrar materia prima | "Calidad registra la materia prima y el sistema genera el QR automáticamente." |
| 3 | 4-5s | `03_crear_lote.png` | PASO 3 — Crear lote de producción | "Logística crea el lote donde se va a usar la materia prima." |
| 4 | 4-5s | `04_asociar_lote.png` | PASO 4 — Asociar materia prima al lote | "Se asocia la materia prima disponible al lote de producción." |
| 5 | 5s | `05_trazabilidad_adelante.png` | PASO 5 — Trazabilidad hacia adelante | "Desde una materia prima, se ve en qué lote de producción se usó." |
| 6 | 5s | `06_trazabilidad_atras.png` | PASO 6 — Trazabilidad hacia atrás | "Desde un lote, se ve qué materias primas y proveedores lo componen." |
| 7 | 5s | `07_reportes.png` | PASO 7 — Tablero de KPIs | "Reportes filtrables por fecha y proveedor, con gráficos en tiempo real." |
| 8 | 4-5s | `08_usuarios.png` | PASO 8 — Gestión de usuarios | "Solo Supervisión puede crear, editar y dar de baja usuarios." |
| 9 | 4-5s | `09_sin_permiso.png` | PASO 9 — Control de acceso por rol | "Si el rol no tiene permiso, el sistema bloquea el acceso a esa sección." |
| 10 | 3s | (tarjeta de cierre, sin imagen) | **Gracias** | "Guillermo Vivas — Proyecto Final PP2" |

## Estilo visual
- Fondo: azul marino `#1C2B40` (el mismo del sistema).
- Acento: naranja `#F2A541` (para el número de paso).
- Tipografía: Arial / Calibri, bold en títulos.
- Transición entre escenas: corte simple o fundido (fade) de 0.3-0.5s.
- Formato: 16:9, 1920x1080, 25 fps.

## Lo que ya existe, armado y listo
- `docs/video/Demo_Sistema_Helaspi.mp4` — versión ya generada con este guion exacto (clips estáticos por captura, sin narración en audio).
- `docs/capturas/` — las 9 imágenes fuente, por si la otra app las necesita sueltas.

## Si se agrega narración
Dejé el texto de cada escena pensado para leerse en voz alta en el tiempo asignado (lectura normal, ~2.5 palabras/seg). Si se graba locución real, conviene extender cada escena 1-2 segundos para no apurar la lectura.
