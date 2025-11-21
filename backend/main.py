import uvicorn
import os
import uuid
import base64
import logging
from datetime import datetime, date
from pathlib import Path
from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, StreamingResponse
from asyncio import Queue
import asyncio
import json
from pydantic import BaseModel, validator
from typing import List, Dict, Any, Optional, Union
from sqlalchemy import create_engine, Column, Integer, String, text, ForeignKey, or_
from sqlalchemy.orm import sessionmaker, Session, relationship
from sqlalchemy.ext.declarative import declarative_base

# Setup de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
logging.getLogger("uvicorn.access").setLevel(logging.WARNING)  # Demasiado ruido con cada request

# Intentar cargar el chatbot con Ollama
try:
    from chatbot_service import get_chatbot_service
    CHATBOT_ENABLED = True
    print("Chatbot habilitado (Ollama)")
except ImportError as e:
    print(f"Chatbot no disponible: {e}")
    CHATBOT_ENABLED = False

# Config de la BD
# En producción usa PostgreSQL, en desarrollo SQLite
DATABASE_URL = os.getenv("DATABASE_URL")
DB_PATH = None  # Inicializar DB_PATH

if DATABASE_URL:
    # Railway proporciona DATABASE_URL, pero necesitamos ajustar el esquema
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    SQLALCHEMY_DATABASE_URL = DATABASE_URL
    print("🐘 Usando PostgreSQL (Producción)")
else:
    # Desarrollo local con SQLite
    DB_PATH = "../data/PICUVIMO.db"
    SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"
    print("📁 Usando SQLite (Desarrollo)")

# Carpeta para las imágenes
IMAGENES_DIR = Path("../data/imagenes")
IMAGENES_DIR.mkdir(parents=True, exist_ok=True)

def get_registered_images():
    """Saca la lista de imágenes que están en la BD"""
    try:
        db = SessionLocal()
        try:
            imagenes = db.query(ImagenPersonaDB.ruta_archivo).all()
            return [img.ruta_archivo for img in imagenes]
        finally:
            db.close()
    except Exception as e:
        print(f"Error obteniendo imágenes: {e}")
        return []

# Configurar el engine según el tipo de base de datos
if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, 
        connect_args={"check_same_thread": False}
    )
else:
    # PostgreSQL no necesita check_same_thread
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Modelo SQLAlchemy para la tabla Persona
class PersonaDB(Base):
    __tablename__ = "Persona"
    
    id = Column(Integer, primary_key=True, index=True)
    Nombre = Column(String, index=True)
    Primer_apellido = Column(String, index=True)

# Modelo SQLAlchemy para las relaciones entre personas
class RelacionPersonaDB(Base):
    __tablename__ = "RelacionPersona"
    
    id = Column(Integer, primary_key=True, index=True)
    persona_id = Column(Integer, ForeignKey("Persona.id"), nullable=False)
    persona_relacionada_id = Column(Integer, ForeignKey("Persona.id"), nullable=False)
    tipo_relacion = Column(String, nullable=False)  # ej: "hijo de", "padre de", "esposo de"
    categoria = Column(String, nullable=False, default='familiar')  # 'familiar' o 'otro'
    
    # Relaciones
    persona = relationship("PersonaDB", foreign_keys=[persona_id])
    persona_relacionada = relationship("PersonaDB", foreign_keys=[persona_relacionada_id])

# Modelo SQLAlchemy para las imágenes de las personas
class ImagenPersonaDB(Base):
    __tablename__ = "ImagenPersona"
    
    id = Column(Integer, primary_key=True, index=True)
    persona_id = Column(Integer, ForeignKey("Persona.id"), nullable=False)
    nombre_imagen = Column(String, nullable=False)  # ej: "retrato", "cuadro", "fotografía"
    ruta_archivo = Column(String, nullable=False)  # Ruta relativa del archivo (ej: "persona_36_retrato_uuid.jpg")
    
    # Relación
    persona = relationship("PersonaDB", foreign_keys=[persona_id])

# Modelo SQLAlchemy para atributos temporales de personas
class AtributoPersonaDB(Base):
    __tablename__ = "AtributoPersona"
    
    id = Column(Integer, primary_key=True, index=True)
    persona_id = Column(Integer, ForeignKey("Persona.id"), nullable=False)
    nombre_atributo = Column(String, nullable=False)  # ej: "colegio", "trabajo", "ciudad"
    valor = Column(String, nullable=False)  # ej: "IES Madrid"
    fecha_inicio = Column(String, nullable=True)  # formato: "DD-MM-YYYY" o "00-00-2005"
    fecha_fin = Column(String, nullable=True)  # formato: "DD-MM-YYYY" o NULL si es actual
    notas = Column(String, nullable=True)  # Notas adicionales opcionales
    created_at = Column(String, default=lambda: datetime.now().isoformat())
    updated_at = Column(String, default=lambda: datetime.now().isoformat())
    
    # Relación
    persona = relationship("PersonaDB", foreign_keys=[persona_id])

# Modelos Pydantic
class PersonaBase(BaseModel):
    Nombre: str
    Primer_apellido: str

class PersonaCreate(PersonaBase):
    pass

class Persona(BaseModel):
    id: int
    Nombre: str
    Primer_apellido: str
    
    class Config:
        from_attributes = True

class RelacionRequest(BaseModel):
    tipo_relacion: str  # ej: "hijo de", "padre de"
    categoria: str = 'familiar'  # 'familiar' o 'otro'
    persona_relacionada_id: Optional[int] = None  # Si existe en la BD
    nombre_nuevo: Optional[str] = None  # Si hay que crear nueva persona
    apellido_nuevo: Optional[str] = None  # Si hay que crear nueva persona

class RelacionResponse(BaseModel):
    id: int
    tipo_relacion: str
    categoria: str
    persona_relacionada: Dict[str, Any]  # Info de la persona relacionada
    
    class Config:
        from_attributes = True

class ImagenRequest(BaseModel):
    nombre_imagen: str  # ej: "retrato", "cuadro", "fotografía"
    imagen_data: str  # Base64 encoded image (se convertirá a archivo)

class ImagenResponse(BaseModel):
    id: int
    persona_id: int
    nombre_imagen: str
    url: str  # URL para acceder a la imagen
    
    class Config:
        from_attributes = True

# Modelos para Atributos Temporales
class AtributoTemporalRequest(BaseModel):
    nombre_atributo: str  # ej: "colegio", "trabajo", "ciudad"
    valor: str  # ej: "IES Madrid"
    fecha_inicio: Optional[str] = None  # formato: "DD-MM-YYYY" o "00-00-2005" o "00-MM-YYYY"
    fecha_fin: Optional[str] = None  # formato: "DD-MM-YYYY" o NULL
    notas: Optional[str] = None

    @validator('fecha_inicio', 'fecha_fin')
    def validate_fecha_parcial(cls, v):
        """Valida que las fechas parciales tengan el formato correcto"""
        if v is None or v == '':
            return None
        
        # Formato esperado: DD-MM-YYYY donde DD o MM pueden ser 00
        parts = v.split('-')
        if len(parts) != 3:
            raise ValueError('Formato de fecha debe ser DD-MM-YYYY (ej: 15-03-2005, 00-03-2005, 00-00-2005)')
        
        try:
            dia, mes, anio = parts
            dia_int = int(dia)
            mes_int = int(mes)
            anio_int = int(anio)
            
            # Validar rangos
            if not (0 <= dia_int <= 31):
                raise ValueError('Día debe estar entre 00 y 31')
            if not (0 <= mes_int <= 12):
                raise ValueError('Mes debe estar entre 00 y 12')
            if not (1 <= anio_int <= 9999):
                raise ValueError('Año debe ser válido')
            
            return v
        except ValueError as e:
            raise ValueError(f'Error en formato de fecha: {str(e)}')

class AtributoTemporalResponse(BaseModel):
    id: int
    persona_id: int
    nombre_atributo: str
    valor: str
    fecha_inicio: Optional[str] = None
    fecha_fin: Optional[str] = None
    notas: Optional[str] = None
    created_at: str
    updated_at: str
    
    class Config:
        from_attributes = True

class SearchFilters(BaseModel):
    search_text: Optional[str] = None  # Búsqueda por nombre/apellido
    atributo_filters: Optional[Dict[str, str]] = {}  # Filtros por atributos temporales: {nombre_atributo: valor_buscado}

# Función simplificada para obtener personas
def get_persona_with_dynamic_fields(db: Session, persona_id: int = None):
    if persona_id:
        persona = db.query(PersonaDB).filter(PersonaDB.id == persona_id).first()
        if not persona:
            return None
        return {
            "id": persona.id,
            "Nombre": persona.Nombre,
            "Primer_apellido": persona.Primer_apellido
        }
    else:
        personas = db.query(PersonaDB).all()
        return [
            {
                "id": p.id,
                "Nombre": p.Nombre,
                "Primer_apellido": p.Primer_apellido
            }
            for p in personas
        ]

# Funciones para manejar relaciones entre personas
def create_relacion(db: Session, persona_id: int, relacion_data: RelacionRequest):
    """Crear una relación entre dos personas"""
    try:
        # Si necesitamos crear una nueva persona
        if relacion_data.nombre_nuevo and relacion_data.apellido_nuevo:
            # Crear nueva persona
            nueva_persona = PersonaDB(
                Nombre=relacion_data.nombre_nuevo,
                Primer_apellido=relacion_data.apellido_nuevo
            )
            db.add(nueva_persona)
            db.flush()  # Para obtener el ID
            persona_relacionada_id = nueva_persona.id
            print(f"✅ Nueva persona creada: {relacion_data.nombre_nuevo} {relacion_data.apellido_nuevo} (ID: {persona_relacionada_id})")
        else:
            # Usar persona existente
            persona_relacionada_id = relacion_data.persona_relacionada_id
            
            # Verificar que la persona existe
            persona_existente = db.query(PersonaDB).filter(PersonaDB.id == persona_relacionada_id).first()
            if not persona_existente:
                raise HTTPException(status_code=404, detail="Persona relacionada no encontrada")
        
        # Crear la relación
        nueva_relacion = RelacionPersonaDB(
            persona_id=persona_id,
            persona_relacionada_id=persona_relacionada_id,
            tipo_relacion=relacion_data.tipo_relacion,
            categoria=relacion_data.categoria
        )
        
        db.add(nueva_relacion)
        db.commit()
        
        print(f"✅ Relación creada: Persona {persona_id} es '{relacion_data.tipo_relacion}' de Persona {persona_relacionada_id}")
        return nueva_relacion
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error creando relación: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error creando relación: {str(e)}")

def get_relaciones_persona(db: Session, persona_id: int):
    """Obtener todas las relaciones de una persona"""
    try:
        relaciones = db.query(RelacionPersonaDB).filter(RelacionPersonaDB.persona_id == persona_id).all()
        
        resultado = []
        for relacion in relaciones:
            persona_relacionada = db.query(PersonaDB).filter(PersonaDB.id == relacion.persona_relacionada_id).first()
            
            resultado.append({
                "id": relacion.id,
                "tipo_relacion": relacion.tipo_relacion,
                "categoria": relacion.categoria if hasattr(relacion, 'categoria') else 'familiar',
                "persona_relacionada": {
                    "id": persona_relacionada.id,
                    "Nombre": persona_relacionada.Nombre,
                    "Primer_apellido": persona_relacionada.Primer_apellido
                }
            })
        
        return resultado
        
    except Exception as e:
        print(f"❌ Error obteniendo relaciones: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error obteniendo relaciones: {str(e)}")



# Dependency para obtener la sesión de la base de datos
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
app = FastAPI(debug=True)

# Evento de inicio
@app.on_event("startup")
async def startup_event():
    """Inicialización al arrancar la aplicación"""
    print("🚀 Iniciando aplicación...")
    
    # Crear las tablas si no existen
    Base.metadata.create_all(bind=engine)
    print("✅ Tablas de base de datos verificadas")

@app.on_event("shutdown")
async def shutdown_event():
    """Limpieza al cerrar la aplicación"""
    print("\n🛑 Cerrando aplicación...")
    print("✅ Aplicación cerrada\n")

# Configurar CORS - permitir Vercel y localhost
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https://.*\.vercel\.app",  # Todos los dominios de Vercel
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint para Railway
@app.get("/health")
def health_check():
    return {"status": "healthy", "database": "connected"}

# Endpoints para Personas
@app.get("/personas/", response_model=List[Persona])
def get_personas(db: Session = Depends(get_db)):
    personas_data = get_persona_with_dynamic_fields(db)
    print(f"📋 Consultando personas: {len(personas_data)} encontradas")
    return personas_data

@app.post("/personas/", response_model=Persona)
def create_persona(persona: PersonaCreate, db: Session = Depends(get_db)):
    print(f"📝 Creando nueva persona: {persona.Nombre} {persona.Primer_apellido}")
    
    try:
        # Crear la persona con los campos base
        new_persona_db = PersonaDB(
            Nombre=persona.Nombre,
            Primer_apellido=persona.Primer_apellido
        )
        db.add(new_persona_db)
        db.commit()
        db.refresh(new_persona_db)
        
        print(f"✅ Persona creada exitosamente con ID: {new_persona_db.id}")
        
        return {
            "id": new_persona_db.id,
            "Nombre": new_persona_db.Nombre,
            "Primer_apellido": new_persona_db.Primer_apellido
        }
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error creando persona: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error creando persona: {str(e)}")

@app.get("/personas/{persona_id}", response_model=Persona)
def get_persona(persona_id: int, db: Session = Depends(get_db)):
    persona = get_persona_with_dynamic_fields(db, persona_id)
    if persona is None:
        raise HTTPException(status_code=404, detail="Persona no encontrada")
    return persona

# Nuevo endpoint para búsqueda avanzada con filtros
@app.post("/personas/search/", response_model=List[Persona])
def search_personas_advanced(filters: SearchFilters, db: Session = Depends(get_db)):
    print(f"🔍 Búsqueda avanzada con filtros: {filters}")
    
    try:
        # Consulta base
        query = db.query(PersonaDB)
        
        # Filtro de texto (nombre/apellido)
        if filters.search_text and filters.search_text.strip():
            search_term = f"%{filters.search_text.strip()}%"
            query = query.filter(
                or_(
                    PersonaDB.Nombre.ilike(search_term),
                    PersonaDB.Primer_apellido.ilike(search_term)
                )
            )
        
        # Filtros por atributos temporales
        if filters.atributo_filters:
            for nombre_atributo, valor_buscado in filters.atributo_filters.items():
                if valor_buscado and valor_buscado.strip():
                    # Buscar personas que tengan este atributo con un valor que contenga el texto buscado
                    subquery = db.query(AtributoPersonaDB.persona_id).filter(
                        AtributoPersonaDB.nombre_atributo == nombre_atributo,
                        AtributoPersonaDB.valor.ilike(f"%{valor_buscado.strip()}%")
                    ).distinct()
                    
                    query = query.filter(PersonaDB.id.in_(subquery))
        
        personas_db = query.all()
        
        # Construir resultados
        personas = [
            {
                "id": p.id,
                "Nombre": p.Nombre,
                "Primer_apellido": p.Primer_apellido
            }
            for p in personas_db
        ]
        
        print(f"✅ Búsqueda completada: {len(personas)} resultados encontrados")
        return personas
        
    except Exception as e:
        print(f"❌ Error en búsqueda avanzada: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error en búsqueda: {str(e)}")

# Endpoint para obtener nombres de atributos únicos (para filtros de búsqueda)
@app.get("/personas/atributos/nombres/")
def get_atributos_nombres(db: Session = Depends(get_db)):
    """Obtener todos los nombres de atributos únicos que existen en la base de datos"""
    try:
        # Obtener nombres únicos de atributos
        nombres = db.query(AtributoPersonaDB.nombre_atributo).distinct().all()
        nombres_lista = [n[0] for n in nombres]
        
        print(f"✅ Se encontraron {len(nombres_lista)} nombres de atributos únicos")
        return {
            "atributos": sorted(nombres_lista)
        }
    except Exception as e:
        print(f"❌ Error obteniendo nombres de atributos: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error obteniendo atributos: {str(e)}")

# Endpoints para Relaciones entre Personas
@app.post("/personas/{persona_id}/relaciones/", response_model=RelacionResponse)
def create_relacion_persona(persona_id: int, relacion: RelacionRequest, db: Session = Depends(get_db)):
    """Crear una relación entre dos personas"""
    print(f"📝 Creando relación para persona {persona_id}: {relacion.tipo_relacion}")
    
    # Verificar que la persona principal existe
    persona_principal = db.query(PersonaDB).filter(PersonaDB.id == persona_id).first()
    if not persona_principal:
        raise HTTPException(status_code=404, detail="Persona no encontrada")
    
    # Crear la relación
    nueva_relacion = create_relacion(db, persona_id, relacion)
    
    # Obtener datos de la persona relacionada para la respuesta
    persona_relacionada = db.query(PersonaDB).filter(PersonaDB.id == nueva_relacion.persona_relacionada_id).first()
    
    return {
        "id": nueva_relacion.id,
        "tipo_relacion": nueva_relacion.tipo_relacion,
        "persona_relacionada": {
            "id": persona_relacionada.id,
            "Nombre": persona_relacionada.Nombre,
            "Primer_apellido": persona_relacionada.Primer_apellido
        }
    }

@app.get("/personas/{persona_id}/relaciones/", response_model=List[RelacionResponse])
def get_relaciones_persona_endpoint(persona_id: int, db: Session = Depends(get_db)):
    """Obtener todas las relaciones de una persona"""
    print(f"📋 Consultando relaciones de persona {persona_id}")
    
    # Verificar que la persona existe
    persona = db.query(PersonaDB).filter(PersonaDB.id == persona_id).first()
    if not persona:
        raise HTTPException(status_code=404, detail="Persona no encontrada")
    
    return get_relaciones_persona(db, persona_id)

@app.delete("/relaciones/{relacion_id}")
def delete_relacion(relacion_id: int, db: Session = Depends(get_db)):
    """Eliminar una relación específica"""
    print(f"🗑️ Eliminando relación {relacion_id}")
    
    relacion = db.query(RelacionPersonaDB).filter(RelacionPersonaDB.id == relacion_id).first()
    if not relacion:
        raise HTTPException(status_code=404, detail="Relación no encontrada")
    
    db.delete(relacion)
    db.commit()
    
    print(f"✅ Relación {relacion_id} eliminada exitosamente")
    
    return {"message": "Relación eliminada exitosamente"}

@app.get("/relaciones/tipos/")
def get_tipos_relaciones(categoria: Optional[str] = None, db: Session = Depends(get_db)):
    """Obtener todos los tipos de relaciones únicos existentes, opcionalmente filtrados por categoría"""
    try:
        if categoria:
            # Filtrar por categoría específica
            result = db.execute(
                text("SELECT DISTINCT tipo_relacion FROM RelacionPersona WHERE categoria = :cat ORDER BY tipo_relacion"),
                {"cat": categoria}
            )
        else:
            # Devolver todos los tipos
            result = db.execute(text("SELECT DISTINCT tipo_relacion FROM RelacionPersona ORDER BY tipo_relacion"))
        
        tipos = [row[0] for row in result.fetchall()]
        
        print(f"📋 Tipos de relaciones encontrados{f' (categoría: {categoria})' if categoria else ''}: {tipos}")
        return {"tipos_relaciones": tipos}
        
    except Exception as e:
        print(f"❌ Error obteniendo tipos de relaciones: {str(e)}")
        return {"tipos_relaciones": []}


@app.delete("/personas/{persona_id}")
def delete_persona(persona_id: int, db: Session = Depends(get_db)):
    """Eliminar una persona y todas sus relaciones"""
    print(f"🗑️ Eliminando persona {persona_id}")
    
    # Verificar que la persona existe
    persona = db.query(PersonaDB).filter(PersonaDB.id == persona_id).first()
    if not persona:
        raise HTTPException(status_code=404, detail="Persona no encontrada")
    
    try:
        # Eliminar todas las relaciones donde esta persona está involucrada
        # Como persona principal
        relaciones_como_principal = db.query(RelacionPersonaDB).filter(RelacionPersonaDB.persona_id == persona_id).all()
        for relacion in relaciones_como_principal:
            db.delete(relacion)
        
        # Como persona relacionada
        relaciones_como_relacionada = db.query(RelacionPersonaDB).filter(RelacionPersonaDB.persona_relacionada_id == persona_id).all()
        for relacion in relaciones_como_relacionada:
            db.delete(relacion)
        
        # Eliminar la persona
        db.delete(persona)
        db.commit()
        
        print(f"✅ Persona {persona_id} y todas sus relaciones eliminadas exitosamente")
        
        return {"message": f"Persona '{persona.Nombre} {persona.Primer_apellido}' eliminada exitosamente"}
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error eliminando persona: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error eliminando persona: {str(e)}")

@app.put("/personas/{persona_id}", response_model=Persona)
def update_persona(persona_id: int, persona_data: PersonaCreate, db: Session = Depends(get_db)):
    """Actualizar una persona (solo campos básicos)"""
    print(f"✏️ Actualizando persona {persona_id}")
    
    # Verificar que la persona existe
    persona_existente = db.query(PersonaDB).filter(PersonaDB.id == persona_id).first()
    if not persona_existente:
        raise HTTPException(status_code=404, detail="Persona no encontrada")
    
    try:
        # Actualizar campos básicos
        persona_existente.Nombre = persona_data.Nombre
        persona_existente.Primer_apellido = persona_data.Primer_apellido
        
        db.commit()
        db.refresh(persona_existente)
        
        print(f"✅ Persona {persona_id} actualizada exitosamente")
        
        return {
            "id": persona_existente.id,
            "Nombre": persona_existente.Nombre,
            "Primer_apellido": persona_existente.Primer_apellido
        }
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error actualizando persona: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error actualizando persona: {str(e)}")


# Endpoints de imágenes
@app.post("/personas/{persona_id}/imagenes/", response_model=ImagenResponse)
def add_imagen_persona(persona_id: int, imagen: ImagenRequest, db: Session = Depends(get_db)):
    """Añade una imagen a una persona guardándola como archivo"""
    print(f"📷 Añadiendo imagen '{imagen.nombre_imagen}' a persona ID: {persona_id}")
    
    try:
        # Verificar que la persona existe
        persona = db.query(PersonaDB).filter(PersonaDB.id == persona_id).first()
        if not persona:
            raise HTTPException(status_code=404, detail=f"Persona con ID {persona_id} no encontrada")
        
        # Procesar imagen base64 y guardar como archivo
        try:
            # Extraer el contenido base64 (remover el prefijo data:image/...;base64,)
            if ',' in imagen.imagen_data:
                header, base64_data = imagen.imagen_data.split(',', 1)
                # Extraer extensión del header
                if 'jpeg' in header or 'jpg' in header:
                    ext = 'jpg'
                elif 'png' in header:
                    ext = 'png'
                elif 'gif' in header:
                    ext = 'gif'
                elif 'webp' in header:
                    ext = 'webp'
                else:
                    ext = 'jpg'  # Por defecto
            else:
                base64_data = imagen.imagen_data
                ext = 'jpg'
            
            # Decodificar base64
            imagen_bytes = base64.b64decode(base64_data)
            
            # Generar nombre único para el archivo
            unique_id = str(uuid.uuid4())[:8]
            nombre_limpio = imagen.nombre_imagen.replace(' ', '_').replace('/', '_')
            nombre_archivo = f"persona_{persona_id}_{nombre_limpio}_{unique_id}.{ext}"
            ruta_completa = IMAGENES_DIR / nombre_archivo
            
            # Guardar archivo
            with open(ruta_completa, 'wb') as f:
                f.write(imagen_bytes)
            
            print(f"✅ Archivo guardado: {ruta_completa}")
            
        except Exception as e:
            print(f"❌ Error procesando imagen: {str(e)}")
            raise HTTPException(status_code=400, detail=f"Error procesando imagen: {str(e)}")
        
        # Crear registro en base de datos
        nueva_imagen = ImagenPersonaDB(
            persona_id=persona_id,
            nombre_imagen=imagen.nombre_imagen,
            ruta_archivo=nombre_archivo
        )
        
        db.add(nueva_imagen)
        db.commit()
        db.refresh(nueva_imagen)
        
        print(f"✅ Imagen '{imagen.nombre_imagen}' añadida exitosamente con ID: {nueva_imagen.id}")
        
        return ImagenResponse(
            id=nueva_imagen.id,
            persona_id=nueva_imagen.persona_id,
            nombre_imagen=nueva_imagen.nombre_imagen,
            url=f"/imagenes/{nueva_imagen.id}"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"❌ Error añadiendo imagen: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error añadiendo imagen: {str(e)}")

@app.get("/personas/{persona_id}/imagenes/", response_model=List[ImagenResponse])
def get_imagenes_persona(persona_id: int, db: Session = Depends(get_db)):
    """Obtiene todas las imágenes de una persona"""
    try:
        # Verificar que la persona existe
        persona = db.query(PersonaDB).filter(PersonaDB.id == persona_id).first()
        if not persona:
            raise HTTPException(status_code=404, detail=f"Persona con ID {persona_id} no encontrada")
        
        # Obtener todas las imágenes de la persona
        imagenes = db.query(ImagenPersonaDB).filter(ImagenPersonaDB.persona_id == persona_id).all()
        
        return [ImagenResponse(
            id=img.id,
            persona_id=img.persona_id,
            nombre_imagen=img.nombre_imagen,
            url=f"/imagenes/{img.id}"
        ) for img in imagenes]
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error obteniendo imágenes: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error obteniendo imágenes: {str(e)}")

@app.delete("/imagenes/{imagen_id}")
def delete_imagen(imagen_id: int, db: Session = Depends(get_db)):
    """Elimina una imagen por su ID y su archivo"""
    print(f"🗑️ Eliminando imagen ID: {imagen_id}")
    
    try:
        # Buscar la imagen
        imagen = db.query(ImagenPersonaDB).filter(ImagenPersonaDB.id == imagen_id).first()
        if not imagen:
            raise HTTPException(status_code=404, detail=f"Imagen con ID {imagen_id} no encontrada")
        
        # Guardar nombre del archivo antes de eliminar
        nombre_archivo = imagen.ruta_archivo
        
        # Eliminar archivo físico
        ruta_archivo = IMAGENES_DIR / nombre_archivo
        if ruta_archivo.exists():
            ruta_archivo.unlink()
            print(f"✅ Archivo eliminado localmente: {ruta_archivo}")
        else:
            print(f"⚠️ Archivo no encontrado localmente: {ruta_archivo}")
        
        # Eliminar registro de base de datos
        db.delete(imagen)
        db.commit()
        print(f"✅ Registro eliminado de la base de datos")
        
        print(f"✅ Imagen ID {imagen_id} eliminada exitosamente")
        
        return {"message": f"Imagen {imagen_id} eliminada exitosamente"}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"❌ Error eliminando imagen: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error eliminando imagen: {str(e)}")

@app.get("/imagenes/{imagen_id}")
def get_imagen_file(imagen_id: int, db: Session = Depends(get_db)):
    """Sirve el archivo de imagen"""
    try:
        # Buscar la imagen en la base de datos
        imagen = db.query(ImagenPersonaDB).filter(ImagenPersonaDB.id == imagen_id).first()
        if not imagen:
            raise HTTPException(status_code=404, detail=f"Imagen con ID {imagen_id} no encontrada")
        
        # Verificar que el archivo existe
        ruta_archivo = IMAGENES_DIR / imagen.ruta_archivo
        if not ruta_archivo.exists():
            raise HTTPException(status_code=404, detail=f"Archivo de imagen no encontrado: {imagen.ruta_archivo}")
        
        # Servir el archivo
        return FileResponse(ruta_archivo)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error sirviendo imagen: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error sirviendo imagen: {str(e)}")


class ChatbotQuery(BaseModel):
    """Modelo para consultas del chatbot"""
    question: str

class ChatbotResponse(BaseModel):
    """Modelo para respuestas del chatbot"""
    success: bool
    response: str
    sql_query: Optional[str] = None
    results_count: Optional[int] = None
    error: Optional[str] = None

# ============================================
# ENDPOINTS: ATRIBUTOS TEMPORALES
# ============================================

@app.get("/personas/{persona_id}/atributos/", response_model=List[AtributoTemporalResponse])
def get_atributos_persona(persona_id: int, db: Session = Depends(get_db)):
    """Obtener todos los atributos temporales de una persona"""
    try:
        # Verificar que la persona existe
        persona = db.query(PersonaDB).filter(PersonaDB.id == persona_id).first()
        if not persona:
            raise HTTPException(status_code=404, detail="Persona no encontrada")
        
        # Obtener atributos ordenados por fecha
        atributos = db.query(AtributoPersonaDB).filter(
            AtributoPersonaDB.persona_id == persona_id
        ).order_by(
            AtributoPersonaDB.nombre_atributo,
            AtributoPersonaDB.fecha_inicio.desc()
        ).all()
        
        # Convertir a response model
        return [
            AtributoTemporalResponse(
                id=attr.id,
                persona_id=attr.persona_id,
                nombre_atributo=attr.nombre_atributo,
                valor=attr.valor,
                fecha_inicio=attr.fecha_inicio,
                fecha_fin=attr.fecha_fin,
                notas=attr.notas,
                created_at=attr.created_at,
                updated_at=attr.updated_at
            )
            for attr in atributos
        ]
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error obteniendo atributos: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/personas/{persona_id}/atributos/", response_model=AtributoTemporalResponse)
def create_atributo_persona(
    persona_id: int, 
    atributo: AtributoTemporalRequest, 
    db: Session = Depends(get_db)
):
    """Crear un nuevo atributo temporal para una persona"""
    try:
        # Verificar que la persona existe
        persona = db.query(PersonaDB).filter(PersonaDB.id == persona_id).first()
        if not persona:
            raise HTTPException(status_code=404, detail="Persona no encontrada")
        
        # Crear nuevo atributo
        nuevo_atributo = AtributoPersonaDB(
            persona_id=persona_id,
            nombre_atributo=atributo.nombre_atributo,
            valor=atributo.valor,
            fecha_inicio=atributo.fecha_inicio,
            fecha_fin=atributo.fecha_fin,
            notas=atributo.notas,
            created_at=datetime.now().isoformat(),
            updated_at=datetime.now().isoformat()
        )
        
        db.add(nuevo_atributo)
        db.commit()
        db.refresh(nuevo_atributo)
        
        print(f"✅ Atributo temporal creado: {atributo.nombre_atributo} = '{atributo.valor}' para persona {persona_id}")
        
        return AtributoTemporalResponse(
            id=nuevo_atributo.id,
            persona_id=nuevo_atributo.persona_id,
            nombre_atributo=nuevo_atributo.nombre_atributo,
            valor=nuevo_atributo.valor,
            fecha_inicio=nuevo_atributo.fecha_inicio,
            fecha_fin=nuevo_atributo.fecha_fin,
            notas=nuevo_atributo.notas,
            created_at=nuevo_atributo.created_at,
            updated_at=nuevo_atributo.updated_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"❌ Error creando atributo: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/personas/{persona_id}/atributos/{atributo_id}", response_model=AtributoTemporalResponse)
def update_atributo_persona(
    persona_id: int,
    atributo_id: int,
    atributo: AtributoTemporalRequest,
    db: Session = Depends(get_db)
):
    """Actualizar un atributo temporal existente"""
    try:
        # Buscar el atributo
        db_atributo = db.query(AtributoPersonaDB).filter(
            AtributoPersonaDB.id == atributo_id,
            AtributoPersonaDB.persona_id == persona_id
        ).first()
        
        if not db_atributo:
            raise HTTPException(status_code=404, detail="Atributo no encontrado")
        
        # Actualizar campos
        db_atributo.nombre_atributo = atributo.nombre_atributo
        db_atributo.valor = atributo.valor
        db_atributo.fecha_inicio = atributo.fecha_inicio
        db_atributo.fecha_fin = atributo.fecha_fin
        db_atributo.notas = atributo.notas
        db_atributo.updated_at = datetime.now().isoformat()
        
        db.commit()
        db.refresh(db_atributo)
        
        print(f"✅ Atributo actualizado: {atributo.nombre_atributo} = '{atributo.valor}'")
        
        return AtributoTemporalResponse(
            id=db_atributo.id,
            persona_id=db_atributo.persona_id,
            nombre_atributo=db_atributo.nombre_atributo,
            valor=db_atributo.valor,
            fecha_inicio=db_atributo.fecha_inicio,
            fecha_fin=db_atributo.fecha_fin,
            notas=db_atributo.notas,
            created_at=db_atributo.created_at,
            updated_at=db_atributo.updated_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"❌ Error actualizando atributo: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/personas/{persona_id}/atributos/{atributo_id}")
def delete_atributo_persona(persona_id: int, atributo_id: int, db: Session = Depends(get_db)):
    """Eliminar un atributo temporal"""
    try:
        # Buscar el atributo
        db_atributo = db.query(AtributoPersonaDB).filter(
            AtributoPersonaDB.id == atributo_id,
            AtributoPersonaDB.persona_id == persona_id
        ).first()
        
        if not db_atributo:
            raise HTTPException(status_code=404, detail="Atributo no encontrado")
        
        nombre_attr = db_atributo.nombre_atributo
        valor_attr = db_atributo.valor
        
        db.delete(db_atributo)
        db.commit()
        
        print(f"✅ Atributo eliminado: {nombre_attr} = '{valor_attr}'")
        
        return {"message": "Atributo eliminado exitosamente"}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"❌ Error eliminando atributo: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/personas/{persona_id}/atributos/{nombre_atributo}/historial", response_model=List[AtributoTemporalResponse])
def get_historial_atributo(
    persona_id: int, 
    nombre_atributo: str, 
    db: Session = Depends(get_db)
):
    """Obtener el historial completo de un atributo específico"""
    try:
        # Verificar que la persona existe
        persona = db.query(PersonaDB).filter(PersonaDB.id == persona_id).first()
        if not persona:
            raise HTTPException(status_code=404, detail="Persona no encontrada")
        
        # Obtener todos los valores históricos del atributo
        historial = db.query(AtributoPersonaDB).filter(
            AtributoPersonaDB.persona_id == persona_id,
            AtributoPersonaDB.nombre_atributo == nombre_atributo
        ).order_by(
            AtributoPersonaDB.fecha_inicio.desc()
        ).all()
        
        return [
            AtributoTemporalResponse(
                id=attr.id,
                persona_id=attr.persona_id,
                nombre_atributo=attr.nombre_atributo,
                valor=attr.valor,
                fecha_inicio=attr.fecha_inicio,
                fecha_fin=attr.fecha_fin,
                notas=attr.notas,
                created_at=attr.created_at,
                updated_at=attr.updated_at
            )
            for attr in historial
        ]
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error obteniendo historial: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ============================================
# ENDPOINTS: CHATBOT
# ============================================

@app.post("/api/chatbot/query", response_model=ChatbotResponse)
async def chatbot_query(query: ChatbotQuery):
    """
    Procesa una pregunta en lenguaje natural sobre la base de dato
    
    Args:
        query: Pregunta del usuario
        
    Returns:
        Respuesta del chatbot con información de la base de datos
    """
    if not CHATBOT_ENABLED:
        raise HTTPException(
            status_code=503, 
            detail="Chatbot no disponible. Instala Ollama desde: https://ollama.com"
        )
    
    if DB_PATH is None:
        raise HTTPException(
            status_code=503,
            detail="Chatbot no disponible en producción"
        )
    
    try:
        # Obtener servicio de chatbot
        chatbot = get_chatbot_service(DB_PATH)
        
        # Procesar la pregunta
        result = chatbot.process_query(query.question)
        
        return ChatbotResponse(**result)
        
    except Exception as e:
        logger.error(f"Error en chatbot: {e}")
        return ChatbotResponse(
            success=False,
            response=f"Lo siento, ocurrió un error al procesar tu consulta: {str(e)}",
            error=str(e)
        )

@app.get("/api/chatbot/status")
async def chatbot_status():
    """
    Verifica el estado del servicio de chatbot
    
    Returns:
        Estado del chatbot (habilitado/deshabilitado)
    """
    if not CHATBOT_ENABLED:
        return {
            "enabled": False,
            "message": "Chatbot no configurado. Instala Ollama desde: https://ollama.com"
        }
    
    if DB_PATH is None:
        return {
            "enabled": False,
            "message": "Chatbot no disponible en producción (requiere SQLite local)"
        }
    
    try:
        # Intentar obtener el servicio
        chatbot = get_chatbot_service(DB_PATH)
        return {
            "enabled": True,
            "model": chatbot.model_name,
            "message": "Chatbot listo para consultas ",
            "free": True
        }
    except Exception as e:
        return {
            "enabled": False,
            "error": str(e),
            "message": "Error al inicializar chatbot. Asegúrate de tener Ollama instalado y el modelo descargado."
        }


if __name__ == "__main__":
    # Crear todas las tablas
    Base.metadata.create_all(bind=engine)
    print("✅ Tablas de base de datos creadas/verificadas")
    
    # Usar el puerto de Railway si está disponible, sino 8000 por defecto
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)