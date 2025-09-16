import React, { useState } from 'react';
import axios from 'axios';

// ✅ URL dinámica (Render o local)
const API_URL = process.env.REACT_APP_URL_BACKEND || '';

const RegistrarUsuario = () => {
  const [form, setForm] = useState({
    nombre: '',
    correo: '',
    contraseña: '',
    rol: '',
    estado: 1
  });

  const [mensaje, setMensaje] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false); // controla el modal

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validarFormulario = () => {
    if (!form.nombre || form.nombre.length < 8) {
      setMensaje('⚠️ El nombre debe tener al menos 8 caracteres');
      return false;
    }

    const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regexCorreo.test(form.correo)) {
      setMensaje('⚠️ Ingrese un correo válido');
      return false;
    }

    const regexPass = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    if (!regexPass.test(form.contraseña)) {
      setMensaje('⚠️ La contraseña debe tener mínimo 8 caracteres, incluir mayúscula, minúscula, número y un carácter especial');
      return false;
    }

    if (!form.rol) {
      setMensaje('⚠️ Debe seleccionar un rol');
      return false;
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validarFormulario()) {
      setShowConfirm(true); // abre modal de confirmación
    }
  };

  const confirmarRegistro = async () => {
    try {
      await axios.post(`${API_URL}/api/usuarios`, form);
      setMensaje('✅ Usuario registrado correctamente');
      setForm({ nombre: '', correo: '', contraseña: '', rol: '', estado: 1 });
    } catch (error) {
      if (error.response?.data?.error?.includes('correo')) {
        setMensaje('❌ El correo ya está registrado');
      } else {
        setMensaje('❌ Error al registrar usuario');
      }
    } finally {
      setShowConfirm(false); // cerrar modal
    }
  };

  return (
    <div className="container mt-4">
      <h2>Registrar Usuario</h2>

      {mensaje && <div className="alert alert-info">{mensaje}</div>}

      <form onSubmit={handleSubmit} className="mt-3">
        {/* Nombre */}
        <div className="mb-3">
          <label className="form-label">Nombre completo</label>
          <input
            type="text"
            className="form-control"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            required
          />
        </div>

        {/* Correo */}
        <div className="mb-3">
          <label className="form-label">Correo</label>
          <input
            type="email"
            className="form-control"
            name="correo"
            value={form.correo}
            onChange={handleChange}
            required
          />
        </div>

        {/* Contraseña */}
        <div className="mb-3">
          <label className="form-label">Contraseña</label>
          <input
            type="password"
            className="form-control"
            name="contraseña"
            value={form.contraseña}
            onChange={handleChange}
            required
          />
          <div className="form-text">
            Debe tener mínimo 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial.
          </div>
        </div>

        {/* Rol */}
        <div className="mb-3">
          <label className="form-label">Rol</label>
          <select
            className="form-control"
            name="rol"
            value={form.rol}
            onChange={handleChange}
            required
          >
            <option value="">-- Seleccione --</option>
            <option value="Administrador">Administrador</option>
            <option value="Médico">Médico</option>
            <option value="Enfermera">Enfermera</option>
          </select>
        </div>

        {/* Botón */}
        <button type="submit" className="btn btn-primary">
          Guardar
        </button>
      </form>

      {/* ✅ Modal de confirmación */}
      {showConfirm && (
        <div
          className="modal fade show"
          style={{ display: 'block', background: 'rgba(0,0,0,0.5)' }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirmar Registro</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowConfirm(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>¿Está seguro que desea registrar este usuario?</p>
                <ul>
                  <li><strong>Nombre:</strong> {form.nombre}</li>
                  <li><strong>Correo:</strong> {form.correo}</li>
                  <li><strong>Rol:</strong> {form.rol}</li>
                </ul>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowConfirm(false)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={confirmarRegistro}
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistrarUsuario;
