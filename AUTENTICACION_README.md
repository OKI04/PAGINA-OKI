# Sistema de Autenticación - OKI Catálogo

## Problemas Corregidos

### 1. **Duración de Tokens**
- ❌ **Antes**: Los tokens expiraban en 10 minutos
- ✅ **Ahora**: Los tokens duran 24 horas

### 2. **Protección del Dashboard**
- ❌ **Antes**: El dashboard no verificaba autenticación
- ✅ **Ahora**: El dashboard verifica autenticación al cargar y redirige si no hay token válido

### 3. **Verificación de Tokens**
- ❌ **Antes**: No se verificaba si los tokens eran válidos en el servidor
- ✅ **Ahora**: Se verifica la validez del token con el servidor antes de permitir acceso

### 4. **Manejo de Errores**
- ❌ **Antes**: Errores genéricos sin logging
- ✅ **Ahora**: Logging detallado y manejo específico de errores

## Credenciales de Administrador

Para acceder al dashboard administrativo, usa estas credenciales:

```
Email: admin@oki.com
Password: admin123
```

## Cómo Funciona Ahora

### 1. **Acceso al Dashboard**
1. Ve a `/dashboardAdmin.html`
2. Si no estás autenticado, serás redirigido automáticamente al index
3. Inicia sesión con las credenciales de administrador
4. Serás redirigido al dashboard

### 2. **Verificación de Autenticación**
- Al cargar el dashboard, se verifica que tengas un token válido
- Si el token ha expirado o es inválido, serás redirigido al login
- La verificación se hace tanto en frontend como backend

### 3. **Duración de Sesión**
- Las sesiones duran 24 horas
- Después de 24 horas, deberás iniciar sesión nuevamente

## Archivos Modificados

### Backend
- `back/libs/jwt.js` - Aumentada duración de tokens a 24h
- `back/middlewares/validateToken.js` - Mejorado logging y manejo de errores
- `back/controllers/auth.controller.js` - Agregado logging y nueva ruta de verificación
- `back/routers/auth.routes.js` - Agregada ruta `/admin/verify`

### Frontend
- `front/dashboardAdmin.html` - Agregado script de autenticación
- `front/src/js/auth.js` - Mejorada verificación con servidor
- `front/src/js/dashBoardAdmin.js` - Agregada verificación al cargar

### Nuevos Archivos
- `back/scripts/createAdmin.js` - Script para crear usuario administrador

## Comandos Útiles

### Crear Usuario Administrador (si no existe)
```bash
cd back
node scripts/createAdmin.js
```

### Verificar Logs del Servidor
Los logs ahora muestran:
- Intentos de login
- Verificaciones de token
- Errores de autenticación

## Flujo de Autenticación

1. **Login**: Usuario ingresa credenciales → Servidor verifica → Genera token JWT → Guarda en cookie
2. **Acceso a Dashboard**: Frontend verifica cookie → Valida token con servidor → Permite acceso
3. **Operaciones Protegidas**: Cada operación CRUD verifica token → Permite/Deniega según validez
4. **Logout**: Limpia cookie → Redirige a index

## Seguridad Implementada

- ✅ Tokens JWT con expiración
- ✅ Cookies HttpOnly (no accesibles desde JavaScript malicioso)
- ✅ Verificación en servidor para cada operación protegida
- ✅ Redirección automática si no hay autenticación
- ✅ Limpieza de tokens inválidos
- ✅ Logging de actividad de autenticación

## Próximos Pasos Recomendados

1. **Cambiar credenciales por defecto** en producción
2. **Implementar roles de usuario** (admin, editor, etc.)
3. **Agregar recuperación de contraseña**
4. **Implementar rate limiting** para prevenir ataques de fuerza bruta
5. **Agregar autenticación de dos factores** para mayor seguridad