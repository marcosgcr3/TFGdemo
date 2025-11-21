"""
Script de migración para crear la tabla AtributoPersona
Permite asociar fechas de inicio/fin a cada atributo de una persona
"""

import sqlite3
import os
from sqlalchemy import create_engine, inspect, text
from datetime import datetime

# Configuración de la base de datos
DB_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "PICUVIMO.db")
DATABASE_URL = f"sqlite:///{DB_PATH}"

def create_atributo_persona_table(db_path):
    """Crea la tabla AtributoPersona si no existe"""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    print("🔧 Creando tabla AtributoPersona...")
    
    # Crear tabla AtributoPersona
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS AtributoPersona (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            persona_id INTEGER NOT NULL,
            nombre_atributo TEXT NOT NULL,
            valor TEXT NOT NULL,
            fecha_inicio TEXT,
            fecha_fin TEXT,
            notas TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (persona_id) REFERENCES Persona(id) ON DELETE CASCADE
        )
    """)
    
    # Crear índices para mejorar rendimiento
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_atributo_persona 
        ON AtributoPersona(persona_id, nombre_atributo)
    """)
    
    cursor.execute("""
        CREATE INDEX IF NOT EXISTS idx_atributo_fechas 
        ON AtributoPersona(persona_id, nombre_atributo, fecha_inicio, fecha_fin)
    """)
    
    conn.commit()
    print("✅ Tabla AtributoPersona creada exitosamente")
    
    return conn, cursor

def migrate_existing_dynamic_fields(db_path):
    """Migra los campos dinámicos existentes a AtributoPersona (opcional)"""
    engine = create_engine(f"sqlite:///{db_path}")
    
    with engine.connect() as conn:
        # Obtener todas las columnas de la tabla Persona
        inspector = inspect(engine)
        columns = inspector.get_columns('Persona')
        
        # Identificar columnas dinámicas (excluyendo las base)
        base_columns = ['id', 'Nombre', 'Primer_apellido']
        dynamic_columns = [col['name'] for col in columns if col['name'] not in base_columns]
        
        if not dynamic_columns:
            print("ℹ️  No hay columnas dinámicas para migrar")
            return
        
        print(f"📦 Encontradas {len(dynamic_columns)} columnas dinámicas: {', '.join(dynamic_columns)}")
        print("🔄 Migrando datos existentes a AtributoPersona...")
        
        # Obtener todas las personas
        result = conn.execute(text("SELECT id FROM Persona"))
        personas = result.fetchall()
        
        migrated_count = 0
        
        for persona in personas:
            persona_id = persona[0]
            
            # Para cada columna dinámica, obtener su valor
            for col_name in dynamic_columns:
                result = conn.execute(
                    text(f"SELECT {col_name} FROM Persona WHERE id = :id"),
                    {"id": persona_id}
                )
                row = result.fetchone()
                
                if row and row[0] is not None and row[0] != '':
                    valor = str(row[0])
                    
                    # Insertar en AtributoPersona sin fechas
                    conn.execute(
                        text("""
                            INSERT INTO AtributoPersona 
                            (persona_id, nombre_atributo, valor, notas)
                            VALUES (:persona_id, :nombre_atributo, :valor, :notas)
                        """),
                        {
                            "persona_id": persona_id,
                            "nombre_atributo": col_name,
                            "valor": valor,
                            "notas": "Migrado automáticamente desde columna original"
                        }
                    )
                    migrated_count += 1
        
        conn.commit()
        print(f"✅ {migrated_count} atributos migrados exitosamente")
        print("ℹ️  Nota: Las columnas originales se mantienen para compatibilidad")

def verify_migration(db_path):
    """Verifica que la migración fue exitosa"""
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    print("\n🔍 Verificando migración...")
    
    # Contar registros en AtributoPersona
    cursor.execute("SELECT COUNT(*) FROM AtributoPersona")
    count = cursor.fetchone()[0]
    print(f"✅ Total de atributos en AtributoPersona: {count}")
    
    # Mostrar algunos ejemplos
    cursor.execute("""
        SELECT p.Nombre, p.Primer_apellido, a.nombre_atributo, a.valor, 
               a.fecha_inicio, a.fecha_fin
        FROM AtributoPersona a
        JOIN Persona p ON a.persona_id = p.id
        LIMIT 5
    """)
    
    ejemplos = cursor.fetchall()
    if ejemplos:
        print("\n📋 Ejemplos de atributos migrados:")
        for ej in ejemplos:
            fechas = ""
            if ej[4] or ej[5]:
                fechas = f" ({ej[4] or '?'} → {ej[5] or 'presente'})"
            print(f"  - {ej[0]} {ej[1]}: {ej[2]} = '{ej[3]}'{fechas}")
    
    conn.close()

def create_backup(db_path):
    """Crea un backup de la base de datos antes de la migración"""
    backup_path = db_path.replace('.db', f'_backup_{datetime.now().strftime("%Y%m%d_%H%M%S")}.db')
    
    print(f"💾 Creando backup en: {backup_path}")
    
    import shutil
    shutil.copy2(db_path, backup_path)
    
    print(f"✅ Backup creado exitosamente")
    return backup_path

def main():
    """Ejecuta la migración completa"""
    print("="*70)
    print("🚀 MIGRACIÓN: Sistema de Atributos Temporales")
    print("="*70)
    
    if not os.path.exists(DB_PATH):
        print(f"❌ Error: No se encuentra la base de datos en {DB_PATH}")
        return
    
    print(f"\n📂 Base de datos: {DB_PATH}")
    
    # Crear backup
    try:
        backup_path = create_backup(DB_PATH)
        print(f"✅ Backup guardado en: {backup_path}")
    except Exception as e:
        print(f"⚠️  Advertencia: No se pudo crear backup: {e}")
        response = input("¿Continuar sin backup? (s/n): ")
        if response.lower() != 's':
            print("❌ Migración cancelada")
            return
    
    try:
        # Crear tabla
        conn, cursor = create_atributo_persona_table(DB_PATH)
        
        # Migrar datos existentes (opcional)
        migrate_existing_dynamic_fields(DB_PATH)
        
        # Verificar migración
        verify_migration(DB_PATH)
        
        conn.close()
        
        print("\n" + "="*70)
        print("✅ MIGRACIÓN COMPLETADA EXITOSAMENTE")
        print("="*70)
        print("\n📝 Próximos pasos:")
        print("  1. Reinicia el servidor backend")
        print("  2. Prueba crear nuevos atributos con fechas")
        print("  3. Los datos antiguos se mantienen para compatibilidad")
        
    except Exception as e:
        print(f"\n❌ Error durante la migración: {e}")
        print("💡 Puedes restaurar el backup si es necesario")
        raise

if __name__ == "__main__":
    main()
