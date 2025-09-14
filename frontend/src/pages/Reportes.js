import React, { useState } from 'react';
import ReportePacientes from './secciones/ReportePacientes';
import ReporteControles from './secciones/ReporteControles';
import ReporteRiesgos from './secciones/ReporteRiesgos';
import ReporteCitas from './secciones/ReporteCitas';
import './reportes.css';

function Reportes() {
  const [pestanaActiva, setPestanaActiva] = useState('pacientes');

  const renderContenido = () => {
    switch (pestanaActiva) {
      case 'pacientes':
        return <ReportePacientes />;
      case 'controles':
        return <ReporteControles />;
      case 'riesgos':
        return <ReporteRiesgos />;
      case 'citas':
        return <ReporteCitas />;
      default:
        return null;
    }
  };

  return (
    <div className="container mt-4 reportes-container">
      <h2 className="mb-4 text-center text-primary">📊 Módulo de Reportes</h2>

      {/* Pestañas responsivas */}
      <div className="overflow-auto">
        <ul className="nav nav-tabs flex-nowrap mb-4" role="tablist" style={{ overflowX: 'auto' }}>
          <li className="nav-item">
            <button
              className={`nav-link ${pestanaActiva === 'pacientes' ? 'active' : ''}`}
              onClick={() => setPestanaActiva('pacientes')}
            >
              👩‍⚕️ Pacientes
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${pestanaActiva === 'controles' ? 'active' : ''}`}
              onClick={() => setPestanaActiva('controles')}
            >
              🩺 Controles Prenatales
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${pestanaActiva === 'riesgos' ? 'active' : ''}`}
              onClick={() => setPestanaActiva('riesgos')}
            >
              ⚠️ Riesgos Obstétricos
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${pestanaActiva === 'citas' ? 'active' : ''}`}
              onClick={() => setPestanaActiva('citas')}
            >
              📅 Citas de Seguimiento
            </button>
          </li>
        </ul>
      </div>

      {renderContenido()}
    </div>
  );
}

export default Reportes;
