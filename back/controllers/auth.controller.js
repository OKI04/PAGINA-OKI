const User = require("../models/user.model");
const bcrypt = require('bcryptjs');
const { createAccessToken } = require('../libs/jwt');

// =======================
// REGISTRO DE USUARIO
// =======================
const register = async (req, res) => {
  const { email, password, username } = req.body;

  // Validar datos obligatorios
  if (!email || !password || !username) {
    return res.status(400).json({ message: "Todos los campos son obligatorios" });
  }

  try {
    // Hashear contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    // Crear nuevo usuario
    const newUser = new User({
      username,
      email,
      password: passwordHash
    });

    // Guardar en la base de datos
    const userSaved = await newUser.save();

    // Crear token JWT
    const token = await createAccessToken({ id: userSaved._id });

    // Enviar token como cookie segura
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // solo en producción
      sameSite: 'strict'
    });

    res.status(200).json({ message: "Usuario creado exitosamente" });

  } catch (error) {
    console.error("Error en el registro:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};

// =======================
// INICIO DE SESIÓN
// =======================
const login = async (req, res) => {
  const { email, password } = req.body;

  // Validar campos
  if (!email || !password) {
    return res.status(400).json({ message: "Email y contraseña requeridos" });
  }

  try {
    // Buscar usuario por email
    const userFound = await User.findOne({ email });
    if (!userFound) {
      return res.status(400).json({ message: "Usuario no encontrado" });
    }

    // Comparar contraseñas
    const isMatch = await bcrypt.compare(password, userFound.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Contraseña incorrecta" });
    }

    // Generar token
    const token = await createAccessToken({ id: userFound._id });

    // Enviar token como cookie segura
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });

    res.status(200).json({ message: "Bienvenido" });

  } catch (error) {
    console.error("Error en el login:", error);
    res.status(500).json({ message: "Error del servidor" });
  }
};

// =======================
// CERRAR SESIÓN
// =======================
const logout = (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0)
  });
  return res.status(200).json({ message: "Sesión cerrada" });
};

// =======================
// EXPORTAR FUNCIONES
// =======================
module.exports = {
  register,
  login,
  logout
};
