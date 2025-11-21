-- ============================================
-- Script SQL para poblar base de datos PICUVIMO
-- ============================================

-- Limpiar tablas existentes (opcional - descomenta si quieres empezar desde cero)
-- DELETE FROM RelacionPersona;
-- DELETE FROM Persona;

-- ============================================
-- INSERTAR PERSONAS
-- ============================================

-- Familia García
INSERT INTO Persona (Nombre, Primer_apellido) 
VALUES ('Juan', 'García');

INSERT INTO Persona (Nombre, Primer_apellido) 
VALUES ('María', 'Rodríguez');

INSERT INTO Persona (Nombre, Primer_apellido) 
VALUES ('Carlos', 'García');

INSERT INTO Persona (Nombre, Primer_apellido) 
VALUES ('Ana', 'García');

INSERT INTO Persona (Nombre, Primer_apellido) 
VALUES ('Laura', 'Martínez');

-- Hijos de Carlos y Laura
INSERT INTO Persona (Nombre, Primer_apellido) 
VALUES ('Pedro', 'García');

INSERT INTO Persona (Nombre, Primer_apellido) 
VALUES ('Sofía', 'García');

-- Familia Pérez (amigos)
INSERT INTO Persona (Nombre, Primer_apellido) 
VALUES ('Roberto', 'Pérez');

INSERT INTO Persona (Nombre, Primer_apellido) 
VALUES ('Elena', 'Torres');

INSERT INTO Persona (Nombre, Primer_apellido) 
VALUES ('Miguel', 'Pérez');

-- Familia Sánchez
INSERT INTO Persona (Nombre, Primer_apellido) 
VALUES ('Antonio', 'Sánchez');

INSERT INTO Persona (Nombre, Primer_apellido) 
VALUES ('Carmen', 'Jiménez');

INSERT INTO Persona (Nombre, Primer_apellido) 
VALUES ('David', 'Sánchez');

INSERT INTO Persona (Nombre, Primer_apellido) 
VALUES ('Lucía', 'Sánchez');

-- Familia Fernández
INSERT INTO Persona (Nombre, Primer_apellido) 
VALUES ('Francisco', 'Fernández');

INSERT INTO Persona (Nombre, Primer_apellido) 
VALUES ('Rosa', 'Moreno');

INSERT INTO Persona (Nombre, Primer_apellido) 
VALUES ('Javier', 'Fernández');

INSERT INTO Persona (Nombre, Primer_apellido) 
VALUES ('Isabel', 'Fernández');

-- Familia López
INSERT INTO Persona (Nombre, Primer_apellido) 
VALUES ('Manuel', 'López');

INSERT INTO Persona (Nombre, Primer_apellido) 
VALUES ('Teresa', 'Ruiz');

INSERT INTO Persona (Nombre, Primer_apellido) 
VALUES ('Raúl', 'López');

INSERT INTO Persona (Nombre, Primer_apellido) 
VALUES ('Patricia', 'López');

-- Familia Gómez
INSERT INTO Persona (Nombre, Primer_apellido) 
VALUES ('José', 'Gómez');

INSERT INTO Persona (Nombre, Primer_apellido) 
VALUES ('Dolores', 'Martín');

INSERT INTO Persona (Nombre, Primer_apellido) 
VALUES ('Sergio', 'Gómez');

INSERT INTO Persona (Nombre, Primer_apellido) 
VALUES ('Marta', 'Gómez');

-- Personas solteras / otros
INSERT INTO Persona (Nombre, Primer_apellido) 
VALUES ('Alberto', 'Díaz');

INSERT INTO Persona (Nombre, Primer_apellido) 
VALUES ('Beatriz', 'Herrera');

INSERT INTO Persona (Nombre, Primer_apellido) 
VALUES ('Diego', 'Castro');

-- ============================================
-- INSERTAR RELACIONES FAMILIARES
-- ============================================

-- Juan y María son esposos
INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (1, 2, 'Esposo', 'familiar');

INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (2, 1, 'Esposa', 'familiar');

-- Carlos es hijo de Juan y María
INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (3, 1, 'Padre', 'familiar');

INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (3, 2, 'Madre', 'familiar');

INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (1, 3, 'Hijo', 'familiar');

INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (2, 3, 'Hijo', 'familiar');

-- Ana es hija de Juan y María
INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (4, 1, 'Padre', 'familiar');

INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (4, 2, 'Madre', 'familiar');

INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (1, 4, 'Hija', 'familiar');

INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (2, 4, 'Hija', 'familiar');

-- Carlos y Ana son hermanos
INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (3, 4, 'Hermana', 'familiar');

INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (4, 3, 'Hermano', 'familiar');

-- Carlos y Laura son esposos
INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (3, 5, 'Esposa', 'familiar');

INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (5, 3, 'Esposo', 'familiar');

-- Pedro es hijo de Carlos y Laura
INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (6, 3, 'Padre', 'familiar');

INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (6, 5, 'Madre', 'familiar');

INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (3, 6, 'Hijo', 'familiar');

INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (5, 6, 'Hijo', 'familiar');

-- Sofía es hija de Carlos y Laura
INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (7, 3, 'Padre', 'familiar');

INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (7, 5, 'Madre', 'familiar');

INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (3, 7, 'Hija', 'familiar');

INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (5, 7, 'Hija', 'familiar');

-- Pedro y Sofía son hermanos
INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (6, 7, 'Hermana', 'familiar');

INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (7, 6, 'Hermano', 'familiar');

-- Juan y María son abuelos de Pedro y Sofía
INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (6, 1, 'Abuelo', 'familiar');

INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (6, 2, 'Abuela', 'familiar');

INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (7, 1, 'Abuelo', 'familiar');

INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (7, 2, 'Abuela', 'familiar');

INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (1, 6, 'Nieto', 'familiar');

INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (1, 7, 'Nieta', 'familiar');

INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (2, 6, 'Nieto', 'familiar');

INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (2, 7, 'Nieta', 'familiar');

-- ============================================
-- INSERTAR RELACIONES DE OTRO TIPO (amigos, trabajo, etc.)
-- ============================================

-- Roberto y Elena son esposos
INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (8, 9, 'Esposa', 'familiar');

INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (9, 8, 'Esposo', 'familiar');

-- Miguel es hijo de Roberto y Elena
INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (10, 8, 'Padre', 'familiar');

INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (10, 9, 'Madre', 'familiar');

INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (8, 10, 'Hijo', 'familiar');

INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (9, 10, 'Hijo', 'familiar');

-- Carlos y Roberto son amigos
INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (3, 8, 'Amigo', 'otro');

INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (8, 3, 'Amigo', 'otro');

-- Laura y Elena son amigas
INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (5, 9, 'Amiga', 'otro');

INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (9, 5, 'Amiga', 'otro');

-- Pedro y Miguel son compañeros de clase
INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (6, 10, 'Compañero', 'otro');

INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (10, 6, 'Compañero', 'otro');

-- Carlos y Roberto son compañeros de trabajo
INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (3, 8, 'Compañero de trabajo', 'otro');

INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (8, 3, 'Compañero de trabajo', 'otro');

-- ============================================
-- FAMILIA SÁNCHEZ - Relaciones familiares
-- ============================================

-- Antonio y Carmen son esposos
INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (11, 12, 'Esposa', 'familiar');

INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (12, 11, 'Esposo', 'familiar');

-- David es hijo de Antonio y Carmen
INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (13, 11, 'Padre', 'familiar');

INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (13, 12, 'Madre', 'familiar');

INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (11, 13, 'Hijo', 'familiar');

INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (12, 13, 'Hijo', 'familiar');

-- Lucía es hija de Antonio y Carmen
INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (14, 11, 'Padre', 'familiar');

INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (14, 12, 'Madre', 'familiar');

INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (11, 14, 'Hija', 'familiar');

INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (12, 14, 'Hija', 'familiar');

-- David y Lucía son hermanos
INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (13, 14, 'Hermana', 'familiar');

INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (14, 13, 'Hermano', 'familiar');

-- ============================================
-- FAMILIA FERNÁNDEZ - Relaciones familiares
-- ============================================

-- Francisco y Rosa son esposos
INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (15, 16, 'Esposa', 'familiar');

INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (16, 15, 'Esposo', 'familiar');

-- Javier es hijo de Francisco y Rosa
INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (17, 15, 'Padre', 'familiar');

INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (17, 16, 'Madre', 'familiar');

INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (15, 17, 'Hijo', 'familiar');

INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (16, 17, 'Hijo', 'familiar');

-- Isabel es hija de Francisco y Rosa
INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (18, 15, 'Padre', 'familiar');

INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (18, 16, 'Madre', 'familiar');

INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (15, 18, 'Hija', 'familiar');

INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (16, 18, 'Hija', 'familiar');

-- Javier e Isabel son hermanos
INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (17, 18, 'Hermana', 'familiar');

INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (18, 17, 'Hermano', 'familiar');

-- ============================================
-- FAMILIA LÓPEZ - Relaciones familiares
-- ============================================

-- Manuel y Teresa son esposos
INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (19, 20, 'Esposa', 'familiar');

INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (20, 19, 'Esposo', 'familiar');

-- Raúl es hijo de Manuel y Teresa
INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (21, 19, 'Padre', 'familiar');

INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (21, 20, 'Madre', 'familiar');

INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (19, 21, 'Hijo', 'familiar');

INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (20, 21, 'Hijo', 'familiar');

-- Patricia es hija de Manuel y Teresa
INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (22, 19, 'Padre', 'familiar');

INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (22, 20, 'Madre', 'familiar');

INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (19, 22, 'Hija', 'familiar');

INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (20, 22, 'Hija', 'familiar');

-- Raúl y Patricia son hermanos
INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (21, 22, 'Hermana', 'familiar');

INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (22, 21, 'Hermano', 'familiar');

-- ============================================
-- FAMILIA GÓMEZ - Relaciones familiares
-- ============================================

-- José y Dolores son esposos
INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (23, 24, 'Esposa', 'familiar');

INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (24, 23, 'Esposo', 'familiar');

-- Sergio es hijo de José y Dolores
INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (25, 23, 'Padre', 'familiar');

INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (25, 24, 'Madre', 'familiar');

INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (23, 25, 'Hijo', 'familiar');

INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (24, 25, 'Hijo', 'familiar');

-- Marta es hija de José y Dolores
INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (26, 23, 'Padre', 'familiar');

INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (26, 24, 'Madre', 'familiar');

INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (23, 26, 'Hija', 'familiar');

INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (24, 26, 'Hija', 'familiar');

-- Sergio y Marta son hermanos
INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (25, 26, 'Hermana', 'familiar');

INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (26, 25, 'Hermano', 'familiar');

-- ============================================
-- RELACIONES INTER-FAMILIARES (primos, tíos, etc.)
-- ============================================

-- Ana y David son primos (sus padres son hermanos en este ejemplo)
INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (4, 13, 'Prima', 'familiar');

INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (13, 4, 'Primo', 'familiar');

-- ============================================
-- MÁS RELACIONES DE OTRO TIPO
-- ============================================

-- David y Miguel son amigos
INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (13, 10, 'Amigo', 'otro');

INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (10, 13, 'Amigo', 'otro');

-- Lucía y Sofía son amigas
INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (14, 7, 'Amiga', 'otro');

INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (7, 14, 'Amiga', 'otro');

-- Javier y Pedro son compañeros de equipo
INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (17, 6, 'Compañero de equipo', 'otro');

INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (6, 17, 'Compañero de equipo', 'otro');

-- Alberto es jefe de Carlos
INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (3, 27, 'Jefe', 'otro');

INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (27, 3, 'Empleado', 'otro');

-- Beatriz y Laura son vecinas
INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (28, 5, 'Vecina', 'otro');

INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (5, 28, 'Vecina', 'otro');

-- Diego y Roberto son socios de negocios
INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (29, 8, 'Socio', 'otro');

INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (8, 29, 'Socio', 'otro');

-- Antonio y Francisco son cuñados
INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (11, 15, 'Cuñado', 'familiar');

INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (15, 11, 'Cuñado', 'familiar');

-- Raúl y Sergio son compañeros de clase
INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (21, 25, 'Compañero', 'otro');

INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (25, 21, 'Compañero', 'otro');

-- Patricia y Marta son amigas
INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (22, 26, 'Amiga', 'otro');

INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (26, 22, 'Amiga', 'otro');

-- Isabel y Ana son colegas
INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (18, 4, 'Colega', 'otro');

INSERT INTO RelacionPersona (persona_id, persona_relacionada_id, tipo_relacion, categoria)
VALUES (4, 18, 'Colega', 'otro');

-- ============================================
-- AÑADIR ALGUNOS ATRIBUTOS PERSONALIZADOS
-- ============================================

-- Añadir profesiones (ejemplo de cómo añadir columnas personalizadas)
-- Nota: Primero hay que crear estas columnas en la tabla si no existen

-- ALTER TABLE Persona ADD COLUMN Profesion TEXT;
-- ALTER TABLE Persona ADD COLUMN Ciudad TEXT;
-- ALTER TABLE Persona ADD COLUMN Email TEXT;

-- UPDATE Persona SET Profesion = 'Ingeniero' WHERE id = 1;
-- UPDATE Persona SET Profesion = 'Profesora' WHERE id = 2;
-- UPDATE Persona SET Profesion = 'Médico' WHERE id = 3;
-- UPDATE Persona SET Profesion = 'Arquitecta' WHERE id = 4;
-- UPDATE Persona SET Profesion = 'Enfermera' WHERE id = 5;
-- UPDATE Persona SET Profesion = 'Estudiante' WHERE id = 6;
-- UPDATE Persona SET Profesion = 'Estudiante' WHERE id = 7;
-- UPDATE Persona SET Profesion = 'Abogado' WHERE id = 8;
-- UPDATE Persona SET Profesion = 'Diseñadora' WHERE id = 9;
-- UPDATE Persona SET Profesion = 'Estudiante' WHERE id = 10;

-- ============================================
-- VERIFICAR DATOS INSERTADOS
-- ============================================

-- Ver todas las personas
-- SELECT * FROM Persona;

-- Ver todas las relaciones
-- SELECT 
--     p1.Nombre || ' ' || p1.Primer_apellido as Persona,
--     r.tipo_relacion as Relacion,
--     r.categoria as Categoria,
--     p2.Nombre || ' ' || p2.Primer_apellido as Relacionado
-- FROM RelacionPersona r
-- JOIN Persona p1 ON r.persona_id = p1.id
-- JOIN Persona p2 ON r.persona_relacionada_id = p2.id
-- ORDER BY p1.id, r.categoria, r.tipo_relacion;

-- Ver solo relaciones familiares
-- SELECT 
--     p1.Nombre || ' ' || p1.Primer_apellido as Persona,
--     r.tipo_relacion as Relacion,
--     p2.Nombre || ' ' || p2.Primer_apellido as Relacionado
-- FROM RelacionPersona r
-- JOIN Persona p1 ON r.persona_id = p1.id
-- JOIN Persona p2 ON r.persona_relacionada_id = p2.id
-- WHERE r.categoria = 'familiar'
-- ORDER BY p1.id;

-- Ver solo relaciones de otro tipo
-- SELECT 
--     p1.Nombre || ' ' || p1.Primer_apellido as Persona,
--     r.tipo_relacion as Relacion,
--     p2.Nombre || ' ' || p2.Primer_apellido as Relacionado
-- FROM RelacionPersona r
-- JOIN Persona p1 ON r.persona_id = p1.id
-- JOIN Persona p2 ON r.persona_relacionada_id = p2.id
-- WHERE r.categoria = 'otro'
-- ORDER BY p1.id;

-- ============================================
-- RESUMEN DE DATOS INSERTADOS
-- ============================================
-- 30 Personas distribuidas en:
--   
--   FAMILIA GARCÍA (7 personas):
--   - Juan García (Abuelo)
--   - María Rodríguez (Abuela)
--   - Carlos García (Padre)
--   - Ana García (Tía)
--   - Laura Martínez (Madre)
--   - Pedro García (Hijo)
--   - Sofía García (Hija)
--
--   FAMILIA PÉREZ (3 personas):
--   - Roberto Pérez (Padre)
--   - Elena Torres (Madre)
--   - Miguel Pérez (Hijo)
--
--   FAMILIA SÁNCHEZ (4 personas):
--   - Antonio Sánchez (Padre)
--   - Carmen Jiménez (Madre)
--   - David Sánchez (Hijo)
--   - Lucía Sánchez (Hija)
--
--   FAMILIA FERNÁNDEZ (4 personas):
--   - Francisco Fernández (Padre)
--   - Rosa Moreno (Madre)
--   - Javier Fernández (Hijo)
--   - Isabel Fernández (Hija)
--
--   FAMILIA LÓPEZ (4 personas):
--   - Manuel López (Padre)
--   - Teresa Ruiz (Madre)
--   - Raúl López (Hijo)
--   - Patricia López (Hija)
--
--   FAMILIA GÓMEZ (4 personas):
--   - José Gómez (Padre)
--   - Dolores Martín (Madre)
--   - Sergio Gómez (Hijo)
--   - Marta Gómez (Hija)
--
--   OTROS (4 personas):
--   - Alberto Díaz
--   - Beatriz Herrera
--   - Diego Castro
--
-- RELACIONES:
--   Familiares: ~90 (Esposo/Esposa, Padre/Madre, Hijo/Hija, Hermano/Hermana, Abuelo/Abuela, Nieto/Nieta, Cuñado, Primo)
--   Otras: ~24 (Amigo, Amiga, Compañero, Compañero de trabajo, Jefe, Empleado, Vecina, Socio, Colega, Compañero de equipo)
--
-- Total aproximado: 114 relaciones
-- ============================================
