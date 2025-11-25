import bcrypt from 'bcryptjs';

const API_URL = 'http://localhost:8000/api';

export const authService = {
  // Registro - CON HASH EN FRONTEND
  async register(userData) {
    try {
      console.log('Registrando usuario:', userData);
      
      // HASHEAR LA CONTRASEÑA ANTES DE ENVIAR
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);
      
      const userPayload = {
        email: userData.email,
        password: hashedPassword, // ← YA HASHEDA
        name: userData.name,
        roles: ['ROLE_USER']
      };
      
      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/ld+json',
        },
        body: JSON.stringify(userPayload),
      });
      
      const responseData = await response.json();
      console.log('Respuesta del registro:', responseData);
      
      if (!response.ok) {
        throw new Error(responseData.detail || responseData.message || 'Error en el registro');
      }
      
      return responseData;
    } catch (error) {
      console.error('Error en registro:', error);
      throw new Error(error.message || 'Error de conexión');
    }
  },

  // Login - COMPARAR HASHES
  async login(email, password) {
    try {
      console.log('Iniciando sesión:', email);
      
      // Buscar usuario por email
      const response = await fetch(`${API_URL}/users?email=${encodeURIComponent(email)}`, {
        headers: {
          'Accept': 'application/ld+json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Error al buscar usuario');
      }
      
      const data = await response.json();
      
      if (data['hydra:member'] && data['hydra:member'].length > 0) {
        const user = data['hydra:member'][0];
        console.log('Usuario encontrado:', user);
        
        // VERIFICAR CONTRASEÑA CON BCRYPT
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (isPasswordValid) {
          return user;
        } else {
          throw new Error('Contraseña incorrecta');
        }
      } else {
        throw new Error('Usuario no encontrado');
      }
      
    } catch (error) {
      console.error('Error en login:', error);
      throw new Error(error.message || 'Error de conexión');
    }
  },

  async getUserById(userId) {
    try {
      const response = await fetch(`${API_URL}/users/${userId}`, {
        headers: {
          'Accept': 'application/ld+json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Error al obtener usuario');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      throw new Error(error.message || 'Error de conexión');
    }
  }
};