// frontend/src/pages/secciones/ReporteControles.js

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from 'recharts';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

function ReporteControles() {
  const [desde, setDesde] = useState(null);
  const [hasta, setHasta] = useState(null);
  const [mostrarTodos, setMostrarTodos] = useState(true);
  const [graficoControles, setGraficoControles] = useState([]);
  const [detalleControles, setDetalleControles] = useState([]);
  const [paginaActual, setPaginaActual] = useState(1);
  const [registrosPorPagina, setRegistrosPorPagina] = useState(10);

  const obtenerDatos = async () => {
    try {
      const params = {
        mostrar_todos: mostrarTodos,
        desde: desde ? desde.toISOString().slice(0, 10) : '',
        hasta: hasta ? hasta.toISOString().slice(0, 10) : ''
      };
      const response = await axios.get('http://localhost:3001/api/reportes/controles/visual', { params });
      setGraficoControles(response.data.conteoMensual);
      setDetalleControles(response.data.detalle);
      setPaginaActual(1);
    } catch (error) {
      console.error('Error al obtener controles:', error);
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
      const response = await axios.post('http://localhost:3001/api/reportes/controles/pdf', body, {
        responseType: 'blob'
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'reporte_controles.pdf';
      a.click();
    } catch (error) {
      console.error('Error al exportar PDF controles:', error);
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
      const response = await axios.post('http://localhost:3001/api/reportes/controles/excel', body, {
        responseType: 'blob'
      });
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'reporte_controles.xlsx';
      a.click();
    } catch (error) {
      console.error('Error al exportar Excel controles:', error);
    }
  };

  useEffect(() => {
    obtenerDatos();
  }, [desde, hasta, mostrarTodos]);

  const indiceUltimo = paginaActual * registrosPorPagina;
  const indicePrimero = indiceUltimo - registrosPorPagina;
  const controlesPaginados = detalleControles.slice(indicePrimero, indiceUltimo);
  const totalPaginas = Math.ceil(detalleControles.length / registrosPorPagina);

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
          <button className="btn btn-danger w-100 w-md-auto" onClick={exportarPDF}>📄 Exportar PDF</button>
          <button className="btn btn-success w-100 w-md-auto" onClick={exportarExcel}>📊 Exportar Excel</button>
        </div>
      </div>

      {/* Gráfico */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">📈 Controles por mes</h5>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={graficoControles}>
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
                  <th>Edad Gestacional</th>
                  <th>Peso</th>
                  <th>Presión</th>
                  <th>Altura Uterina</th>
                  <th>FCF</th>
                  <th>Mov. Fetales</th>
                </tr>
              </thead>
              <tbody>
                {controlesPaginados.map((c, i) => (
                  <tr key={i}>
                    <td>{new Date(c.fecha_control).toISOString().split('T')[0]}</td>
                    <td>{c.nombre_paciente}</td>
                    <td>{c.dpi}</td>
                    <td>{c.edad_gestacional}</td>
                    <td>{c.peso}</td>
                    <td>{c.presion_arterial}</td>
                    <td>{c.altura_uterina}</td>
                    <td>{c.frecuencia_cardiaca_fetal}</td>
                    <td>{c.movimientos_fetales}</td>
                  </tr>
                ))}
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
  