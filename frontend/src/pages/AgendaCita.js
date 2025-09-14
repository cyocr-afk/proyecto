import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { parse, startOfWeek, format, getDay } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import es from 'date-fns/locale/es';
import { Modal, Button, Form } from 'react-bootstrap';

const locales = { es };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

const AgendaCita = () => {
  const [formulario, setFormulario] = useState({
    id_paciente: '',
    fecha_cita: '',
    hora: '',
    id_motivo: '',
    id_usuario: '',
    estado: 'Pendiente'
  });

  const [pacientes, setPacientes] = useState([]);
  const [motivos, setMotivos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState([]);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);
  const [eventos, setEventos] = useState([]);
  // Estados para controlar vista y fecha
const [vista, setVista] = useState('month');
const [fecha, setFecha] = useState(new Date());


  // Modales
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [mensajeError, setMensajeError] = useState('');

  // Modal de cambio de estado
  const [showModalEstado, setShowModalEstado] = useState(false);
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);
  const [nuevoEstado, setNuevoEstado] = useState('');

  useEffect(() => {
    const usuario = JSON.parse(localStorage.getItem('user'));
    if (usuario?.id_usuario) {
      setFormulario(prev => ({ ...prev, id_usuario: usuario.id_usuario }));
    }

    axios.get('http://localhost:3001/api/pacientes')
      .then(res => setPacientes(res.data))
      .catch(err => console.error('Error al cargar pacientes:', err));

    axios.get('http://localhost:3001/api/motivos')
      .then(res => setMotivos(res.data))
      .catch(err => console.error('Error al cargar motivos:', err));

    cargarCitas();
  }, []);

  const cargarCitas = () => {
    axios.get('http://localhost:3001/api/citas')
      .then(res => {
        const eventosFormateados = res.data.map(cita => {
          const start = new Date(`${cita.fecha_cita}T${cita.hora}`);
          const end = new Date(start.getTime() + 30 * 60000);
          return {
            id: cita.id_cita,
            title: `${cita.nombre_paciente} (${cita.motivo})`,
            start,
            end,
            estado: cita.estado
          };
        });
        setEventos(eventosFormateados);
      })
      .catch(err => console.error('Error al cargar citas:', err));
  };

  const handleBusqueda = (e) => {
    const valor = e.target.value;
    setBusqueda(valor);
    if (valor.trim() === '') {
      setResultados([]);
      return;
    }
    const resultadosFiltrados = pacientes.filter(p =>
      p.nombre.toLowerCase().includes(valor.toLowerCase()) ||
      p.dpi.includes(valor)
    );
    setResultados(resultadosFiltrados);
  };

  const handleSeleccionPaciente = (paciente) => {
    setFormulario(prev => ({ ...prev, id_paciente: paciente.id_paciente }));
    setPacienteSeleccionado(paciente);
    setBusqueda('');
    setResultados([]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormulario(prev => ({ ...prev, [name]: value }));
  };

  const handleConfirmarRegistro = () => {
    setShowConfirm(true);
  };

  const handleSubmit = () => {
    setShowConfirm(false);
    axios.post('http://localhost:3001/api/citas', formulario)
      .then(() => {
        setFormulario({
          id_paciente: '',
          fecha_cita: '',
          hora: '',
          id_motivo: '',
          id_usuario: formulario.id_usuario,
          estado: 'Pendiente'
        });
        setPacienteSeleccionado(null);
        setBusqueda('');
        cargarCitas();
        setShowSuccess(true);
      })
      .catch(err => {
        const msg = err.response?.data?.error || 'Error al registrar cita';
        setMensajeError(msg);
        setShowError(true);
      });
  };

  const handleCitaClick = (evento) => {
    setEventoSeleccionado(evento);
    setNuevoEstado(evento.estado);
    setShowModalEstado(true);
  };

  const actualizarEstado = () => {
    axios.put(`http://localhost:3001/api/citas/${eventoSeleccionado.id}`, { estado: nuevoEstado })
      .then(() => {
        setShowModalEstado(false);
        cargarCitas();
      })
      .catch(err => {
        setMensajeError('Error al actualizar estado');
        setShowError(true);
      });
  };

  const eventoStyle = (event) => {
    let backgroundColor;
    switch (event.estado) {
      case 'Pendiente': backgroundColor = '#ffc107'; break;
      case 'Realizada': backgroundColor = '#28a745'; break;
      case 'Cancelada': backgroundColor = '#dc3545'; break;
      default: backgroundColor = '#6c757d';
    }
    return {
      style: {
        backgroundColor,
        color: 'white',
        borderRadius: '6px',
        paddingLeft: '4px'
      }
    };
  };

  return (
    <div className="container mt-4">
      <h3 className="mb-4">Registrar Cita de Seguimiento</h3>

      <form onSubmit={(e) => { e.preventDefault(); handleConfirmarRegistro(); }}>
        {/* Buscador */}
        <div className="mb-3 position-relative">
          <label className="form-label">Buscar paciente (nombre o DPI)</label>
          <input
            type="text"
            className="form-control"
            placeholder="Escriba para buscar."
            value={busqueda}
            onChange={handleBusqueda}
          />
          {resultados.length > 0 && (
            <ul className="list-group position-absolute w-100" style={{ zIndex: 1000, maxHeight: '200px', overflowY: 'auto' }}>
              {resultados.map(p => (
                <li
                  key={p.id_paciente}
                  className="list-group-item list-group-item-action"
                  onClick={() => handleSeleccionPaciente(p)}
                  style={{ cursor: 'pointer' }}
                >
                  {p.nombre} - DPI: {p.dpi}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Paciente seleccionado */}
        {pacienteSeleccionado && (
          <div className="card mb-3">
            <div className="card-header bg-light"><strong>Datos del paciente:</strong></div>
            <div className="card-body">
              <p><strong>Nombre:</strong> {pacienteSeleccionado.nombre}</p>
              <p><strong>DPI:</strong> {pacienteSeleccionado.dpi}</p>
              <p><strong>Dirección:</strong> {pacienteSeleccionado.direccion || 'No registrada'}</p>
              <p><strong>Teléfono:</strong> {pacienteSeleccionado.telefono || 'No registrado'}</p>
            </div>
          </div>
        )}

        {/* Fecha */}
        <div className="mb-3">
          <label className="form-label">Fecha</label>
          <input type="date" name="fecha_cita" value={formulario.fecha_cita} onChange={handleChange} className="form-control" required />
        </div>

        {/* Hora */}
        <div className="mb-3">
          <label className="form-label">Hora</label>
          <input type="time" name="hora" value={formulario.hora} onChange={handleChange} className="form-control" required />
        </div>

        {/* Motivo */}
        <div className="mb-3">
          <label className="form-label">Motivo</label>
          <select name="id_motivo" value={formulario.id_motivo} onChange={handleChange} className="form-control" required>
            <option value="">Seleccione un motivo</option>
            {motivos.map(m => (
              <option key={m.id_motivo} value={m.id_motivo}>{m.nombre}</option>
            ))}
          </select>
        </div>

        <button type="submit" className="btn btn-primary">Guardar Cita</button>
      </form>

      <hr className="my-5" />

     {/* Calendario */}
<Calendar
  localizer={localizer}
  events={eventos}
  startAccessor="start"
  endAccessor="end"
  style={{ height: 500 }}
  onSelectEvent={handleCitaClick}
  eventPropGetter={eventoStyle}
  views={['month', 'week', 'day', 'agenda']}
  view={vista}                       // ✅ vista actual
  onView={setVista}                  // ✅ actualizar vista
  date={fecha}                       // ✅ fecha actual
  onNavigate={setFecha}              // ✅ cambiar fecha con Hoy/Atrás/Próximo
  toolbar={true}
/>

      {/* Modales */}
      <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered>
        <Modal.Header closeButton><Modal.Title>Confirmar registro</Modal.Title></Modal.Header>
        <Modal.Body>¿Está seguro que desea guardar esta cita?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirm(false)}>Cancelar</Button>
          <Button variant="primary" onClick={handleSubmit}>Confirmar</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showSuccess} onHide={() => setShowSuccess(false)} centered>
        <Modal.Header closeButton><Modal.Title>Éxito</Modal.Title></Modal.Header>
        <Modal.Body>Cita registrada exitosamente.</Modal.Body>
        <Modal.Footer><Button variant="success" onClick={() => setShowSuccess(false)}>Cerrar</Button></Modal.Footer>
      </Modal>

      <Modal show={showError} onHide={() => setShowError(false)} centered>
        <Modal.Header closeButton><Modal.Title>Error</Modal.Title></Modal.Header>
        <Modal.Body>{mensajeError}</Modal.Body>
        <Modal.Footer><Button variant="danger" onClick={() => setShowError(false)}>Cerrar</Button></Modal.Footer>
      </Modal>

      {/* Modal cambiar estado */}
      <Modal show={showModalEstado} onHide={() => setShowModalEstado(false)} centered>
        <Modal.Header closeButton><Modal.Title>Cambiar estado de cita</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form.Select value={nuevoEstado} onChange={e => setNuevoEstado(e.target.value)}>
            <option value="Pendiente">Pendiente</option>
            <option value="Realizada">Realizada</option>
            <option value="Cancelada">Cancelada</option>
          </Form.Select>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModalEstado(false)}>Cerrar</Button>
          <Button variant="primary" onClick={actualizarEstado}>Guardar</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AgendaCita;
