const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const userFound = await User.findOne({ email });

    if (!userFound) {
      return res.status(400).json({ message: "Usuario no encontrado" });
    }

    // ✅ Agrega log para depurar
    console.log("Contraseña en BD:", userFound.password);

    const isMatch = await bcrypt.compare(password, userFound.password);

    // ✅ IMPORTANTE: asegúrate de retornar
    if (!isMatch) {
      console.log("Contraseña incorrecta");
      return res.status(400).json({ message: "Contraseña incorrecta" });
    }

    const token = await createAccessToken({ id: userFound._id });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // solo HTTPS en prod
      sameSite: "strict"
    });

    res.status(200).json({ message: "Bienvenido" });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};
