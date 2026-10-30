const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Montar rutas
app.use('/api/auth', authRoutes);

// Iniciar servidor
const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => {
    console.log(`Servidor de la API POS corriendo en el puerto ${PORT}`);
});

// Chismoso para saber si algo cierra el servidor
server.on('close', () => {
    console.log('🚨 EL SERVIDOR SE CERRÓ. ALGO LO ESTÁ MATANDO.');
});
setInterval(() => 3000);