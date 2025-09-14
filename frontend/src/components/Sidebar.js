// src/components/Sidebar.jsx
import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import 'bootstrap-icons/font/bootstrap-icons.css';
//import './Sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <>
      {/* Botón hamburguesa solo en móvil */}
      {isMobile && (
        <button
          className="btn btn-dark position-fixed top-0 start-0 m-2 z-3"
          onClick={() => setShowMenu(true)}
          style={{ zIndex: 1050 }}
        >
          <i className="bi bi-list"></i>
        </button>
      )}

      {/* Sidebar - Offcanvas en móviles, fijo en escritorio */}
      <div
        className={`bg-dark text-white ${isMobile ? 'offcanvas offcanvas-start show' : 'position-fixed'} h-100 d-flex flex-column`}
        style={{ width: '250px', zIndex: isMobile ? 1049 : 100 }}
        tabIndex="-1"
        id="sidebarMenu"
      >
        <div className="p-4 border-bottom border-secondary d-flex justify-content-between align-items-center">
          <h4 className="fw-bold m-0">Control Prenatal</h4>
          {isMobile && (
            <button className="btn btn-sm btn-outline-light" onClick={() => setShowMenu(false)}>
              <i className="bi bi-x-lg"></i>
            </button>
          )}
        </div>

        <small className="text-secondary px-4 mt-1">
          {user?.nombre ? `${user.nombre} • ${user?.rol || ''}` : 'Usuario'}
        </small>

        <nav className="p-3 d-flex flex-column gap-2 flex-grow-1 overflow-auto">
          <NavLink to="/inicio" className="text-white text-decoration-none d-flex align-items-center gap-2">
            <i className="bi bi-house-door"></i> Inicio
          </NavLink>

           {/* ✅ Nueva opción SOLO para Administradores */}
          {user?.rol === 'Administrador' && (
            <>
            <NavLink to="/usuarios/registro" className="text-white text-decoration-none d-flex align-items-center gap-2">
              <i className="bi bi-person-badge"></i> Registrar Usuario
            </NavLink>

            <NavLink to="/usuarios/lista" className="text-white text-decoration-none d-flex align-items-center gap-2">
            <i className="bi bi-people"></i> Lista de Usuarios
            </NavLink>
            </>
          )}


        

          <NavLink to="/pacientes/registro" className="text-white text-decoration-none d-flex align-items-center gap-2">
            <i className="bi bi-person-plus"></i> Registro Paciente
          </NavLink>
          <NavLink to="/controlprenatal" className="text-white text-decoration-none d-flex align-items-center gap-2">
            <i className="bi bi-journal-medical"></i> Control Prenatal
          </NavLink>
          <NavLink to="/riesgoobstetrico" className="text-white text-decoration-none d-flex align-items-center gap-2">
            <i className="bi bi-heart-pulse"></i> Riesgo Obstétrico
          </NavLink>
          <NavLink to="/alertas" className="text-white text-decoration-none d-flex align-items-center gap-2">
            <i className="bi bi-exclamation-triangle-fill"></i> Alertas Clínicas
          </NavLink>
          <NavLink to="/agendacita" className="text-white text-decoration-none d-flex align-items-center gap-2">
            <i className="bi bi-calendar-check"></i> Citas Seguimiento
          </NavLink>
          <NavLink to="/historialpaciente" className="text-white text-decoration-none d-flex align-items-center gap-2">
            <i className="bi bi-folder2-open"></i> Historial Clínico
          </NavLink>
          <NavLink to="/reportes" className="text-white text-decoration-none d-flex align-items-center gap-2">
            <i className="bi bi-file-earmark-bar-graph"></i> Reportes
          </NavLink>
        </nav>

        <div className="p-3 border-top border-secondary">
          <button
            type="button"
            className="btn btn-outline-light w-100 d-flex align-items-center justify-content-center gap-2"
            onClick={handleLogout}
          >
            <i className="bi bi-box-arrow-right"></i>
            Cerrar sesión
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;