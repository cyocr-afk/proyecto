import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function ReporteRiesgos() {
  const [desde, setDesde] = useState(null);
  const [hasta, setHasta] = useState(null);
  const [mostrarTodos, setMostrarTodos] = useState(true);
  const [graficoRiesgos, setGraficoRiesgos] = useState([]);
  const [detalleRiesgos, setDetalleRiesgos] = useState([]);
  const [paginaActual, setPaginaActual] = useState(1);
  const [registrosPorPagina, setRegistrosPorPagina] = useState(10);

  const obtenerDatos = async () => {
    try {
      const params = {
        mostrar_todos: mostrarTodos,
        desde: desde ? desde.toISOString().slice(0, 10) : '',
        hasta: hasta ? hasta.toISOString().slice(0, 10) : ''
      };
      const response = await axios.get('http://localhost:3001/api/reportes/riesgos/visual', { params });
      setGraficoRiesgos(response.data.distribucion);
      setDetalleRiesgos(response.data.detalle);
      setPaginaActual(1);
    } catch (error) {
      console.error('Error al obtener riesgos:', error);
    }
  };

  const exportarPDF = async () => {
    try {
      const body = {
        desde: desde ? desde.toISOString().slice(0, 10) : '',
        hasta: hasta ? hasta.toISOString().slice(0, 10) : '',
        mostrarTodos,
        id_usuario: localStorage.getItem('id_usuario') || 1
      };
      const response = await axios.post('http://localhost:3001/api/reportes/riesgos/pdf', body, {
        responseType: 'blob'
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'reporte_riesgos.pdf';
      a.click();
    } catch (error) {
      console.error('Error al exportar PDF riesgos:', error);
    }
  };

  const exportarExcel = async () => {
    try {
      const body = {
        desde: desde ? desde.toISOString().slice(0, 10) : '',
        hasta: hasta ? hasta.toISOString().slice(0, 10) : '',
        mostrarTodos,
        id_usuario: localStorage.getItem('id_usuario') || 1
      };
      const response = await axios.post('http://localhost:3001/api/reportes/riesgos/excel', body, {
        responseType: 'blob'
      });
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'reporte_riesgos.xlsx';
      a.click();
    } catch (error) {
      console.error('Error al exportar Excel riesgos:', error);
    }
  };

  useEffect(() => {
    obtenerDatos();
  }, [desde, hasta, mostrarTodos]);

  const indiceUltimo = paginaActual * registrosPorPagina;
  const indicePrimero = indiceUltimo - registrosPorPagina;
  const riesgosPaginados = detalleRiesgos.slice(indicePrimero, indiceUltimo);
  const totalPaginas = Math.ceil(detalleRiesgos.length / registrosPorPagina);

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
          <button className="btn btn-danger w-100 w-md-auto" onClick={exportarPDF}>📄 Exportar PDF</button>
          <button className="btn btn-success w-100 w-md-auto" onClick={exportarExcel}>📊 Exportar Excel</button>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">📊 Distribución de Riesgos</h5>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={graficoRiesgos}>
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
              onChange={(e) => setRegistrosPorPagina(Number(e.target.value))}
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
                {riesgosPaginados.map((r, i) => (
                  <tr key={i}>
                    <td>{new Date(r.fecha_registro).toISOString().split('T')[0]}</td>
                    <td>{r.nombre_paciente}</td>
                    <td>{r.dpi}</td>
                    <td>{r.numero_partos}</td>
                    <td>{r.no_abortos}</td>
                    <td>{r.no_hijos_vivos}</td>
                    <td>{r.no_hijos_muertos}</td>
                    <td>{r.observaciones}</td>
                  </tr>
                ))}
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
