# 🔐 Instrucciones para Acceder al Dashboard

## ✅ Credenciales de Acceso

**Email:** `admin@oki.com`  
**Password:** `admin123`

## 🚀 Pasos para Acceder

### 1. **Abrir la Aplicación**
- Ve a tu sitio web (ya sea en desarrollo local o producción)
- Asegúrate de que estés en la página principal (`index.html`)

### 2. **Abrir el Modal de Login**
- Haz clic en el ícono de usuario (👤) en la esquina superior derecha
- Se abrirá el modal de inicio de sesión

### 3. **Ingresar Credenciales**
- **Email:** `admin@oki.com`
- **Password:** `admin123`
- Haz clic en "INICIAR"

### 4. **Verificación Automática**
- El sistema verificará las credenciales
- Si son correctas, serás redirigido automáticamente al dashboard

## 🔧 Solución de Problemas

### Si no puedes acceder:

1. **Abre la Consola del Navegador** (F12)
2. **Ve a la pestaña "Console"**
3. **Intenta hacer login** y observa los mensajes
4. **Busca estos mensajes:**
   - `"Intentando login con: {email: 'admin@oki.com', password: '***'}"`
   - `"Enviando petición a: [URL]"`
   - `"Respuesta recibida: [status]"`

### Mensajes Esperados (Éxito):
```
Intentando login con: {email: 'admin@oki.com', password: '***'}
Entorno detectado: [tu-dominio]
Enviando petición a: [URL]/admin/login
Respuesta recibida: 200 OK
Login exitoso: {message: 'Bienvenido', user: {...}}
Redirigiendo al dashboard...
```

### Mensajes de Error Comunes:

#### ❌ **Error 400 - Usuario no encontrado**
```
Error de login: {message: 'Usuario no encontrado'}
```
**Solución:** Verifica que el email sea exactamente `admin@oki.com`

#### ❌ **Error 400 - Contraseña incorrecta**
```
Error de login: {message: 'Contraseña incorrecta'}
```
**Solución:** Verifica que la contraseña sea exactamente `admin123`

#### ❌ **Error de conexión**
```
Error de conexión: [mensaje]
```
**Solución:** Verifica que el servidor backend esté funcionando

## 🌐 URLs de Verificación

### En Desarrollo Local:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3900`
- Login URL: `/admin/login` (proxy automático)

### En Producción:
- Frontend: `https://catalogo-virtual-oki.onrender.com`
- Backend: `https://pagina-back-oki.onrender.com`
- Login URL: `https://pagina-back-oki.onrender.com/admin/login`

## 🔍 Verificación Manual

Si quieres verificar que el usuario existe, puedes ejecutar:

```bash
cd back
node scripts/testLogin.js
```

Esto te mostrará:
- ✅ Si el usuario existe
- ✅ Si la contraseña es correcta
- ❌ Si hay algún problema

## 📞 Contacto

Si sigues teniendo problemas:
1. Copia los mensajes de la consola
2. Indica si estás en desarrollo local o producción
3. Comparte la URL exacta que estás usando

## 🎯 Resultado Esperado

Una vez que hagas login correctamente:
- Serás redirigido a `/dashboardAdmin.html`
- Verás la interfaz de administración
- Podrás gestionar productos, usuarios y carrusel
- La sesión durará 24 horas