const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const { createAccessToken } = require("../libs/jwt");

const register = async (req, res) => {
  const { email, password, username } = req.body;

  try {
    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Encriptar la contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    // Crear nuevo usuario
    const newUser = new User({
      username,
      email,
      password: passwordHash,
    });

    // Guardar en la base de datos
    const userSaved = await newUser.save();

    // Crear token JWT
    const token = await createAccessToken({ id: userSaved._id });

    // Establecer cookie segura
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Solo en HTTPS en producción
      sameSite: "Strict",
      maxAge: 1000 * 60 * 60 * 24, // 1 día
    });

    return res.status(200).json({ message: "User created successfully" });

  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Buscar usuario por email
    const userFound = await User.findOne({ email });
    if (!userFound) {
      return res.status(400).json({ message: "User not found" });
    }

    // Verificar que tenga contraseña almacenada
    if (!userFound.password) {
      return res.status(500).json({ message: "User has no password stored" });
    }

    // Comparar contraseñas
    const isMatch = await bcrypt.compare(password, userFound.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    // Crear token JWT
    const token = await createAccessToken({ id: userFound._id });

    // Establecer cookie segura
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 1000 * 60 * 60 * 24, // 1 día
    });

    return res.status(200).json({ message: "Welcome" });

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const logout = (req, res) => {
  // Limpiar cookie
  res.cookie("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    expires: new Date(0),
  });
  return res.status(200).json({ message: "Bye" });
};

module.exports = {
  register,
  login,
  logout,
};
