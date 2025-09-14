// frontend/src/pages/Inicio.js
import React from 'react';
import './inicio.css'; 
import logoMSPAS from '../pages/assets/mspas-logo.png';
//import mspasLogo from '../pages/assets/mspas-logo.png';

const Inicio = () => {
  return (
    <div className="inicio-container">
      <div className="inicio-content">
        <img src={logoMSPAS} alt="Logo MSPAS" className="logo-mspas" />
        <h1 className="bienvenida">Bienvenido al sistema de control prenatal</h1>
        <p className="descripcion">
          Centro de Atención Permanente - Zunilito, Suchitepéquez
        </p>
      </div>
    </div>
  );
};

export default Inicio;
