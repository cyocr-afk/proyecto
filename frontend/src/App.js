import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Inicio from './pages/Inicio';
import RegistrarPaciente from './pages/RegistrarPaciente';
import ControlPrenatal from './pages/ControlPrenatal';
import RiesgoObstetrico from './pages/RiesgoObstetrico.js';
import AlertaClinica from './pages/AlertaClinica.js';
import AgendaCita from './pages/AgendaCita';
import HistorialPaciente from './pages/HistorialPaciente.js';
import Reportes from './pages/Reportes';
import RegistrarUsuario from './pages/RegistrarUsuario';
import ListaUsuarios from './pages/ListaUsuarios';
import ProtectedRoute from './components/ProtectedRoute';
import LayoutDashboard from './layouts/LayoutDashboard'; 
import 'bootstrap/dist/css/bootstrap.min.css';
import { Navigate } from 'react-router-dom';



function App() {
  return (
    <Router>
      <Routes>
        {/*ruta para redirigir dashboard a inicio*/}
        <Route path="/Dashboard" element={<Navigate to="/inicio" />} />
        {/* Login público */}
        <Route path="/" element={<Login />} />

        {/*rutas protegidas con menú lateral */}
        <Route
          path="/inicio"
          element={
            <ProtectedRoute>
              <LayoutDashboard>
                <Inicio />
              </LayoutDashboard>
            </ProtectedRoute>
          }
        />

         {/* ✅ Nueva ruta para registrar usuarios */}
        <Route
            path="/usuarios/registro"
            element={
            <ProtectedRoute>
               <LayoutDashboard>
             <RegistrarUsuario />
             </LayoutDashboard>
            </ProtectedRoute>
           }
        />
        <Route
          path="/usuarios/lista"
          element={
          <ProtectedRoute>
            <LayoutDashboard>
           <ListaUsuarios />
           </LayoutDashboard>
         </ProtectedRoute>
          }
        />
        <Route
          path="/pacientes/registro"
          element={
            <ProtectedRoute>
              <LayoutDashboard>
                <RegistrarPaciente />
              </LayoutDashboard>
            </ProtectedRoute>
          }
        />

        <Route
          path="/controlprenatal"
          element={
            <ProtectedRoute>
              <LayoutDashboard>
                <ControlPrenatal />
              </LayoutDashboard>
            </ProtectedRoute>
          }
        />

        <Route
           path="/riesgoobstetrico"
            element={
           <ProtectedRoute>
            <LayoutDashboard>
            <RiesgoObstetrico />
            </LayoutDashboard>
          </ProtectedRoute>
          }
        />
        <Route
          path="/alertas"
          element={
          <ProtectedRoute>
          <LayoutDashboard>
          <AlertaClinica />
          </LayoutDashboard>
         </ProtectedRoute>
          }
        />


        <Route
          path="/agendacita"
          element={
          <ProtectedRoute>
          <LayoutDashboard>
          <AgendaCita />
          </LayoutDashboard>
          </ProtectedRoute>
          }
        />

        <Route
          path="/historialpaciente"
          element={
          <ProtectedRoute>
          <LayoutDashboard>
          <HistorialPaciente />
          </LayoutDashboard>
          </ProtectedRoute>
         }
        />


        <Route
           path="/reportes"
            element={
           <ProtectedRoute>
            <LayoutDashboard>
            <Reportes />
            </LayoutDashboard>
            </ProtectedRoute>
          }
        />



      </Routes>
    </Router>
  );
}

export default App;
