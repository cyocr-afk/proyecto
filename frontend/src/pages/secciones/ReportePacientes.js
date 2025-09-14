import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';


function Reportes() {
  const [desde, setDesde] = useState(null);
  const [hasta, setHasta] = useState(null);
  const [mostrarTodos, setMostrarTodos] = useState(true);
  const [graficoPacientes, setGraficoPacientes] = useState([]);
  const [detallePacientes, setDetallePacientes] = useState([]);

  // Paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [registrosPorPagina, setRegistrosPorPagina] = useState(10);

  const obtenerDatos = async () => {
    try {
      const params = {
        mostrar_todos: mostrarTodos,
        desde: desde ? desde.toISOString().slice(0, 10) : '',
        hasta: hasta ? hasta.toISOString().slice(0, 10) : ''
      };

      const response = await axios.get('http://localhost:3001/api/reportes/pacientes/visual', { params });
      setGraficoPacientes(response.data.conteoMensual);
      setDetallePacientes(response.data.detalle);
      setPaginaActual(1); // Reinicia a la primera página
    } catch (error) {
      console.error('Error al obtener datos:', error);
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

      const response = await axios.post('http://localhost:3001/api/reportes/pacientes/pdf', body, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'reporte_pacientes.pdf';
      a.click();
    } catch (error) {
      console.error('Error al exportar PDF:', error);
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

      const response = await axios.post('http://localhost:3001/api/reportes/pacientes/excel', body, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'reporte_pacientes.xlsx';
      a.click();
    } catch (error) {
      console.error('Error al exportar Excel:', error);
    }
  };

  useEffect(() => {
    obtenerDatos();
  }, [desde, hasta, mostrarTodos]);

  // Cálculo de paginación
  const indiceUltimo = paginaActual * registrosPorPagina;
  const indicePrimero = indiceUltimo - registrosPorPagina;
  const pacientesPaginados = detallePacientes.slice(indicePrimero, indiceUltimo);
  const totalPaginas = Math.ceil(detallePacientes.length / registrosPorPagina);

  const cambiarPagina = (nueva) => {
    if (nueva >= 1 && nueva <= totalPaginas) {
      setPaginaActual(nueva);
    }
  };

  return (
    <div className="container mt-4 reportes-container">
      <h2 className="mb-4 text-center text-primary">📋 Reporte de Pacientes</h2>

      {/* 🔍 Filtros */}
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
              id="verTodos"
            />
            <label className="form-check-label" htmlFor="verTodos">
              Ver todos los pacientes
            </label>
          </div>
        </div>
        <div className="col-md-3 col-12 d-flex justify-content-md-end gap-2">
          <button className="btn btn-danger w-100 w-md-auto" onClick={exportarPDF}>
            📄 Exportar PDF
          </button>
          <button className="btn btn-success w-100 w-md-auto" onClick={exportarExcel}>
            📊 Exportar Excel
          </button>
        </div>
      </div>

      {/* 📈 Gráfico */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">📈 Pacientes registrados por mes</h5>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={graficoPacientes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="cantidad" fill="#007bff" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 📋 Tabla de detalle con paginación */}
      <div className="card mb-5">
        <div className="card-body">
          <h5 className="card-title">📄 Detalle de pacientes</h5>

          {/* Selector de registros por página */}
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
                  <th>Fecha de Registro</th>
                  <th>Nombre</th>
                  <th>CUI/DPI</th>
                  <th>Edad</th>
                  <th>Fecha de Nacimiento</th>
                  <th>Dirección</th>
                  <th>Teléfono</th>
                </tr>
              </thead>
              <tbody>
                {pacientesPaginados.map((p, i) => (
                  <tr key={i}>
                    <td>{new Date(p.fecha_registro).toISOString().split('T')[0]}</td>
                    <td>{p.nombre}</td>
                    <td>{p.dpi}</td>
                    <td>{p.edad}</td>
                    <td>{new Date(p.fecha_nacimiento).toISOString().split('T')[0]}</td>
                    <td>{p.direccion}</td>
                    <td>{p.telefono}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 🔄 Controles de paginación */}
          <div className="d-flex justify-content-between align-items-center mt-3">
            <button
              className="btn btn-outline-primary"
              onClick={() => cambiarPagina(paginaActual - 1)}
              disabled={paginaActual === 1}
            >
              ⬅ Anterior
            </button>
            <span>Página {paginaActual} de {totalPaginas}</span>
            <button
              className="btn btn-outline-primary"
              onClick={() => cambiarPagina(paginaActual + 1)}
              disabled={paginaActual === totalPaginas}
            >
              Siguiente ➡
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reportes;
