require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());


const authRoutes = require('./routes/authRoutes');//registro de usuario a login
const usuariosRoutes = require('./routes/usuarios');// registro usuario
const pacienteRoutes = require('./routes/PacienteRoutes');//registro de paciente
const controlesRoutes = require('./routes/controles');//registro de controles
const riesgosRoutes = require('./routes/riesgos')
const pacientesRoutes = require('./routes/pacientes');//conteo de controles 
const alertaRoutes = require("./routes/alerta");
const citasRoutes = require('./routes/citas');
const motivosRoutes = require('./routes/motivos');//motivos de cita
const historialPacienteRoutes = require('./routes/historialPaciente');
const reportesRoutes = require('./routes/reportes');



app.use('/api', authRoutes);//registro usuarios login
app.use('/api/usuarios', usuariosRoutes);//registro usuarios 
app.use('/api', pacienteRoutes);
app.use('/api', controlesRoutes);
app.use('/api', riesgosRoutes);
app.use('/api/pacientes', pacientesRoutes);//conteo de controles
app.use("/api/alertas", alertaRoutes);
app.use('/api/citas', citasRoutes); 
app.use('/api/motivos', motivosRoutes);
app.use('/api/historialpaciente', historialPacienteRoutes);
app.use('/api/reportes', reportesRoutes);
//app.use('/api/historial', require('./routes/historialPaciente'));



const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
