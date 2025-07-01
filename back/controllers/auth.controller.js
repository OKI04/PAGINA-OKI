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
    const token = await createAccessToken({ id: userSaved._id });

    // Configuración de cookie más permisiva para producción
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 24 * 60 * 60 * 1000, // 24 horas
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

    console.log("Usuario encontrado, verificando contraseña...");
    const isMatch = await bcrypt.compare(password, userFound.password);

    if (!isMatch) {
      console.log("Contraseña incorrecta para usuario:", email);
      return res.status(400).json({ message: "Contraseña incorrecta" });
    }

    console.log("Contraseña correcta, generando token...");
    const token = await createAccessToken({ id: userFound._id });

    // Configuración de cookie más permisiva para producción
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 24 * 60 * 60 * 1000, // 24 horas
      path: '/'
    };

    console.log("Configurando cookie con opciones:", cookieOptions);
    res.cookie('token', token, cookieOptions);

    console.log("Login exitoso para usuario:", email);
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
const verifyToken = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.status(200).json({ 
      message: "Token válido", 
      user: { 
        id: user._id, 
        email: user.email, 
        username: user.username 
      } 
    });
  } catch (error) {
    console.error("Error en verificación de token:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

module.exports = {
  register,
  login,
  logout,
  verifyToken
};