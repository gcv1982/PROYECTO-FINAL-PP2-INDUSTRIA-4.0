-- Migración Semana 4
-- Usar SOLO si la base de datos ya fue creada en Semana 3 con database.sql anterior
-- (si vas a crear la BD desde cero, usá directamente el nuevo database.sql y no este archivo)

ALTER TABLE LoteProduccion ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT TRUE;
ALTER TABLE MateriaPrima ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT TRUE;
