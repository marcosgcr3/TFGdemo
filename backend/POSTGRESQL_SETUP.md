# Pasos para configurar PostgreSQL en Railway

## 1️⃣ Añadir PostgreSQL a tu proyecto

1. En Railway Dashboard, haz clic en **"New"** → **"Database"** → **"Add PostgreSQL"**
2. Railway creará automáticamente una base de datos PostgreSQL
3. Se generará automáticamente la variable `DATABASE_URL`

## 2️⃣ Subir los cambios a GitHub

```bash
git add .
git commit -m "Configurar PostgreSQL para producción"
git push origin main
```

Railway se redesplegar automáticamente.

## 3️⃣ Inicializar la base de datos

Hay dos opciones:

### Opción A: Desde Railway CLI (Recomendado)

1. Instala Railway CLI:
```bash
npm i -g @railway/cli
```

2. Inicia sesión:
```bash
railway login
```

3. Vincula tu proyecto:
```bash
railway link
```

4. Ejecuta el script de inicialización:
```bash
railway run python backend/init_db.py
```

### Opción B: Manualmente desde la interfaz de Railway

1. Ve a tu servicio en Railway
2. Abre la pestaña **"Variables"**
3. Copia el valor de `DATABASE_URL`
4. En tu terminal local (con el entorno virtual activado):

```bash
# En Windows PowerShell
$env:DATABASE_URL="postgresql://..."
python backend/init_db.py
```

## 4️⃣ Verificar que funciona

1. Ve a tu URL de Railway (ej: `https://tu-app.railway.app/docs`)
2. Prueba el endpoint `/personas/` - debería devolver una lista vacía o con datos
3. Intenta crear una persona desde el frontend

## 5️⃣ Migrar datos existentes (Opcional)

Si tienes datos en tu SQLite local que quieres migrar:

1. Exporta los datos a CSV desde tu aplicación local
2. Usa un script o herramienta para importarlos a PostgreSQL
3. O crea los datos manualmente desde el frontend desplegado

## ⚠️ Notas importantes

- PostgreSQL es persistente, los datos NO se perderán al redesplegar
- La variable `DATABASE_URL` se crea automáticamente al añadir PostgreSQL
- El backend detectará automáticamente si usar SQLite (local) o PostgreSQL (producción)
- El chatbot seguirá deshabilitado en producción (requiere Ollama)
