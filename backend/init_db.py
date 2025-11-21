"""
Script para inicializar la base de datos PostgreSQL en Railway
Ejecuta esto una vez después de desplegar para crear las tablas y datos iniciales
"""
import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Obtener la URL de la base de datos de Railway
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("❌ ERROR: No se encontró DATABASE_URL")
    print("Este script debe ejecutarse en Railway o con DATABASE_URL configurado")
    exit(1)

# Ajustar el esquema si es necesario
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

print(f"🔗 Conectando a la base de datos...")

# Crear engine
engine = create_engine(DATABASE_URL)

# Crear las tablas usando el modelo de main.py
from main import Base, PersonaDB, AtributoTemporalDB, RelacionPersonaDB, ImagenPersonaDB, AtributoCustomDB

print("📋 Creando tablas...")
Base.metadata.create_all(bind=engine)
print("✅ Tablas creadas correctamente")

# Opcional: Insertar datos de prueba
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

try:
    # Verificar si ya hay datos
    count = db.query(PersonaDB).count()
    
    if count == 0:
        print("📦 Insertando datos de prueba...")
        
        # Crear una persona de ejemplo
        persona_ejemplo = PersonaDB(
            Nombre="María",
            Primer_apellido="García",
            Segundo_apellido="López",
            Sexo="F"
        )
        db.add(persona_ejemplo)
        db.commit()
        
        print("✅ Datos de prueba insertados")
    else:
        print(f"ℹ️ La base de datos ya tiene {count} persona(s)")
        
except Exception as e:
    print(f"❌ Error al insertar datos: {e}")
    db.rollback()
finally:
    db.close()

print("🎉 Inicialización completada")
