const bcrypt = require('bcryptjs');
const User = require('../models/user.model');
const { connection } = require('../database/connection');
require('dotenv').config();

async function testLogin() {
  try {
    // Conectar a la base de datos
    await connection();
    
    // Buscar el usuario administrador
    const user = await User.findOne({ email: 'admin@oki.com' });
    
    if (!user) {
      console.log('❌ Usuario no encontrado');
      process.exit(1);
    }
    
    console.log('✅ Usuario encontrado:');
    console.log('- ID:', user._id);
    console.log('- Username:', user.username);
    console.log('- Email:', user.email);
    console.log('- Password hash:', user.password);
    
    // Probar la contraseña
    const testPassword = 'admin123';
    const isMatch = await bcrypt.compare(testPassword, user.password);
    
    if (isMatch) {
      console.log('✅ Contraseña correcta');
    } else {
      console.log('❌ Contraseña incorrecta');
      
      // Crear nuevo hash para comparar
      const newHash = await bcrypt.hash(testPassword, 10);
      console.log('Nuevo hash generado:', newHash);
      
      // Actualizar usuario con nuevo hash
      user.password = newHash;
      await user.save();
      console.log('✅ Contraseña actualizada');
    }
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testLogin();