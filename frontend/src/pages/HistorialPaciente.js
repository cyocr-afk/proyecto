import React, { useState } from 'react';
import axios from 'axios';
import './HistorialPaciente.css';

const API = 'http://localhost:3001/api';

const HistorialClinico = () => {
  const [term, setTerm] = useState('');
  const [sugerencias, setSugerencias] = useState([]);
  const [loadingSug, setLoadingSug] = useState(false);
  const [datos, setDatos] = useState(null);
  const [loading, setLoading] = useState(false);

  const formatearFecha = (fechaStr) => {
    if (!fechaStr) return 'N/A';
    return new Date(fechaStr).toISOString().split('T')[0];
  };

  const limpiarHoras = (texto) => {
    if (!texto) return '';
    return texto.replace(/T\d{2}:\d{2}:\d{2}(\.\d+)?Z?/g, '');
  };

  const buscarPaciente = async (value) => {
    setTerm(value);
    setDatos(null);
    if (!value || value.length < 2) return setSugerencias([]);

    setLoadingSug(true);
    try {
      const { data } = await axios.get(`${API}/pacientes`, { params: { nombre: value } });
      setSugerencias(data);
    } catch (err) {
      console.error(err);
      setSugerencias([]);
    } finally {
      setLoadingSug(false);
    }
  };

  const seleccionarPaciente = async (paciente) => {
    setTerm(`${paciente.nombre}`);
    setSugerencias([]);
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/historialpaciente`, {
        params: { id_paciente: paciente.id_paciente },
      });
      if (data.ok) setDatos(data.data);
      else alert('No se encontró historial.');
    } catch (err) {
      console.error(err);
      alert('Error al consultar historial.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-3">
      <h2 className="mb-4 text-primary border-bottom pb-2">Historial Clínico</h2>

      <div className="mb-4 position-relative">
        <label className="form-label">Buscar paciente</label>
        <input
          type="text"
          className="form-control"
          placeholder="Nombre o DPI"
          value={term}
          onChange={(e) => buscarPaciente(e.target.value)}
        />
        {sugerencias.length > 0 && (
          <div className="list-group position-absolute shadow w-100 z-3">
            {sugerencias.map((p) => (
              <button
                key={p.id_paciente}
                type="button"
                className="list-group-item list-group-item-action"
                onClick={() => seleccionarPaciente(p)}
              >
                {p.nombre} - {p.dpi}
              </button>
            ))}
          </div>
        )}
        {loadingSug && <small className="text-muted">Buscando…</small>}
      </div>

      {loading && <div className="alert alert-info">Cargando historial…</div>}

      {datos && (
        <div className="historial-container">
          {/* Paciente */}
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h5 className="card-title border-bottom pb-2">Información del Paciente</h5>
              <div className="row">
                <div className="col-md-6"><strong>Nombre:</strong> {datos.nombre}</div>
                <div className="col-md-6"><strong>DPI:</strong> {datos.dpi}</div>
                <div className="col-md-6"><strong>Fecha de nacimiento:</strong> {formatearFecha(datos.fecha_nacimiento)}</div>
                <div className="col-md-6"><strong>Edad:</strong> {datos.edad} años</div>
              </div>
            </div>
          </div>

          {/* Controles */}
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h5 className="card-title border-bottom pb-2">Controles Prenatales</h5>
              <p><strong>Total:</strong> {datos.total_controles}</p>
              <p><strong>Último control:</strong> {formatearFecha(datos.ultima_fecha_control)}</p>
              <pre className="bg-light p-3 rounded">{limpiarHoras(datos.detalles_controles) || 'Sin registros'}</pre>
            </div>
          </div>

          {/* Riesgos */}
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h5 className="card-title border-bottom pb-2">Riesgos Obstétricos</h5>
              <p><strong>Total:</strong> {datos.total_riesgos}</p>
              <p><strong>Último registro:</strong> {formatearFecha(datos.ultima_fecha_riesgo)}</p>
              <pre className="bg-light p-3 rounded">{limpiarHoras(datos.detalles_riesgos) || 'Sin registros'}</pre>
            </div>
          </div>

          {/* Citas */}
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <h5 className="card-title border-bottom pb-2">Citas Médicas</h5>
              <p><strong>Próxima cita:</strong> {formatearFecha(datos.proxima_cita)}</p>
              <pre className="bg-light p-3 rounded">{limpiarHoras(datos.detalles_citas) || 'Sin citas registradas'}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistorialClinico;
