# ✅ Checklist de Despliegue

## Antes de Desplegar

- [ ] Código subido a GitHub
- [ ] Cuenta creada en Railway
- [ ] Cuenta creada en Vercel

## 🔧 Backend (Railway)

- [ ] Proyecto creado en Railway
- [ ] Repositorio conectado
- [ ] Root Directory configurado: `backend`
- [ ] Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- [ ] Dominio generado y copiado
- [ ] Variable de entorno `FRONTEND_URL` configurada con la URL de Vercel

## 🌐 Frontend (Vercel)

- [ ] Proyecto creado en Vercel
- [ ] Repositorio conectado
- [ ] Framework detectado: Vite
- [ ] Root Directory configurado: `frontend`
- [ ] Variable de entorno `VITE_API_URL` configurada con la URL de Railway
- [ ] Despliegue exitoso

## ✨ Post-Despliegue

- [ ] Actualizar `FRONTEND_URL` en Railway con la URL real de Vercel
- [ ] Redesplegar el backend en Railway
- [ ] Verificar que el frontend carga correctamente
- [ ] Probar la conexión entre frontend y backend
- [ ] Verificar funcionalidad de personas (CRUD)
- [ ] Verificar funcionalidad de atributos temporales
- [ ] Verificar carga de imágenes (nota: se perderán en cada redespliegue)

## ⚠️ Notas Importantes

### Base de Datos
La base de datos SQLite se perderá en cada redespliegue de Railway. Considera:
- [ ] Migrar a PostgreSQL (recomendado)
- [ ] O usar Railway Volumes para persistencia

### Imágenes
Las imágenes subidas se perderán al redesplegar. Considera:
- [ ] Usar Cloudinary o AWS S3
- [ ] O usar Railway Volumes

### Chatbot
Ollama no funcionará en Railway. Considera:
- [ ] Desactivar el chatbot
- [ ] O usar una API cloud (OpenAI, Anthropic)

## 🐛 Si algo falla

### Backend
1. Revisar logs en Railway Dashboard
2. Verificar que el puerto sea `$PORT`
3. Verificar `requirements.txt`

### Frontend
1. Revisar consola del navegador (F12)
2. Verificar variables de entorno en Vercel
3. Verificar que `VITE_API_URL` apunte a Railway

### CORS
1. Verificar `FRONTEND_URL` en Railway
2. Verificar que incluya el dominio completo de Vercel
3. Redesplegar el backend después de cambiar variables
