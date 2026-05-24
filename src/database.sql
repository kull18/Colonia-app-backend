-- ============================================================
--  ColoniaApp — Script de base de datos
--  Motor: MySQL 8.0+
--  Fase 1: Auth + Gestión de Colonia + Relación Vecino-Colonia
-- ============================================================

CREATE DATABASE IF NOT EXISTS coloniaapp
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE coloniaapp;

-- ------------------------------------------------------------
-- 1. USERS
--    Almacena admins y vecinos en una sola tabla.
--    El campo `role` distingue el tipo de usuario.
-- ------------------------------------------------------------
CREATE TABLE users (
  id            CHAR(36)        NOT NULL DEFAULT (UUID()),
  nombre        VARCHAR(100)    NOT NULL,
  apellido      VARCHAR(100)    NOT NULL,
  email         VARCHAR(150)    NOT NULL,
  password_hash VARCHAR(255)    NOT NULL,
  role          ENUM('admin','vecino') NOT NULL DEFAULT 'vecino',
  activo        TINYINT(1)      NOT NULL DEFAULT 1,
  created_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
                                ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT pk_users        PRIMARY KEY (id),
  CONSTRAINT uq_users_email  UNIQUE (email)
);

-- ------------------------------------------------------------
-- 2. COLONIAS
--    Entidad principal del sistema.
--    `codigo_acceso` es la clave que el admin comparte con
--    sus vecinos para que soliciten unirse.
--    `activa` = 0 equivale a borrado lógico.
-- ------------------------------------------------------------
CREATE TABLE colonias (
  id             CHAR(36)     NOT NULL DEFAULT (UUID()),
  nombre         VARCHAR(150) NOT NULL,
  descripcion    TEXT,
  direccion      VARCHAR(255),
  municipio      VARCHAR(100),
  estado_rep     VARCHAR(100),               -- "estado" es palabra reservada en MySQL
  codigo_acceso  VARCHAR(20)  NOT NULL,
  imagen_url     VARCHAR(500),
  activa         TINYINT(1)   NOT NULL DEFAULT 1,
  created_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
                              ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT pk_colonias             PRIMARY KEY (id),
  CONSTRAINT uq_colonias_codigo      UNIQUE (codigo_acceso)
);

-- ------------------------------------------------------------
-- 3. ADMIN_COLONIA
--    Pivote entre USERS (role=admin) y COLONIAS.
--    Permite que un admin gestione más de una colonia
--    y que una colonia tenga más de un admin en el futuro.
-- ------------------------------------------------------------
CREATE TABLE admin_colonia (
  id          CHAR(36)  NOT NULL DEFAULT (UUID()),
  user_id     CHAR(36)  NOT NULL,
  colonia_id  CHAR(36)  NOT NULL,
  assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT pk_admin_colonia          PRIMARY KEY (id),
  CONSTRAINT uq_admin_colonia_par      UNIQUE (user_id, colonia_id),
  CONSTRAINT fk_admin_colonia_user     FOREIGN KEY (user_id)
      REFERENCES users (id)
      ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_admin_colonia_colonia  FOREIGN KEY (colonia_id)
      REFERENCES colonias (id)
      ON UPDATE CASCADE ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- 4. VECINO_COLONIA
--    Pivote entre USERS (role=vecino) y COLONIAS.
--    `estado` maneja el flujo de aprobación:
--      pendiente  -> el vecino mandó solicitud
--      aprobado   -> el admin lo aceptó (tiene acceso)
--      rechazado  -> el admin lo rechazó
--      bloqueado  -> fue aprobado pero luego suspendido
--    `numero_casa` va aquí porque es dato de la colonia,
--    no del usuario en general.
-- ------------------------------------------------------------
CREATE TABLE vecino_colonia (
  id           CHAR(36)  NOT NULL DEFAULT (UUID()),
  user_id      CHAR(36)  NOT NULL,
  colonia_id   CHAR(36)  NOT NULL,
  numero_casa  VARCHAR(20),
  estado       ENUM('pendiente','aprobado','rechazado','bloqueado')
                         NOT NULL DEFAULT 'pendiente',
  joined_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                         ON UPDATE CURRENT_TIMESTAMP,

  CONSTRAINT pk_vecino_colonia         PRIMARY KEY (id),
  CONSTRAINT uq_vecino_colonia_par     UNIQUE (user_id, colonia_id),
  CONSTRAINT fk_vecino_colonia_user    FOREIGN KEY (user_id)
      REFERENCES users (id)
      ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_vecino_colonia_colonia FOREIGN KEY (colonia_id)
      REFERENCES colonias (id)
      ON UPDATE CASCADE ON DELETE CASCADE
);

-- ------------------------------------------------------------
-- ÍNDICES adicionales para consultas frecuentes
-- ------------------------------------------------------------

-- Buscar vecinos de una colonia filtrados por estado (uso frecuente del admin)
CREATE INDEX idx_vecino_colonia_estado
  ON vecino_colonia (colonia_id, estado);

-- Buscar colonias activas por nombre
CREATE INDEX idx_colonias_nombre
  ON colonias (nombre, activa);

-- Buscar usuario por email rápidamente en el login
CREATE INDEX idx_users_email
  ON users (email);

-- ------------------------------------------------------------
-- DATOS DE PRUEBA
-- ------------------------------------------------------------

-- Admin de ejemplo (password: Admin123! — hash bcrypt de ejemplo)
INSERT INTO users (id, nombre, apellido, email, password_hash, role) VALUES
  ('11111111-1111-1111-1111-111111111111',
   'Carlos', 'Méndez',
   'admin@coloniaapp.com',
   '$2b$10$abcdefghijklmnopqrstuuVZ1234567890abcdefghijklmnopqrstu',
   'admin');

-- Colonia de ejemplo
INSERT INTO colonias (id, nombre, descripcion, direccion, municipio, estado_rep, codigo_acceso) VALUES
  ('22222222-2222-2222-2222-222222222222',
   'Colonia Las Flores',
   'Red de comunicación del fraccionamiento Las Flores.',
   'Av. Principal s/n',
   'Tuxtla Gutiérrez',
   'Chiapas',
   'FLORES2024');

-- Vincular admin con su colonia
INSERT INTO admin_colonia (user_id, colonia_id) VALUES
  ('11111111-1111-1111-1111-111111111111',
   '22222222-2222-2222-2222-222222222222');

-- Vecino de ejemplo (password: Vecino123!)
INSERT INTO users (id, nombre, apellido, email, password_hash, role) VALUES
  ('33333333-3333-3333-3333-333333333333',
   'María', 'López',
   'maria@ejemplo.com',
   '$2b$10$abcdefghijklmnopqrstuuVZ1234567890abcdefghijklmnopqrstu',
   'vecino');

-- Solicitud del vecino (pendiente de aprobación)
INSERT INTO vecino_colonia (user_id, colonia_id, numero_casa, estado) VALUES
  ('33333333-3333-3333-3333-333333333333',
   '22222222-2222-2222-2222-222222222222',
   'Casa 14',
   'pendiente');