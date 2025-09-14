import React, { useState, useEffect } from 'react';
import axios from 'axios';

const RiesgoObstetrico = () => {
  const [formulario, setFormulario] = useState({
    numero_partos: '', embarazo_multiples: '', hipertension: '', diabetes: '', infecciones: '',
    no_abortos: '', no_hijos_muertos: '', no_hijos_vivos: '', no_cesareas: '', cirugias_previas: '',
    presion_arterial_diastolica: '', anemia: '', desnutricion: '', obesidad: '', dolor_abdominal: '',
    ictericia: '', consumo_drogas: '', observaciones: '', fecha_registro: '', id_usuario: '', id_paciente: ''
  });

  const [busqueda, setBusqueda] = useState('');
  const [sugerencias, setSugerencias] = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);
  const [conteoRiesgo, setConteoRiesgo] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem('user'));
    if (usuario?.id_usuario) {
      setFormulario(prev => ({ ...prev, id_usuario: usuario.id_usuario }));
    }
  }, []);

  useEffect(() => {
    if (formulario.id_paciente) {
      axios.get(`http://localhost:3001/api/pacientes/${formulario.id_paciente}/riesgos-obstetricos`)
        .then(res => setConteoRiesgo((res.data?.total || 0) + 1))
        .catch(() => setConteoRiesgo(1));
    }
  }, [formulario.id_paciente]);

  const seleccionarPaciente = (paciente) => {
    setSeleccionado(paciente);
    setFormulario(prev => ({ ...prev, id_paciente: paciente.id_paciente }));
    setBusqueda('');
    setSugerencias([]);
  };

  useEffect(() => {
    if (busqueda.trim().length >= 2) {
      axios.get(`http://localhost:3001/api/pacientes?nombre=${busqueda}`)
        .then(res => setSugerencias(res.data))
        .catch(() => setSugerencias([]));
    } else {
      setSugerencias([]);
    }
  }, [busqueda]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormulario({ ...formulario, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const hoy = new Date().toISOString().split('T')[0]; // yyyy-mm-dd
    const datosConFecha = { ...formulario, fecha_registro: hoy };

    try {
      await axios.post('http://localhost:3001/api/riesgos', datosConFecha);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2500);
      setFormulario({
        numero_partos: '', embarazo_multiples: '', hipertension: '', diabetes: '', infecciones: '',
        no_abortos: '', no_hijos_muertos: '', no_hijos_vivos: '', no_cesareas: '', cirugias_previas: '',
        presion_arterial_diastolica: '', anemia: '', desnutricion: '', obesidad: '', dolor_abdominal: '',
        ictericia: '', consumo_drogas: '', observaciones: '', fecha_registro: '', id_usuario: formulario.id_usuario, id_paciente: ''
      });
      setSeleccionado(null);
      setBusqueda('');
    } catch (error) {
      console.error(error);
      alert('Error al registrar el riesgo obstétrico.');
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Registro de Riesgo Obstétrico</h2>

      <div className="mb-3 position-relative">
        <label>Buscar paciente por nombre o DPI</label>
        <input
          type="text"
          className="form-control"
          value={busqueda}
          onChange={(e) => {
            setBusqueda(e.target.value);
            setSeleccionado(null);
            setFormulario(prev => ({ ...prev, id_paciente: '' }));
          }}
          placeholder="Nombre o DPI"
        />
        {sugerencias.length > 0 && (
          <ul className="list-group position-absolute w-100 shadow" style={{ zIndex: 1000 }}>
            {sugerencias.map((p) => (
              <li key={p.id_paciente} className="list-group-item list-group-item-action" onMouseDown={() => seleccionarPaciente(p)}>
                {p.nombre} — DPI: {p.dpi}
              </li>
            ))}
          </ul>
        )}
      </div>

      {seleccionado && (
        <div className="alert alert-info">
          <strong>Paciente:</strong><br />
          <strong>Nombre:</strong> {seleccionado.nombre}<br />
          <strong>DPI:</strong> {seleccionado.dpi}<br />
          <strong>Edad:</strong> {new Date().getFullYear() - new Date(seleccionado.fecha_nacimiento).getFullYear()} años<br />
          <strong>Dirección:</strong> {seleccionado.direccion}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-md-4 mb-3">
            <label>Número de registro de riesgo</label>
            <input type="number" className="form-control" value={conteoRiesgo} disabled />
          </div>
          <div className="col-md-4 mb-3">
            <label>Fecha de registro</label>
            <input type="date" name="fecha_registro" className="form-control" value={formulario.fecha_registro} onChange={handleChange} />
          </div>
          <div className="col-md-4 mb-3">
            <label>Número de partos</label>
            <input type="number" name="numero_partos" className="form-control" value={formulario.numero_partos} onChange={handleChange} />
          </div>

          <div className="col-md-4 mb-3">
            <label>Abortos</label>
            <input type="number" name="no_abortos" className="form-control" value={formulario.no_abortos} onChange={handleChange} />
          </div>

          <div className="col-md-4 mb-3">
            <label>Hijos vivos</label>
            <input type="number" name="no_hijos_vivos" className="form-control" value={formulario.no_hijos_vivos} onChange={handleChange} />
          </div>

          <div className="col-md-4 mb-3">
            <label>Hijos fallecidos</label>
            <input type="number" name="no_hijos_muertos" className="form-control" value={formulario.no_hijos_muertos} onChange={handleChange} />
          </div>

          <div className="col-md-4 mb-3">
            <label>Cesáreas</label>
            <input type="number" name="no_cesareas" className="form-control" value={formulario.no_cesareas} onChange={handleChange} />
          </div>

          {/* Selección tipo Sí/No */}
          {[
            ['embarazo_multiples', 'Embarazo múltiple'],
            ['hipertension', 'Hipertensión'],
            ['diabetes', 'Diabetes'],
            ['infecciones', 'Infecciones'],
            ['cirugias_previas', 'Cirugías previas'],
            ['anemia', 'Anemia'],
            ['desnutricion', 'Desnutrición'],
            ['obesidad', 'Obesidad'],
            ['dolor_abdominal', 'Dolor abdominal'],
            ['ictericia', 'Ictericia'],
            ['consumo_drogas', 'Consumo de drogas']
          ].map(([campo, label]) => (
            <div className="col-md-4 mb-3" key={campo}>
              <label>{label}</label>
              <select name={campo} className="form-select" value={formulario[campo]} onChange={handleChange}>
                <option value="">Seleccione</option>
                <option value="1">Sí</option>
                <option value="0">No</option>
              </select>
            </div>
          ))}

          <div className="col-md-4 mb-3">
            <label>Presión arterial diastólica</label>
            <input type="text" name="presion_arterial_diastolica" className="form-control" value={formulario.presion_arterial_diastolica} onChange={handleChange} />
          </div>


          <div className="col-md-12 mb-3">
            <label>Observaciones</label>
            <textarea name="observaciones" className="form-control" rows="3" value={formulario.observaciones} onChange={handleChange}></textarea>
          </div>
        </div>

        <button type="submit" className="btn btn-primary">Guardar</button>
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
          Riesgo obstétrico registrado correctamente.
        </div>
      )}
    </div>
  );
};

export default RiesgoObstetrico;
