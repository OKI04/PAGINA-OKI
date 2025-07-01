const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// Simular la configuración del servidor
const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'https://catalogo-virtual-oki.onrender.com'],
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// Importar rutas
const authRoutes = require('../routers/auth.routes');

// Verificar que las rutas se cargan correctamente
console.log('🔍 Verificando rutas de autenticación...');

try {
  app.use('/admin', authRoutes);
  console.log('✅ Rutas de autenticación cargadas correctamente');
  
  // Listar las rutas disponibles
  console.log('\n📋 Rutas disponibles:');
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      console.log(`- ${Object.keys(middleware.route.methods)[0].toUpperCase()} ${middleware.route.path}`);
    } else if (middleware.name === 'router') {
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          const method = Object.keys(handler.route.methods)[0].toUpperCase();
          const path = '/admin' + handler.route.path;
          console.log(`- ${method} ${path}`);
        }
      });
    }
  });
  
} catch (error) {
  console.error('❌ Error al cargar rutas:', error);
}

console.log('\n🌐 URLs esperadas:');
console.log('- POST /admin/login');
console.log('- POST /admin/logout');
console.log('- POST /admin/register');
console.log('- GET /admin/verify');

console.log('\n🔧 Variables de entorno:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- PORT:', process.env.PORT);
console.log('- TOKEN_SECRET:', process.env.TOKEN_SECRET ? '✅ Configurado' : '❌ No configurado');
console.log('- MONGO_URI:', process.env.MONGO_URI ? '✅ Configurado' : '❌ No configurado');