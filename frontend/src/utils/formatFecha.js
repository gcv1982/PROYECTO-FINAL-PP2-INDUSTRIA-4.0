// Evita que una fecha guardada como DATE (ej. "2026-10-04") llegue con hora UTC
// (...T03:00:00.000Z) y el navegador la muestre un día antes por el huso horario.
export function formatFecha(fecha) {
  if (!fecha) return '';
  return new Date(fecha).toLocaleDateString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' });
}
