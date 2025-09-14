// ReporteCitas.js - Vista de reporte de citas de seguimiento (Responsive)
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function ReporteCitas() {
  const [desde, setDesde] = useState(null);
  const [hasta, setHasta] = useState(null);
  const [mostrarTodos, setMostrarTodos] = useState(true);
  const [graficoCitas, setGraficoCitas] = useState([]);
  const [detalleCitas, setDetalleCitas] = useState([]);
  const [paginaActual, setPaginaActual] = useState(1);
  const [registrosPorPagina, setRegistrosPorPagina] = useState(10);

  const obtenerDatos = async () => {
    try {
      const params = {
        mostrar_todos: mostrarTodos,
        desde: desde ? desde.toISOString().slice(0, 10) : '',
        hasta: hasta ? hasta.toISOString().slice(0, 10) : ''
      };

      const response = await axios.get('http://localhost:3001/api/reportes/citas/visual', { params });
      setGraficoCitas(response.data.distribucion);
      setDetalleCitas(response.data.detalle);
      setPaginaActual(1);
    } catch (error) {
      console.error('Error al obtener citas:', error);
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

      const response = await axios.post('http://localhost:3001/api/reportes/citas/pdf', body, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'reporte_citas.pdf';
      a.click();
    } catch (error) {
      console.error('Error al exportar PDF citas:', error);
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

      const response = await axios.post('http://localhost:3001/api/reportes/citas/excel', body, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'reporte_citas.xlsx';
      a.click();
    } catch (error) {
      console.error('Error al exportar Excel citas:', error);
    }
  };

  useEffect(() => {
    obtenerDatos();
  }, [desde, hasta, mostrarTodos]);

  const indiceUltimo = paginaActual * registrosPorPagina;
  const indicePrimero = indiceUltimo - registrosPorPagina;
  const citasPaginadas = detalleCitas.slice(indicePrimero, indiceUltimo);
  const totalPaginas = Math.ceil(detalleCitas.length / registrosPorPagina);

  const cambiarPagina = (nueva) => {
    if (nueva >= 1 && nueva <= totalPaginas) {
      setPaginaActual(nueva);
    }
  };

  const COLORS = ['#007bff', '#28a745', '#dc3545'];

  return (
    <div className="container-fluid px-3 px-md-5 mt-4">
      <h2 className="mb-4 text-center text-info">📅 Reporte de Citas de Seguimiento</h2>

      <div className="row gy-3 align-items-end mb-3">
        <div className="col-12 col-sm-6 col-md-3">
          <label>Desde:</label>
          <DatePicker
            selected={desde}
            onChange={(date) => setDesde(date)}
            className="form-control"
            dateFormat="yyyy-MM-dd"
            placeholderText="Fecha inicio"
          />
        </div>
        <div className="col-12 col-sm-6 col-md-3">
          <label>Hasta:</label>
          <DatePicker
            selected={hasta}
            onChange={(date) => setHasta(date)}
            className="form-control"
            dateFormat="yyyy-MM-dd"
            placeholderText="Fecha fin"
          />
        </div>
        <div className="col-12 col-sm-6 col-md-3">
          <div className="form-check mt-2">
            <input
              className="form-check-input"
              type="checkbox"
              checked={mostrarTodos}
              onChange={() => setMostrarTodos(!mostrarTodos)}
              id="verTodasCitas"
            />
            <label className="form-check-label" htmlFor="verTodasCitas">
              Ver todas las citas
            </label>
          </div>
        </div>
        <div className="col-12 col-sm-6 col-md-3 d-flex flex-wrap gap-2">
          <button className="btn btn-danger w-100" onClick={exportarPDF}>📄 Exportar PDF</button>
          <button className="btn btn-success w-100" onClick={exportarExcel}>📊 Exportar Excel</button>
        </div>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">📊 Distribución por estado</h5>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={graficoCitas} dataKey="valor" nameKey="estado" cx="50%" cy="50%" outerRadius={100} label>
                {graficoCitas.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card mb-5">
        <div className="card-body">
          <h5 className="card-title">📄 Detalle de citas</h5>

          <div className="mb-3">
            <label>Registros por página: </label>
            <select
              className="form-select w-auto d-inline-block ms-2"
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
                  <th>Hora</th>
                  <th>Paciente</th>
                  <th>DPI</th>
                  <th>Motivo</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {citasPaginadas.map((c, i) => (
                  <tr key={i}>
                    <td>{new Date(c.fecha_cita).toISOString().split('T')[0]}</td>
                    <td>{c.hora}</td>
                    <td>{c.nombre_paciente}</td>
                    <td>{c.dpi}</td>
                    <td>{c.motivo}</td>
                    <td>{c.estado}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-3 gap-2">
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

export default ReporteCitas;
