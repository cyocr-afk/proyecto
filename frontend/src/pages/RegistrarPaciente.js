// RegistrarPaciente.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const API_URL = process.env.REACT_APP_URL_BACKEND || '';

function RegistrarPaciente() {
  const navigate = useNavigate();
  const [paciente, setPaciente] = useState({
    nombre: '',
    dpi: '',
    fecha_nacimiento: '',
    direccion: '',
    telefono: '',
    estado_civil: '',
    escolaridad: '',
    ocupacion: '',
    pueblo: '',
    fecha_registro: new Date().toISOString().slice(0, 10),
  });

  const pueblos = ['Maya', 'Xinca', 'Garífuna', 'Mestizo'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPaciente({ ...paciente, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { nombre, dpi, fecha_nacimiento, estado_civil, pueblo } = paciente;
    if (!nombre || !dpi || !fecha_nacimiento || !estado_civil || !pueblo) {
      Swal.fire({ icon: 'warning', title: 'Campos requeridos', text: 'Por favor complete todos los campos obligatorios.' });
      return;
    }

    const dpiValido = /^\d{13}$/.test(dpi);
    if (!dpiValido) {
      Swal.fire({ icon: 'warning', title: 'DPI inválido', text: 'El número de DPI/CUI debe tener exactamente 13 dígitos numéricos.' });
      return;
    }

    Swal.fire({
      title: '¿Registrar paciente?',
      text: 'Verifique que todos los datos estén correctos.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#aaa'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.post(`${API_URL}/api/pacientes`, paciente);
          Swal.fire({
            icon: 'success',
            title: 'Paciente registrado',
            text: 'El paciente fue registrado exitosamente.',
            timer: 2000,
            showConfirmButton: false
          });
          setTimeout(() => navigate('/inicio'), 2000);
        } catch (error) {
          console.error(error);
          Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo registrar el paciente.' });
        }
      }
    });
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Registrar Paciente</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Nombre completo</label>
          <input type="text" className="form-control" name="nombre" onChange={handleChange} required />
        </div>

        <div className="mb-3">
          <label>DPI/CUI</label>
          <input type="text" className="form-control" name="dpi" onChange={handleChange} required />
        </div>

        <div className="mb-3">
          <label>Fecha de nacimiento</label>
          <input type="date" className="form-control" name="fecha_nacimiento" onChange={handleChange} required />
        </div>

        <div className="mb-3">
          <label>Dirección Completa</label>
          <input type="text" className="form-control" name="direccion" onChange={handleChange} />
        </div>

        <div className="mb-3">
          <label>Teléfono</label>
          <input type="text" className="form-control" name="telefono" onChange={handleChange} />
        </div>

        <div className="mb-3">
          <label>Estado civil</label>
          <select className="form-select" name="estado_civil" onChange={handleChange} required>
            <option value="">Seleccione</option>
            <option value="Soltera">Soltera</option>
            <option value="Casada">Casada</option>
            <option value="Divorciada">Divorciada</option>
            <option value="Viuda">Viuda</option>
          </select>
        </div>

        <div className="mb-3">
          <label>Escolaridad</label>
          <input type="text" className="form-control" name="escolaridad" onChange={handleChange} />
        </div>

        <div className="mb-3">
          <label>Ocupación</label>
          <input type="text" className="form-control" name="ocupacion" onChange={handleChange} />
        </div>

        <div className="mb-3">
          <label>Pueblo</label>
          <select className="form-select" name="pueblo" onChange={handleChange} required>
            <option value="">Seleccione</option>
            {pueblos.map((p, i) => (
              <option key={i} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <button type="submit" className="btn btn-primary">Registrar Paciente</button>
      </form>
    </div>
  );
}

export default RegistrarPaciente;
