// src/pages/Login.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import mspasLogo from '../pages/assets/mspas-logo.png';

function Login() {
  const [correo, setCorreo] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // ✅ URL dinámica segura (Render o local)
  const API_URL = process.env.REACT_APP_URL_BACKEND || '';

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${API_URL}/api/login`, {
        correo,
        contraseña,
      });

      const { token, user } = response.data;

      if (!token || !user) {
        setError('Respuesta inválida del servidor');
        return;
      }

      // ✅ Guardar en localStorage solo si hay token y user válidos
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Redirigir a vista de inicio
      navigate('/inicio');
    } catch (err) {
      console.error('[LOGIN ERROR]', err);
      setError('Credenciales inválidas o error del servidor');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-logo">
          <img src={mspasLogo} alt="Logo MSPAS" />
        </div>
        <h2 className="text-center">Bienvenidos</h2>

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <i className="fas fa-user"></i>
            <input
              type="text"
              placeholder="Correo"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <i className="fas fa-lock"></i>
            <input
              type="password"
              placeholder="Contraseña"
              value={contraseña}
              onChange={(e) => setContraseña(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-btn w-100">INGRESAR</button>

          {error && (
            <p style={{ color: 'white', marginTop: '10px', textAlign: 'center' }}>
              {error}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

export default Login;
