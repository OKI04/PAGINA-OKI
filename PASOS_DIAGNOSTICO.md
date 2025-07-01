# 🔧 Pasos para Diagnosticar el Problema de Login

## 🚀 Instrucciones Paso a Paso

### 1. **Abrir la Consola del Navegador**
- Presiona `F12` o `Ctrl+Shift+I`
- Ve a la pestaña **"Console"**
- Mantén esta pestaña abierta durante todo el proceso

### 2. **Limpiar Datos Previos**
Ejecuta estos comandos en la consola:
```javascript
// Limpiar localStorage
localStorage.clear();

// Limpiar cookies
document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

// Verificar que se limpiaron
console.log('Cookies:', document.cookie);
console.log('LocalStorage:', localStorage.length);
```

### 3. **Ejecutar Diagnóstico Automático**
En la consola, ejecuta:
```javascript
debugLogin.diagnosticoCompleto()
```

### 4. **Interpretar Resultados**

#### ✅ **Si ves esto, TODO ESTÁ BIEN:**
```
🚀 Iniciando diagnóstico completo...
1️⃣ Estado inicial:
🍪 Cookies actuales: 
🎫 Token encontrado: NO
2️�� Probando login:
🧪 Probando login...
🌐 URL de login: [URL]
📤 Enviando petición de login...
📥 Respuesta recibida: 200 OK
✅ Login exitoso: {message: "Bienvenido", user: {...}}
3️⃣ Estado después del login:
🍪 Cookies actuales: token=...
🎫 Token encontrado: SÍ
4️⃣ Probando verificación:
📥 Respuesta de verificación: 200 OK
✅ Verificación exitosa: {message: "Token válido", user: {...}}
✅ Diagnóstico completo: TODO FUNCIONA CORRECTAMENTE
```

#### ❌ **Si hay problemas, busca estos errores:**

**Error de CORS:**
```
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```

**Error de conexión:**
```
Failed to fetch
```

**Error 400 - Credenciales:**
```
❌ Error de login: {message: 'Usuario no encontrado'}
❌ Error de login: {message: 'Contraseña incorrecta'}
```

### 5. **Probar Login Manual**
Si el diagnóstico automático falla, prueba manualmente:

1. **Ir al index** y abrir el modal de login
2. **Ingresar credenciales:**
   - Email: `admin@oki.com`
   - Password: `admin123`
3. **Observar la consola** durante el proceso

### 6. **Mensajes Esperados en Login Manual**

#### ✅ **Login Exitoso:**
```
Intentando login con: {email: 'admin@oki.com', password: '***'}
Entorno detectado: [tu-dominio]
Enviando petición a: [URL]/admin/login
Respuesta recibida: 200 OK
Login exitoso: {message: "Bienvenido", user: {...}}
Usuario guardado en localStorage: {...}
Cookies después del login: token=...
Redirigiendo al dashboard...
```

#### ✅ **Dashboard Cargando:**
```
🔍 Iniciando verificación de autenticación mejorada...
🍪 Token en cookies: SÍ
💾 Info en localStorage: SÍ
✅ Verificación con servidor exitosa: Administrador
✅ Usuario autenticado correctamente
```

### 7. **Soluciones Según el Error**

#### 🔧 **Si las cookies no se establecen:**
- El sistema ahora usa localStorage como respaldo
- Deberías ver: `Usuario guardado en localStorage`

#### 🔧 **Si hay error de CORS:**
- Verifica que estés usando la URL correcta
- En producción debe usar: `https://pagina-back-oki.onrender.com`

#### 🔧 **Si el dashboard te redirige al index:**
- Verifica que veas: `✅ Usuario autenticado correctamente`
- Si no, el problema está en la verificación

### 8. **Comandos de Emergencia**

Si nada funciona, ejecuta en la consola:

```javascript
// Forzar login sin verificación (solo para pruebas)
localStorage.setItem('user', JSON.stringify({
  id: 'test',
  email: 'admin@oki.com', 
  username: 'Administrador'
}));
localStorage.setItem('loginTime', Date.now().toString());
window.location.href = '/dashboardAdmin.html';
```

### 9. **Información para Reportar**

Si sigues teniendo problemas, copia y pega:

1. **URL donde estás probando**
2. **Todos los mensajes de la consola**
3. **Resultado del comando:** `debugLogin.diagnosticoCompleto()`
4. **Tu entorno:** (desarrollo local / producción)

## 🎯 Objetivo

Al final de este proceso deberías poder:
- ✅ Hacer login con `admin@oki.com` / `admin123`
- ✅ Ser redirigido al dashboard
- ✅ Ver la interfaz de administración
- ✅ Mantener la sesión por 24 horas