import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_URL_BACKEND || '';

const ListaUsuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [mensaje, setMensaje] = useState(null);

  const [paginaActual, setPaginaActual] = useState(1);
  const usuariosPorPagina = 5;

  useEffect(() => {
    fetchUsuarios();
  }, []);

  useEffect(() => {
    if (mensaje) {
      const timer = setTimeout(() => setMensaje(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [mensaje]);

  const fetchUsuarios = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/usuarios`);
      setUsuarios(data);
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
    }
  };

  const cambiarEstado = async (id, estadoActual) => {
    try {
      const nuevoEstado = estadoActual === 1 ? 0 : 1;
      await axios.patch(`${API_URL}/api/usuarios/${id}`, { estado: nuevoEstado });
      setMensaje(`✅ Usuario ${nuevoEstado === 1 ? 'activado' : 'desactivado'} correctamente`);
      fetchUsuarios();
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      setMensaje('❌ Error al actualizar estado del usuario');
    }
  };

  const indiceUltimo = paginaActual * usuariosPorPagina;
  const indicePrimero = indiceUltimo - usuariosPorPagina;
  const usuariosPagina = usuarios.slice(indicePrimero, indiceUltimo);
  const totalPaginas = Math.ceil(usuarios.length / usuariosPorPagina);

  return (
    <div className="container mt-4">
      <h2>Gestión de Usuarios</h2>

      {mensaje && <div className="alert alert-info">{mensaje}</div>}

      <div className="table-responsive mt-3">
        <table className="table table-bordered table-hover">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuariosPagina.length > 0 ? (
              usuariosPagina.map((u) => (
                <tr key={u.id_usuario}>
                  <td>{u.id_usuario}</td>
                  <td>{u.nombre}</td>
                  <td>{u.correo}</td>
                  <td>{u.rol}</td>
                  <td>
                    {u.estado === 1 ? (
                      <span className="badge bg-success">Activo</span>
                    ) : (
                      <span className="badge bg-danger">Inactivo</span>
                    )}
                  </td>
                  <td>
                    <button
                      className={`btn btn-sm ${u.estado === 1 ? 'btn-danger' : 'btn-success'}`}
                      onClick={() => cambiarEstado(u.id_usuario, u.estado)}
                    >
                      {u.estado === 1 ? 'Desactivar' : 'Activar'}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center">No hay usuarios registrados</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPaginas > 1 && (
        <nav>
          <ul className="pagination justify-content-center">
            <li className={`page-item ${paginaActual === 1 ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => setPaginaActual(paginaActual - 1)}>Anterior</button>
            </li>

            {[...Array(totalPaginas)].map((_, index) => (
              <li key={index} className={`page-item ${paginaActual === index + 1 ? 'active' : ''}`}>
                <button className="page-link" onClick={() => setPaginaActual(index + 1)}>
                  {index + 1}
                </button>
              </li>
            ))}

            <li className={`page-item ${paginaActual === totalPaginas ? 'disabled' : ''}`}>
              <button className="page-link" onClick={() => setPaginaActual(paginaActual + 1)}>Siguiente</button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
};

export default ListaUsuarios;
