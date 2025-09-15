// frontend/src/pages/secciones/ReporteControles.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from 'recharts';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const API_URL = process.env.REACT_APP_URL_BACKEND || ''; // <-- Define esto en Render

function ReporteControles() {
  const [desde, setDesde] = useState(null);
  const [hasta, setHasta] = useState(null);
  const [mostrarTodos, setMostrarTodos] = useState(true);
  const [graficoControles, setGraficoControles] = useState([]);
  const [detalleControles, setDetalleControles] = useState([]);
  const [paginaActual, setPaginaActual] = useState(1);
  const [registrosPorPagina, setRegistrosPorPagina] = useState(10);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Helper: formatea fecha a YYYY-MM-DD
  const formatDateYYYYMMDD = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // Helper: obtiene id_usuario desde localStorage (ajusta según tu formato)
  const getUserIdFromStorage = () => {
    try {
      const userJson = localStorage.getItem('user');
      if (!userJson) return null;
      const user = JSON.parse(userJson);
      return user?.id || user?.id_usuario || null;
    } catch {
      return null;
    }
  };

  const obtenerDatos = async () => {
    setErrorMsg('');
    setLoading(true);
    try {
      if (!API_URL) {
        throw new Error('API_URL no está configurada. Define REACT_APP_URL_BACKEND en tu entorno.');
      }

      const params = {
        mostrar_todos: mostrarTodos,
        desde: desde ? formatDateYYYYMMDD(desde) : '',
        hasta: hasta ? formatDateYYYYMMDD(hasta) : ''
      };

      const response = await axios.get(`${API_URL}/api/reportes/controles/visual`, { params });
      setGraficoControles(response.data?.conteoMensual || []);
      setDetalleControles(response.data?.detalle || []);
      setPaginaActual(1);
    } catch (error) {
      console.error('Error al obtener controles:', error);
      setErrorMsg('Error al obtener controles. Revisa la consola y la configuración del backend.');
    } finally {
      setLoading(false);
    }
  };

  const descargarBlob = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  const exportarPDF = async () => {
    setErrorMsg('');
    try {
      if (!API_URL) throw new Error('API_URL no está configurada.');

      const body = {
        desde: desde ? formatDateYYYYMMDD(desde) : '',
        hasta: hasta ? formatDateYYYYMMDD(hasta) : '',
        mostrarTodos,
        id_usuario: getUserIdFromStorage() || 1
      };

      const response = await axios.post(`${API_URL}/api/reportes/controles/pdf`, body, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      descargarBlob(blob, 'reporte_controles.pdf');
    } catch (error) {
      console.error('Error al exportar PDF controles:', error);
      setErrorMsg('Error al exportar PDF. Revisa la consola y la configuración del backend.');
    }
  };

  const exportarExcel = async () => {
    setErrorMsg('');
    try {
      if (!API_URL) throw new Error('API_URL no está configurada.');

      const body = {
        desde: desde ? formatDateYYYYMMDD(desde) : '',
        hasta: hasta ? formatDateYYYYMMDD(hasta) : '',
        mostrarTodos,
        id_usuario: getUserIdFromStorage() || 1
      };

      const response = await axios.post(`${API_URL}/api/reportes/controles/excel`, body, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      descargarBlob(blob, 'reporte_controles.xlsx');
    } catch (error) {
      console.error('Error al exportar Excel controles:', error);
      setErrorMsg('Error al exportar Excel. Revisa la consola y la configuración del backend.');
    }
  };

  useEffect(() => {
    obtenerDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [desde, hasta, mostrarTodos]);

  const indiceUltimo = paginaActual * registrosPorPagina;
  const indicePrimero = indiceUltimo - registrosPorPagina;
  const controlesPaginados = Array.isArray(detalleControles) ? detalleControles.slice(indicePrimero, indiceUltimo) : [];
  const totalPaginas = Math.max(1, Math.ceil((detalleControles?.length || 0) / registrosPorPagina));

  const cambiarPagina = (nueva) => {
    if (nueva >= 1 && nueva <= totalPaginas) {
      setPaginaActual(nueva);
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4 text-center text-info">🩺 Reporte de Controles Prenatales</h2>

      {/* Filtros */}
      <div className="row gy-2 align-items-end mb-3">
        <div className="col-md-3 col-6">
          <label>Desde:</label>
          <DatePicker
            selected={desde}
            onChange={(date) => setDesde(date)}
            className="form-control"
            dateFormat="yyyy-MM-dd"
            placeholderText="Fecha inicio"
          />
        </div>
        <div className="col-md-3 col-6">
          <label>Hasta:</label>
          <DatePicker
            selected={hasta}
            onChange={(date) => setHasta(date)}
            className="form-control"
            dateFormat="yyyy-MM-dd"
            placeholderText="Fecha fin"
          />
        </div>
        <div className="col-md-3 col-12">
          <div className="form-check mt-2">
            <input
              className="form-check-input"
              type="checkbox"
              checked={mostrarTodos}
              onChange={() => setMostrarTodos(!mostrarTodos)}
              id="verTodosControles"
            />
            <label className="form-check-label" htmlFor="verTodosControles">
              Ver todos los controles
            </label>
          </div>
        </div>
        <div className="col-md-3 col-12 d-flex justify-content-md-end gap-2">
          <button className="btn btn-danger w-100 w-md-auto" onClick={exportarPDF} disabled={loading}>📄 Exportar PDF</button>
          <button className="btn btn-success w-100 w-md-auto" onClick={exportarExcel} disabled={loading}>📊 Exportar Excel</button>
        </div>
      </div>

      {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}
      {loading && <div className="mb-3">Cargando datos...</div>}

      {/* Gráfico */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">📈 Controles por mes</h5>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={graficoControles || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="cantidad" fill="#007bff" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabla de detalle */}
      <div className="card mb-5">
        <div className="card-body">
          <h5 className="card-title">📋 Detalle de controles</h5>

          <div className="mb-3">
            <label>Registros por página: </label>
            <select
              className="form-select w-auto d-inline-block ms-2"
              value={registrosPorPagina}
              onChange={(e) => {
                setRegistrosPorPagina(Number(e.target.value));
                setPaginaActual(1);
              }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div className="table-responsive">
            <table className="table table-bordered table-striped">
              <thead className="table-light">
                <tr>
                  <th>Fecha</th>
                  <th>Paciente</th>
                  <th>DPI</th>
                  <th>Edad Gestacional</th>
                  <th>Peso</th>
                  <th>Presión</th>
                  <th>Altura Uterina</th>
                  <th>FCF</th>
                  <th>Mov. Fetales</th>
                </tr>
              </thead>
              <tbody>
                {controlesPaginados.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center">No hay registros</td>
                  </tr>
                ) : (
                  controlesPaginados.map((c, i) => (
                    <tr key={i}>
                      <td>{c?.fecha_control ? formatDateYYYYMMDD(c.fecha_control) : ''}</td>
                      <td>{c?.nombre_paciente || ''}</td>
                      <td>{c?.dpi || ''}</td>
                      <td>{c?.edad_gestacional || ''}</td>
                      <td>{c?.peso || ''}</td>
                      <td>{c?.presion_arterial || ''}</td>
                      <td>{c?.altura_uterina || ''}</td>
                      <td>{c?.frecuencia_cardiaca_fetal || ''}</td>
                      <td>{c?.movimientos_fetales || ''}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="d-flex justify-content-between align-items-center mt-3">
            <button
              className="btn btn-outline-primary"
              onClick={() => cambiarPagina(paginaActual - 1)}
              disabled={paginaActual === 1}
            >⬅ Anterior</button>
            <span>Página {paginaActual} de {totalPaginas}</span>
            <button
              className="btn btn-outline-primary"
              onClick={() => cambiarPagina(paginaActual + 1)}
              disabled={paginaActual === totalPaginas}
            >Siguiente ➡</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReporteControles;
