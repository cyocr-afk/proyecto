// src/pages/AlertaClinica.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

const AlertaClinica = () => {
  const [formulario, setFormulario] = useState({
    tipo_alerta: "",
    descripcion: "",
    fecha_generada: "",
    id_paciente: ""
  });

  const [pacientes, setPacientes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [resultados, setResultados] = useState([]);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);

  const id_usuario = JSON.parse(localStorage.getItem("user"))?.id_usuario || 1;

  useEffect(() => {
    axios.get("http://localhost:3001/api/pacientes")
      .then(res => setPacientes(res.data))
      .catch(err => console.error(err));
  }, []);

  const calcularEdad = (fechaNacimiento) => {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const m = hoy.getMonth() - nacimiento.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };

  const handleBusqueda = (e) => {
    const valor = e.target.value;
    setBusqueda(valor);
    if (valor.length > 0) {
      const filtrados = pacientes.filter(
        p => p.nombre.toLowerCase().includes(valor.toLowerCase()) || p.dpi.includes(valor)
      );
      setResultados(filtrados);
    } else {
      setResultados([]);
      setPacienteSeleccionado(null);
    }
  };

  const seleccionarPaciente = (paciente) => {
    setBusqueda(`${paciente.nombre} - ${paciente.dpi}`);
    setPacienteSeleccionado(paciente);
    setResultados([]);
    setFormulario({ ...formulario, id_paciente: paciente.id_paciente });
  };

  const handleChange = (e) => {
    setFormulario({ ...formulario, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!pacienteSeleccionado) {
      Swal.fire({ icon: 'warning', title: 'Falta paciente', text: 'Debe seleccionar un paciente.' });
      return;
    }
    if (!formulario.tipo_alerta) {
      Swal.fire({ icon: 'warning', title: 'Tipo de alerta requerido', text: 'Seleccione un tipo de alerta.' });
      return;
    }
    if (!formulario.descripcion || formulario.descripcion.trim().length < 10) {
      Swal.fire({ icon: 'warning', title: 'Descripción inválida', text: 'Debe tener al menos 10 caracteres.' });
      return;
    }
    if (!formulario.fecha_generada) {
      Swal.fire({ icon: 'warning', title: 'Fecha requerida', text: 'Debe ingresar la fecha de la alerta.' });
      return;
    }

    const datos = {
      ...formulario,
      fecha_generada: formulario.fecha_generada + " 00:00:00",
      id_usuario,
    };

    Swal.fire({
      title: '¿Está segura?',
      text: 'Se registrará una nueva alerta clínica para esta paciente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33'
    }).then((result) => {
      if (result.isConfirmed) {
        axios.post("http://localhost:3001/api/alertas", datos)
          .then(() => {
            Swal.fire({
              icon: 'success',
              title: 'Registro exitoso',
              text: 'La alerta fue registrada correctamente.',
              timer: 2000,
              showConfirmButton: false
            });
            setFormulario({ tipo_alerta: "", descripcion: "", fecha_generada: "", id_paciente: "" });
            setPacienteSeleccionado(null);
            setBusqueda("");
          })
          .catch(() => {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo registrar la alerta.'
            });
          });
      }
    });
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">🚨 Registro de Alerta Clínica</h2>

      {/* Buscador de paciente */}
      <div className="mb-3 position-relative">
        <label className="form-label">Buscar Paciente</label>
        <input
          type="text"
          className="form-control"
          value={busqueda}
          onChange={handleBusqueda}
          placeholder="Buscar por nombre o DPI"
        />
        {resultados.length > 0 && (
          <ul className="list-group position-absolute w-100 shadow" style={{ zIndex: 10 }}>
            {resultados.map((p) => (
              <li
                key={p.id_paciente}
                className="list-group-item list-group-item-action"
                onClick={() => seleccionarPaciente(p)}
                style={{ cursor: "pointer" }}
              >
                {p.nombre} - {p.dpi}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Datos del paciente */}
      {pacienteSeleccionado && (
        <div className="alert alert-secondary">
          <strong>Nombre:</strong> {pacienteSeleccionado.nombre} <br />
          <strong>Edad:</strong> {calcularEdad(pacienteSeleccionado.fecha_nacimiento)} años <br />
          <strong>Dirección:</strong> {pacienteSeleccionado.direccion} <br />
          <strong>Estado Civil:</strong> {pacienteSeleccionado.estado_civil} <br />
          <strong>Teléfono:</strong> {pacienteSeleccionado.telefono}
        </div>
      )}

      {/* Formulario de alerta */}
      <form onSubmit={handleSubmit} className="card p-3 shadow-sm">
        <div className="mb-3">
          <label className="form-label">Fecha de la Alerta</label>
          <input
            type="date"
            name="fecha_generada"
            className="form-control"
            value={formulario.fecha_generada}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Tipo de Alerta</label>
          <select
            name="tipo_alerta"
            className="form-select"
            value={formulario.tipo_alerta}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione una alerta</option>
            <option value="Emergencia">Emergencia</option>
            <option value="Hemorragia vaginal">Hemorragia vaginal</option>
            <option value="Presión arterial elevada">Presión arterial elevada</option>
            <option value="Disminución de movimientos fetales">Disminución de movimientos fetales</option>
            <option value="Dolor abdominal intenso">Dolor abdominal intenso</option>
            <option value="Convulsiones">Convulsiones</option>
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Descripción</label>
          <textarea
            name="descripcion"
            className="form-control"
            rows="3"
            value={formulario.descripcion}
            onChange={handleChange}
            required
          ></textarea>
        </div>

        <button type="submit" className="btn btn-danger w-100">
          Registrar Alerta
        </button>
      </form>
    </div>
  );
};

export default AlertaClinica;
