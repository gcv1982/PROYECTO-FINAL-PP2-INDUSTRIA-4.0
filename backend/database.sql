
-- Script de creación de base de datos
-- Sistema de Trazabilidad por QR para Lotes de Producción - Helaspi
-- Motor: PostgreSQL (cambio autorizado por el docente, reemplaza MySQL)
-- Orden de creación: respeta las dependencias de FOREIGN KEY

-- 1. Proveedor (sin dependencias)
CREATE TABLE Proveedor (
  id_proveedor SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  contacto VARCHAR(100),
  telefono VARCHAR(20),
  activo BOOLEAN DEFAULT TRUE
);

-- 2. Usuario (sin dependencias)
CREATE TABLE Usuario (
  id_usuario SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  rol VARCHAR(20) NOT NULL CHECK (rol IN ('calidad','logistica','supervision')),
  activo BOOLEAN DEFAULT TRUE
);

-- 3. LoteProduccion (depende de Usuario)
CREATE TABLE LoteProduccion (
  id_lote_produccion SERIAL PRIMARY KEY,
  codigo_lote VARCHAR(50) NOT NULL UNIQUE,
  fecha_produccion DATE NOT NULL,
  producto VARCHAR(100) NOT NULL,
  cantidad_producida DECIMAL(10,2),
  unidad_medida VARCHAR(20),
  estado VARCHAR(20) DEFAULT 'en_proceso' CHECK (estado IN ('en_proceso','finalizado')),
  id_usuario_responsable INT NOT NULL,
  FOREIGN KEY (id_usuario_responsable) REFERENCES Usuario(id_usuario)
);

-- 4. MateriaPrima (depende de Proveedor y LoteProduccion)
CREATE TABLE MateriaPrima (
  id_materia_prima SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  codigo_qr VARCHAR(255) UNIQUE,
  estado VARCHAR(20) DEFAULT 'disponible' CHECK (estado IN ('disponible','utilizada')),
  fecha_ingreso DATE NOT NULL,
  id_proveedor INT NOT NULL,
  id_lote_produccion INT NULL,
  FOREIGN KEY (id_proveedor) REFERENCES Proveedor(id_proveedor),
  FOREIGN KEY (id_lote_produccion) REFERENCES LoteProduccion(id_lote_produccion)
);