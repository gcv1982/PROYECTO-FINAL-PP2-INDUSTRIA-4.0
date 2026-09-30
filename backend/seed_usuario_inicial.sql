-- Usuario semilla para poder hacer el primer login sin tener que desproteger rutas.
-- Rol: supervision (el más amplio en la matriz de permisos)
-- Email: admin@helaspi.com
-- Password: helaspi2026   (cambiala después del primer login en un entorno real)

INSERT INTO Usuario (nombre, email, password_hash, rol, activo)
VALUES (
  'Administrador Inicial',
  'admin@helaspi.com',
  '$2b$10$bWCNpEYPtJVEvc8fSgxiLOPC24/Wpze44wO80WpHohouFmt3Y49FG',
  'supervision',
  true
);
