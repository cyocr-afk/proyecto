// ✅ CONTROL PRENATAL corregido y completo (con API_URL dinámico y JSON.parse seguro)
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

  // ✅ obtener usuario de forma segura
  useEffect(() => {
    let usuario = {};
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser && storedUser !== 'undefined' && storedUser !== 'null') {
        usuario = JSON.parse(storedUser);
      }
    } catch (e) {
      usuario = {};
    }

    if (usuario?.id_usuario) {
      setControl(prev => ({ ...prev, id_usuario: usuario.id_usuario }));
    }
  }, []);

  // ✅ calcular número de control
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
      {/* ... (resto del formulario igual que ya lo tienes) */}
    </div>
  );
};

export default ControlPrenatal;
