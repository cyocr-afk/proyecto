// ✅ CONTROL PRENATAL corregido y completo (con API_URL dinámico)
import React, { useState, useEffect } from 'react';
import axios from 'axios';

// ✅ URL dinámica (Render o local)
const API_URL = process.env.REACT_APP_URL_BACKEND || '';

const calcularEdad = (fechaNacimiento) => {
  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
  return edad;
};

const ControlPrenatal = () => {
  const [control, setControl] = useState({
    fecha_control: '', edad_gestacional: '', peso: '', presion_arterial: '',
    respiraciones_minuto: '', hemorragia_vaginal: false, flujo_vaginal: false,
    hematologia_completa: false, grupo_rh: '', vdrl: false, glicemia: '',
    vih: false, papanicolau: false, altura_uterina: '', frecuencia_cardiaca_fetal: '',
    fondo_uterino: '', movimientos_fetales: '', observaciones: '', id_paciente: '', id_usuario: '',
  });
  const [busqueda, setBusqueda] = useState('');
  const [sugerencias, setSugerencias] = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);
  const [conteoControl, setConteoControl] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);

  // obtener usuario
  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem('user'));
    if (usuario?.id_usuario) {
      setControl(prev => ({ ...prev, id_usuario: usuario.id_usuario }));
    }
  }, []);

  // calcular número de control
  useEffect(() => {
    if (control.id_paciente) {
      axios.get(`${API_URL}/api/pacientes/${control.id_paciente}/controles-prenatales`)
        .then(res => setConteoControl((res.data?.total || 0) + 1))
        .catch(() => setConteoControl(1));
    }
  }, [control.id_paciente]);

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setControl({ ...control, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/api/controles`, {
        ...control,
        hemorragia_vaginal: control.hemorragia_vaginal ? 1 : 0,
        flujo_vaginal: control.flujo_vaginal ? 1 : 0,
        hematologia_completa: control.hematologia_completa ? 1 : 0,
        vdrl: control.vdrl ? 1 : 0,
        vih: control.vih ? 1 : 0,
        papanicolau: control.papanicolau ? 1 : 0,
      });

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2500);

      setControl(prev => ({
        ...prev,
        fecha_control: '', edad_gestacional: '', peso: '', presion_arterial: '',
        respiraciones_minuto: '', hemorragia_vaginal: false, flujo_vaginal: false,
        hematologia_completa: false, grupo_rh: '', vdrl: false, glicemia: '',
        vih: false, papanicolau: false, altura_uterina: '', frecuencia_cardiaca_fetal: '',
        fondo_uterino: '', movimientos_fetales: '', observaciones: '', id_paciente: ''
      }));
      setBusqueda('');
      setSeleccionado(null);
    } catch (err) {
      console.error(err);
      alert('Error al registrar el control.');
    }
  };

  const seleccionarPaciente = (paciente) => {
    setSeleccionado(paciente);
    setControl(prev => ({ ...prev, id_paciente: paciente.id_paciente }));
    setBusqueda('');
    setSugerencias([]);
  };

  useEffect(() => {
    if (busqueda.trim().length >= 2) {
      axios.get(`${API_URL}/api/pacientes?nombre=${busqueda}`)
        .then(res => setSugerencias(res.data))
        .catch(() => setSugerencias([]));
    } else {
      setSugerencias([]);
    }
  }, [busqueda]);

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Registrar Control Prenatal</h2>

      {/* Buscador */}
      <div className="mb-3 position-relative">
        <label>Buscar paciente por nombre o DPI</label>
        <input
          type="text"
          className="form-control"
          value={busqueda}
          onChange={(e) => {
            setBusqueda(e.target.value);
            setSeleccionado(null);
            setControl(prev => ({ ...prev, id_paciente: '' }));
          }}
          placeholder="Nombre o DPI"
        />
        {sugerencias.length > 0 && (
          <ul className="list-group position-absolute w-100 shadow" style={{ zIndex: 1000 }}>
            {sugerencias.map((p) => (
              <li
                key={p.id_paciente}
                className="list-group-item list-group-item-action"
                onMouseDown={() => seleccionarPaciente(p)}
              >
                {p.nombre} — DPI: {p.dpi}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Datos del paciente */}
      {seleccionado && (
        <div className="alert alert-info">
          <strong>Paciente:</strong><br />
          <strong>Nombre:</strong> {seleccionado.nombre}<br />
          <strong>DPI:</strong> {seleccionado.dpi}<br />
          <strong>Edad:</strong> {calcularEdad(seleccionado.fecha_nacimiento)} años<br />
          <strong>Dirección:</strong> {seleccionado.direccion}
        </div>
      )}

      {/* Formulario */}
      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-md-4 mb-3">
            <label>Número de Control General</label>
            <input type="number" className="form-control" value={conteoControl} disabled />
            <div className="form-text">controles por embarazo.</div>
          </div>

          <div className="col-md-4 mb-3">
            <label>Fecha del control</label>
            <input type="date" name="fecha_control" className="form-control" value={control.fecha_control} onChange={handleChange} required />
          </div>

          <div className="col-md-4 mb-3">
            <label>Edad gestacional (semanas)</label>
            <input type="number" name="edad_gestacional" className="form-control" value={control.edad_gestacional} onChange={handleChange} required />
          </div>

          <div className="col-md-4 mb-3">
            <label>Peso (kg)</label>
            <input type="number" step="0.01" name="peso" className="form-control" value={control.peso} onChange={handleChange} />
          </div>

          <div className="col-md-4 mb-3">
            <label>Presión arterial</label>
            <input type="text" name="presion_arterial" className="form-control" value={control.presion_arterial} onChange={handleChange} />
          </div>

          <div className="col-md-4 mb-3">
            <label>Respiraciones por minuto</label>
            <input type="number" name="respiraciones_minuto" className="form-control" value={control.respiraciones_minuto} onChange={handleChange} />
          </div>

          <div className="col-md-4 mb-3">
            <label>Glicemia</label>
            <input type="number" step="0.01" name="glicemia" className="form-control" value={control.glicemia} onChange={handleChange} />
          </div>

          <div className="col-md-4 mb-3">
            <label>Altura uterina</label>
            <input type="number" step="0.01" name="altura_uterina" className="form-control" value={control.altura_uterina} onChange={handleChange} />
          </div>

          <div className="col-md-4 mb-3">
            <label>Fondo uterino</label>
            <input type="number" step="0.01" name="fondo_uterino" className="form-control" value={control.fondo_uterino} onChange={handleChange} />
          </div>

          <div className="col-md-4 mb-3">
            <label>Frecuencia cardíaca fetal</label>
            <input type="text" name="frecuencia_cardiaca_fetal" className="form-control" value={control.frecuencia_cardiaca_fetal} onChange={handleChange} />
          </div>

          <div className="col-md-6 mb-3">
            <label>Movimientos fetales</label>
            <input type="text" name="movimientos_fetales" className="form-control" value={control.movimientos_fetales} onChange={handleChange} />
          </div>

          <div className="col-md-6 mb-3">
            <label>Grupo RH</label>
            <select name="grupo_rh" className="form-select" value={control.grupo_rh} onChange={handleChange}>
              <option value="">Seleccione</option>
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((rh, i) => (
                <option key={i} value={rh}>{rh}</option>
              ))}
            </select>
          </div>

          <div className="col-12 mb-3">
            <label className="form-label d-block">Evaluaciones realizadas</label>
            {[
              { name: 'hemorragia_vaginal', label: 'Hemorragia vaginal' },
              { name: 'flujo_vaginal', label: 'Flujo vaginal' },
              { name: 'hematologia_completa', label: 'Hematología' },
              { name: 'vdrl', label: 'VDRL' },
              { name: 'vih', label: 'VIH' },
              { name: 'papanicolau', label: 'Papanicolau' },
            ].map((item, i) => (
              <div className="form-check form-check-inline" key={i}>
                <input
                  type="checkbox"
                  className="form-check-input"
                  name={item.name}
                  checked={control[item.name]}
                  onChange={handleChange}
                />
                <label className="form-check-label">{item.label}</label>
              </div>
            ))}
          </div>

          <div className="mb-3">
            <label>Observaciones</label>
            <textarea name="observaciones" className="form-control" rows="3" value={control.observaciones} onChange={handleChange}></textarea>
          </div>
        </div>

        <button type="submit" className="btn btn-success">Guardar</button>
      </form>

      {showSuccess && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#28a745',
          color: '#fff',
          padding: '15px 20px',
          borderRadius: '8px',
          zIndex: 9999
        }}>
          Control prenatal registrado correctamente.
        </div>
      )}
    </div>
  );
};

export default ControlPrenatal;
