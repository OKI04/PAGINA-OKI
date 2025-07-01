const bcrypt = require('bcryptjs');
const User = require('../models/user.model');
const { connection } = require('../database/connection');
require('dotenv').config();

async function createAdminUser() {
  try {
    // Conectar a la base de datos
    await connection();
    
    // Verificar si ya existe un usuario administrador
    const existingAdmin = await User.findOne({ email: 'admin@oki.com' });
    
    if (existingAdmin) {
      console.log('✅ Usuario administrador ya existe');
      console.log('Email: admin@oki.com');
      console.log('Password: admin123');
      process.exit(0);
    }
    
    // Crear hash de la contraseña
    const passwordHash = await bcrypt.hash('admin123', 10);
    
    // Crear usuario administrador
    const adminUser = new User({
      username: 'Administrador',
      email: 'admin@oki.com',
      password: passwordHash
    });
    
    await adminUser.save();
    
    console.log('✅ Usuario administrador creado exitosamente');
    console.log('Email: admin@oki.com');
    console.log('Password: admin123');
    console.log('Username: Administrador');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error al crear usuario administrador:', error);
    process.exit(1);
  }
}

createAdminUser();