const API_URL = 'http://localhost:8000/api';

export const authService = {
  // Registro - con el content-type correcto para API Platform
  async register(userData) {
    try {
      console.log('Registrando usuario:', userData);
      
      // Estructura según tu entidad User
      const userPayload = {
        email: userData.email,
        password: userData.password,
        name: userData.name,
        roles: ['ROLE_USER']
      };
      
      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/ld+json', // ✅ Content-type correcto
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

  // Login - con content-type correcto
  async login(email, password) {
    try {
      console.log('Buscando usuario:', email);
      
      // Buscamos el usuario por email
      const response = await fetch(`${API_URL}/users?email=${encodeURIComponent(email)}`, {
        headers: {
          'Accept': 'application/ld+json', // ✅ Accept header correcto
        },
      });
      
      if (!response.ok) {
        throw new Error('Error al buscar usuario');
      }
      
      const data = await response.json();
      
      // API Platform devuelve los resultados en hydra:member
      if (data['hydra:member'] && data['hydra:member'].length > 0) {
        const user = data['hydra:member'][0];
        console.log('Usuario encontrado:', user);
        
        // Verificamos la contraseña
        if (user.password === password) {
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

  // Método adicional: Obtener usuario por ID
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