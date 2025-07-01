const User = require("../models/user.model");
const bcrypt = require('bcryptjs');
const { createAccessToken } = require('../libs/jwt');

// =====================================
// ============ REGISTRO ==============
// =====================================
const register = async (req, res) => {
  const { email, password, username } = req.body;

  try {
    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: passwordHash
    });

    const userSaved = await newUser.save();

    // ✅ Token incluye más información
    const token = await createAccessToken({
      id: userSaved._id,
      email: userSaved.email,
      username: userSaved.username
    });

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 24 * 60 * 60 * 1000,
      path: '/'
    };

    res.cookie('token', token, cookieOptions);

    res.status(200).json({ message: "Usuario creado correctamente" });

  } catch (error) {
    console.error("Error en registro:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

// =====================================
// ============== LOGIN ===============
// =====================================
const login = async (req, res) => {
  const { email, password } = req.body;

  console.log("Intento de login para email:", email);

  try {
    const userFound = await User.findOne({ email });

    if (!userFound) {
      console.log("Usuario no encontrado:", email);
      return res.status(400).json({ message: "Usuario no encontrado" });
    }

    const isMatch = await bcrypt.compare(password, userFound.password);

    if (!isMatch) {
      console.log("Contraseña incorrecta para usuario:", email);
      return res.status(400).json({ message: "Contraseña incorrecta" });
    }

    // ✅ Token incluye más información
    const token = await createAccessToken({
      id: userFound._id,
      email: userFound.email,
      username: userFound.username
    });

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 24 * 60 * 60 * 1000,
      path: '/'
    };

    res.cookie('token', token, cookieOptions);

    res.status(200).json({
      message: "Bienvenido",
      user: {
        id: userFound._id,
        email: userFound.email,
        username: userFound.username
      }
    });

  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

// =====================================
// ============== LOGOUT ==============
// =====================================
const logout = (req, res) => {
  const cookieOptions = {
    expires: new Date(0),
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    secure: process.env.NODE_ENV === "production",
    path: '/'
  };

  res.cookie('token', '', cookieOptions);
  return res.status(200).json({ message: "Sesión cerrada" });
};

// =====================================
// ========== VERIFY TOKEN ============
// =====================================
const verifyToken = (req, res) => {
  const { id, email, username } = req.user;

  if (!id || !email) {
    return res.status(401).json({ message: "Token inválido o incompleto" });
  }

  return res.status(200).json({
    message: "Token válido",
    user: {
      id,
      email,
      username
    }
  });
};

module.exports = {
  register,
  login,
  logout,
  verifyToken
};
