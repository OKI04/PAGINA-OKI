const jwt  = require('jsonwebtoken');
const { TOKEN_SECRET } = require('../config');

// 1) crear el token
const token = jwt.sign(
  { id: usuario._id, email: usuario.email },
  TOKEN_SECRET,
  { expiresIn: '7d' }
);

// 2) enviarlo como cookie
res.cookie('token', token, {
  httpOnly : true,
  secure   : process.env.NODE_ENV === 'production', // true en Render/Vercel
  sameSite : process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
  maxAge   : 7 * 24 * 60 * 60 * 1000                // 7 días
});

return res.json({ message: 'Login ok' });
