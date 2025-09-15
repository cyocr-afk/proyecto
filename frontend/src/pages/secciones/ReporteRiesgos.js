// frontend/src/pages/secciones/ReporteRiesgos.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const API_URL = process.env.REACT_APP_URL_BACKEND || ''; // <-- Define esto en Render

function ReporteRiesgos() {
  const [desde, setDesde] = useState(null);
  const [hasta, setHasta] = useState(null);
  const [mostrarTodos, setMostrarTodos] = useState(true);
  const [graficoRiesgos, setGraficoRiesgos] = useState([]);
  const [detalleRiesgos, setDetalleRiesgos] = useState([]);
  const [paginaActual, setPaginaActual] = useState(1);
  const [registrosPorPagina, setRegistrosPorPagina] = useState(10);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Helper: formatea fecha a YYYY-MM-DD
  const formatDateYYYYMMDD = (date) => {
    if (!date) return '';
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return '';
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // Helper: obtiene id_usuario desde localStorage (ajusta si tu formato es diferente)
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

      const response = await axios.get(`${API_URL}/api/reportes/riesgos/visual`, { params });
      setGraficoRiesgos(response.data?.distribucion || []);
      setDetalleRiesgos(response.data?.detalle || []);
      setPaginaActual(1);
    } catch (error) {
      console.error('Error al obtener riesgos:', error);
      setErrorMsg('Error al obtener datos. Revisa la consola y que REACT_APP_URL_BACKEND esté configurada.');
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

      const response = await axios.post(`${API_URL}/api/reportes/riesgos/pdf`, body, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      descargarBlob(blob, 'reporte_riesgos.pdf');
    } catch (error) {
      console.error('Error al exportar PDF riesgos:', error);
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

      const response = await axios.post(`${API_URL}/api/reportes/riesgos/excel`, body, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      descargarBlob(blob, 'reporte_riesgos.xlsx');
    } catch (error) {
      console.error('Error al exportar Excel riesgos:', error);
      setErrorMsg('Error al exportar Excel. Revisa la consola y la configuración del backend.');
    }
  };

  useEffect(() => {
    obtenerDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [desde, hasta, mostrarTodos]);

  const indiceUltimo = paginaActual * registrosPorPagina;
  const indicePrimero = indiceUltimo - registrosPorPagina;
  const riesgosArray = Array.isArray(detalleRiesgos) ? detalleRiesgos : [];
  const riesgosPaginados = riesgosArray.slice(indicePrimero, indiceUltimo);
  const totalPaginas = Math.max(1, Math.ceil((riesgosArray.length || 0) / registrosPorPagina));

  const cambiarPagina = (nueva) => {
    if (nueva >= 1 && nueva <= totalPaginas) {
      setPaginaActual(nueva);
    }
  };

  return (
    <div className="container-fluid mt-4 px-3">
      <h2 className="mb-4 text-center text-warning">⚠️ Reporte de Riesgos Obstétricos</h2>

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
              id="verTodosRiesgos"
            />
            <label className="form-check-label" htmlFor="verTodosRiesgos">
              Ver todos los registros
            </label>
          </div>
        </div>
        <div className="col-md-3 col-12 d-flex flex-wrap justify-content-md-end gap-2">
          <button className="btn btn-danger w-100 w-md-auto" onClick={exportarPDF} disabled={loading}>📄 Exportar PDF</button>
          <button className="btn btn-success w-100 w-md-auto" onClick={exportarExcel} disabled={loading}>📊 Exportar Excel</button>
        </div>
      </div>

      {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}
      {loading && <div className="mb-3">Cargando datos...</div>}

      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">📊 Distribución de Riesgos</h5>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={Array.isArray(graficoRiesgos) ? graficoRiesgos : []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nombre" interval={0} angle={-30} textAnchor="end" height={80} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="valor" fill="#ffc107" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card mb-5">
        <div className="card-body">
          <h5 className="card-title">📄 Detalle de riesgos</h5>

          <div className="mb-3 d-flex flex-wrap align-items-center gap-2">
            <label>Registros por página:</label>
            <select
              className="form-select w-auto"
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
                  <th>Partos</th>
                  <th>Abortos</th>
                  <th>Hijos Vivos</th>
                  <th>Hijos Muertos</th>
                  <th>Observaciones</th>
                </tr>
              </thead>
              <tbody>
                {riesgosPaginados.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center">No hay registros</td>
                  </tr>
                ) : (
                  riesgosPaginados.map((r, i) => (
                    <tr key={i}>
                      <td>{r?.fecha_registro ? formatDateYYYYMMDD(r.fecha_registro) : ''}</td>
                      <td>{r?.nombre_paciente || ''}</td>
                      <td>{r?.dpi || ''}</td>
                      <td>{r?.numero_partos ?? ''}</td>
                      <td>{r?.no_abortos ?? ''}</td>
                      <td>{r?.no_hijos_vivos ?? ''}</td>
                      <td>{r?.no_hijos_muertos ?? ''}</td>
                      <td>{r?.observaciones || ''}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2">
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

export default ReporteRiesgos;
