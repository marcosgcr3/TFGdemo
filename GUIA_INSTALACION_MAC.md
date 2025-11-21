# 📱 Guía de Instalación en Mac 

Esta guía te ayudará a instalar y ejecutar la aplicación PICUVIMO en tu Mac, paso a paso, sin necesidad de conocimientos técnicos previos.

---

## 📋 Requisitos Previos

Antes de empezar, necesitas instalar algunas herramientas básicas en tu Mac.

### 1️⃣ Instalar Python (lenguaje de programación para el backend)

1. Abre **Safari** (tu navegador)
2. Ve a: https://www.python.org/downloads/
3. Haz clic en el botón amarillo grande **"Download Python 3.x.x"**
4. Una vez descargado, abre el archivo `.pkg` que se descargó
5. Sigue el asistente de instalación haciendo clic en **"Continuar"** → **"Instalar"**
6. Introduce tu contraseña de Mac cuando te la pida
7. Espera a que termine la instalación
8. Haz clic en **"Cerrar"**

**✅ Para verificar que se instaló correctamente:**
1. Abre **Terminal** (búscalo en Spotlight presionando `Cmd + Espacio` y escribe "Terminal")
2. Escribe: `python3 --version` y presiona Enter
3. Deberías ver algo como: `Python 3.12.0` (el número puede variar)

---

### 2️⃣ Instalar Node.js (necesario para el frontend)

1. Abre **Safari**
2. Ve a: https://nodejs.org/
3. Haz clic en el botón verde **"Download Node.js (LTS)"**
4. Abre el archivo `.pkg` descargado
5. Sigue el asistente haciendo clic en **"Continuar"** → **"Instalar"**
6. Introduce tu contraseña de Mac
7. Espera a que termine
8. Haz clic en **"Cerrar"**

**✅ Para verificar:**
1. Abre **Terminal**
2. Escribe: `node --version` y presiona Enter
3. Deberías ver algo como: `v20.10.0`
4. Escribe: `npm --version` y presiona Enter
5. Deberías ver algo como: `10.2.3`

---

### 3️⃣ Descargar el Proyecto

1. Abre **Safari** y ve a la página del proyecto en GitHub
2. Haz clic en el botón verde **"Code"**
3. Haz clic en **"Download ZIP"**
4. Una vez descargado, ve a tu carpeta **"Descargas"**
5. Haz doble clic en el archivo `TFG-main.zip` para descomprimirlo
6. Mueve la carpeta descomprimida a tu carpeta **"Documentos"** o donde prefieras
7. Renombra la carpeta a `PICUVIMO` (para que sea más fácil)

---

## 🚀 Instalación de la Aplicación

### 4️⃣ Configurar el Backend (servidor)

1. Abre **Terminal**
2. Navega a la carpeta del proyecto escribiendo:
   ```bash
   cd ~/Documents/PICUVIMO/backend
   ```
   (Ajusta la ruta si pusiste la carpeta en otro lugar)

3. Crea un entorno virtual de Python escribiendo:
   ```bash
   python3 -m venv .venv
   ```
   ⏳ Espera unos segundos...

4. Activa el entorno virtual:
   ```bash
   source .venv/bin/activate
   ```
   📝 Verás que aparece `(.venv)` al inicio de la línea en Terminal

5. Instala las dependencias necesarias:
   ```bash
   pip install -r requirements.txt
   ```
   ⏳ Espera 1-2 minutos mientras se descargan e instalan los paquetes

**✅ El backend está listo!**

---

### 5️⃣ Configurar el Frontend (interfaz visual)

1. En **Terminal**, abre una **nueva pestaña** presionando `Cmd + T`
2. Navega a la carpeta del frontend:
   ```bash
   cd ~/Documents/PICUVIMO/frontend
   ```

3. Instala las dependencias:
   ```bash
   npm install
   ```
   ⏳ Espera 2-3 minutos mientras se descargan los paquetes

**✅ El frontend está listo!**

---

## 🎯 Ejecutar la Aplicación

Cada vez que quieras usar la aplicación, necesitas ejecutar dos comandos (uno para el backend y otro para el frontend).

### 6️⃣ Iniciar el Backend

1. Abre **Terminal**
2. Ve a la carpeta del backend:
   ```bash
   cd ~/Documents/PICUVIMO/backend
   ```

3. Activa el entorno virtual:
   ```bash
   source .venv/bin/activate
   ```

4. Inicia el servidor:
   ```bash
   python main.py
   ```

📝 Verás mensajes como:
```
🚀 Iniciando aplicación...
✅ Tablas de base de datos verificadas
Chatbot habilitado (Ollama)
INFO:     Started server process
```

**⚠️ NO CIERRES esta ventana de Terminal mientras uses la aplicación**

---

### 7️⃣ Iniciar el Frontend

1. Abre **una nueva ventana de Terminal** (presiona `Cmd + N`)
2. Ve a la carpeta del frontend:
   ```bash
   cd ~/Documents/PICUVIMO/frontend
   ```

3. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

📝 Verás un mensaje como:
```
  VITE v5.x.x  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h + enter to show help
```

---

### 8️⃣ Abrir la Aplicación en el Navegador

1. Abre **Safari** (o tu navegador preferido)
2. Ve a la dirección: **http://localhost:5173**


---

## 🛑 Cerrar la Aplicación

Cuando termines de usar la aplicación:

1. **En la ventana de Terminal del frontend**, presiona `Ctrl + C`
2. **En la ventana de Terminal del backend**, presiona `Ctrl + C`
3. Escribe `exit` y presiona Enter (en ambas ventanas)
4. Ya puedes cerrar las ventanas de Terminal

---

## 🔄 Ejecutar la Aplicación Nuevamente

La próxima vez que quieras usar PICUVIMO, solo necesitas repetir los pasos 6, 7 y 8:

**Resumen rápido:**

**Terminal 1 (Backend):**
```bash
cd ~/Documents/PICUVIMO/backend
source .venv/bin/activate
python main.py
```

**Terminal 2 (Frontend):**
```bash
cd ~/Documents/PICUVIMO/frontend
npm run dev
```

**Navegador:**
- Ve a: http://localhost:5173

---

## ❓ Solución de Problemas Comunes

### ❌ Error: "python3: command not found"
**Solución:** Python no está instalado. Repite el paso 1.

### ❌ Error: "node: command not found"
**Solución:** Node.js no está instalado. Repite el paso 2.

### ❌ Error: "No module named 'fastapi'"
**Solución:** Las dependencias del backend no están instaladas. Ve a la carpeta backend y ejecuta:
```bash
source .venv/bin/activate
pip install -r requirements.txt
```

### ❌ Error: "Cannot find module"
**Solución:** Las dependencias del frontend no están instaladas. Ve a la carpeta frontend y ejecuta:
```bash
npm install
```

### ❌ La página no carga o muestra error 404
**Solución:** 
- Verifica que el backend esté ejecutándose (deberías ver mensajes en Terminal)
- Verifica que el frontend esté ejecutándose (deberías ver la URL en Terminal)
- Asegúrate de ir a `http://localhost:5173` (no a otra dirección)

### ❌ Error de permisos al instalar
**Solución:** No uses `sudo`. Si te pide contraseña para instalar paquetes de Python o npm, algo está mal. Asegúrate de usar el entorno virtual para Python.

---

## 📊 Ubicación de los Datos

Todos tus datos (personas, relaciones, imágenes) se guardan en:
```
~/Documents/PICUVIMO/data/PICUVIMO.db
```




## 🎓 Chatbot con IA (Opcional)

Si quieres usar el chatbot con inteligencia artificial:

1. Ve a: https://ollama.com/download/mac
2. Descarga e instala Ollama para Mac
3. Abre Terminal y ejecuta:
   ```bash
   ollama pull llama3.2
   ```
4. Reinicia el backend
5. El chatbot ahora estará disponible en la aplicación

---

## 💡 Consejos Útiles

✅ **Guarda esta guía** en un lugar fácil de encontrar

✅ **Crea un alias** en Terminal para ejecutar más rápido:
1. Abre Terminal
2. Escribe: `nano ~/.zshrc`
3. Al final del archivo, añade:
   ```bash
   alias picuvimo-backend="cd ~/Documents/PICUVIMO/backend && source .venv/bin/activate && python main.py"
   alias picuvimo-frontend="cd ~/Documents/PICUVIMO/frontend && npm run dev"
   ```
4. Presiona `Ctrl + O` para guardar, Enter, y `Ctrl + X` para salir
5. Reinicia Terminal
6. Ahora puedes escribir solo `picuvimo-backend` o `picuvimo-frontend`



