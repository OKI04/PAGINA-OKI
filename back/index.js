// ============================================================
// index.js  –  Punto de entrada del backend (Producción/Dev)
// ============================================================

/**
 * Este archivo arranca la API de OKI:
 *  - Conecta a MongoDB.
 *  - Configura CORS (incluido credentials:true para cookies).
 *  - Expone rutas de autenticación, productos y carrusel.
 *  - Sirve imágenes estáticas.
 *  - Maneja errores 404 y globales.
 *
 * Variables de entorno más usadas:
 *  FRONTEND_DEV   → http://localhost:5173
 *  FRONTEND_PROD  → https://pagina-front-oki.vercel.app
 *  PORT           → 3900 (fallback)
 *  MONGO_URI      → cadena de conexión a Mongo
 */

require('dotenv').config();
const express       = require('express');
const cors          = require('cors');
const morgan        = require('morgan');
const cookieParser  = require('cookie-parser');
const path          = require('path');

const { connection } = require('./database/connection');

// ─── Inicializar ───────────────────────────────────────────────────────────
console.log('🟢 Iniciando API OKI…');
connection(); // conecta a MongoDB

const app  = express();
const PORT = process.env.PORT || 3900;

// ─── CORS ──────────────────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  process.env.FRONTEND_DEV  || 'http://localhost:5173',
  process.env.FRONTEND_PROD || 'https://pagina-oki-n3qw.onrender.com/dashboardAdmin.html',
];

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);               // Postman / curl
      if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
      return cb(new Error('CORS: origin no permitido')); // bloquea otros orígenes
    },
    credentials: true,                                  // cookies cross‑site
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ─── Middlewares globales ─────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(morgan('dev'));
app.use('/imagenes', express.static(path.join(__dirname, 'imagenes')));

// ─── Rutas ────────────────────────────────────────────────────────────────
const authRoutes      = require('./routers/auth.routes');
const productosRoutes = require('./routers/productos.routes');
const carruselRoutes  = require('./routers/carrusel.routes');

app.use('/admin',               authRoutes);
app.use('/admin/products',      productosRoutes);
app.use('/admin/carrusel/products', carruselRoutes);

// Ping health‑check
app.get('/ping', (_req, res) => res.send('pong'));

// 404 genérico
app.use((req, res) => {
  res.status(404).json({ ok: false, message: 'Ruta no encontrada' });
});

// Manejador global de errores
app.use((err, _req, res, _next) => {
  console.error('🔥 Error no controlado:', err);
  res.status(500).json({ ok: false, message: err.message || 'Error interno' });
});

// ─── Levantar servidor ────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Servidor HTTP escuchando en puerto ${PORT}`);
});
