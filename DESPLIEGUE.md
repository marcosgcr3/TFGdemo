# Guía de Despliegue: Vercel + Railway

Esta guía te ayudará a desplegar tu aplicación con el frontend en Vercel y el backend en Railway.

## 📋 Requisitos Previos

- Cuenta en [Vercel](https://vercel.com)
- Cuenta en [Railway](https://railway.app)
- Repositorio de GitHub con tu código
- Git instalado localmente

## 🚀 Paso 1: Desplegar el Backend en Railway

### 1.1 Preparar el proyecto
Asegúrate de que todos los archivos están en el repositorio:
```bash
git add .
git commit -m "Preparar para despliegue"
git push origin main
```

### 1.2 Crear proyecto en Railway
1. Ve a [railway.app](https://railway.app) e inicia sesión
2. Haz clic en "New Project"
3. Selecciona "Deploy from GitHub repo"
4. Selecciona tu repositorio `TFGdemo`
5. Railway detectará automáticamente que es un proyecto Python

### 1.3 Configurar el servicio
1. En la configuración del proyecto, ve a "Settings"
2. Configura el **Root Directory** como: `backend`
3. El **Start Command** debería ser: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Railway asignará automáticamente un puerto

### 1.4 Variables de entorno (opcional)
Si necesitas configurar variables:
1. Ve a la pestaña "Variables"
2. Añade las variables necesarias

### 1.5 Obtener la URL del backend
1. Una vez desplegado, ve a "Settings" → "Networking"
2. Haz clic en "Generate Domain"
3. Copia la URL generada (ej: `https://tu-app-backend.railway.app`)

## 🌐 Paso 2: Desplegar el Frontend en Vercel

### 2.1 Configurar la URL del backend
1. Edita el archivo `frontend/.env.production`
2. Reemplaza la URL con la de Railway:
```env
VITE_API_URL=https://tu-app-backend.railway.app
```

3. Guarda y haz commit:
```bash
git add frontend/.env.production
git commit -m "Configurar URL de producción"
git push origin main
```

### 2.2 Desplegar en Vercel
1. Ve a [vercel.com](https://vercel.com) e inicia sesión
2. Haz clic en "Add New..." → "Project"
3. Importa tu repositorio de GitHub
4. Configura el proyecto:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 2.3 Variables de entorno en Vercel
1. En "Environment Variables", añade:
   - Name: `VITE_API_URL`
   - Value: `https://tu-app-backend.railway.app`
   - Environment: Production

2. Haz clic en "Deploy"

## 🔧 Paso 3: Configurar CORS en el Backend

Asegúrate de que el backend permita requests desde tu dominio de Vercel. En `backend/main.py`, verifica que CORS esté configurado correctamente:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://tu-app.vercel.app",  # Añade tu dominio de Vercel
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Haz commit y push de los cambios:
```bash
git add backend/main.py
git commit -m "Actualizar CORS para producción"
git push origin main
```

Railway se redesplegar automáticamente.

## 📝 Consideraciones Importantes

### Base de Datos
- Railway usa un sistema de archivos efímero. Tu SQLite se perderá en cada redespliegue.
- **Solución recomendada**: Migrar a PostgreSQL usando Railway's database add-on:
  1. En Railway, añade "New" → "Database" → "PostgreSQL"
  2. Actualiza `requirements.txt` para incluir `psycopg2-binary`
  3. Modifica `main.py` para usar PostgreSQL en producción

### Imágenes
- Las imágenes subidas también se perderán al redesplegar
- **Solución recomendada**: Usar un servicio de almacenamiento como:
  - Cloudinary
  - AWS S3
  - Railway Volumes (para persistencia)

### Chatbot (Ollama)
- Ollama no funcionará en Railway porque requiere recursos GPU/especializados
- **Opciones**:
  - Desactivar el chatbot en producción
  - Usar una API de chatbot cloud (OpenAI, Anthropic, etc.)
  - Desplegar Ollama en un servidor dedicado

## 🔄 Redespliegues Automáticos

Ambas plataformas se redesplegarán automáticamente cuando hagas push a `main`:
- **Railway**: Redespliegue automático del backend
- **Vercel**: Redespliegue automático del frontend

## ✅ Verificación

1. **Backend**: Visita `https://tu-app-backend.railway.app/docs` para ver la documentación de FastAPI
2. **Frontend**: Visita tu URL de Vercel para verificar que la app carga correctamente
3. **Conexión**: Verifica que el frontend puede comunicarse con el backend

## 🐛 Troubleshooting

### Error de CORS
- Verifica que la URL del frontend esté en `allow_origins` del backend
- Asegúrate de que `VITE_API_URL` esté configurada correctamente

### Backend no responde
- Revisa los logs en Railway Dashboard
- Verifica que el puerto esté configurado correctamente (`$PORT`)

### Frontend muestra página en blanco
- Revisa la consola del navegador para errores
- Verifica que `VITE_API_URL` esté definida en las variables de entorno de Vercel

## 📚 Recursos

- [Railway Docs](https://docs.railway.app)
- [Vercel Docs](https://vercel.com/docs)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)
- [Vite Env Variables](https://vitejs.dev/guide/env-and-mode.html)
