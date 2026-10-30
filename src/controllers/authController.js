const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db'); // Tu conexión a MariaDB

// Endpoint: Registro con Consentimiento
exports.registrarUsuario = async (req, res) => {
    const { nombre, email, password, rol, acepto_terminos, version_aviso } = req.body;

    if (!acepto_terminos) {
        return res.status(400).json({ error: 'Debe aceptar el aviso de privacidad.' });
    }

    try {
        const passwordHash = await bcrypt.hash(password, 10);
        
        // Iniciar transacción en MariaDB
        await db.query('BEGIN');
        
        const [userResult] = await db.query(
            'INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES (?, ?, ?, ?)',
            [nombre, email, passwordHash, rol || 'Cajero']
        );
        
        await db.query(
            'INSERT INTO consentimientodatos (id_usuario, aviso_privacidad_version, acepto_terminos) VALUES (?, ?, ?)',
            [userResult.insertId, version_aviso, acepto_terminos]
        );

        await db.query('COMMIT');
        res.status(201).json({ mensaje: 'Usuario registrado y consentimiento guardado exitosamente.' });
    } catch (error) {
        await db.query('ROLLBACK');
        console.log("ERROR:", error); 
        res.status(500).json({ error: 'Error en el registro del usuario.' });
    }
};

// Endpoint: Login
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const [users] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
        if (users.length === 0) return res.status(401).json({ error: 'Credenciales inválidas' });

        const usuario = users[0];
        const validPassword = await bcrypt.compare(password, usuario.password_hash);
        if (!validPassword) return res.status(401).json({ error: 'Credenciales inválidas' });

        // Generación del token para mantener la sesión del Cajero sin estado en el servidor[cite: 4, 5]
        const token = jwt.sign(
            { id: usuario.id_usuario, rol: usuario.rol }, 
            process.env.JWT_SECRET, 
            { expiresIn: '8h' }
        );

        res.json({ mensaje: 'Login exitoso', token, rol: usuario.rol });
    } catch (error) {
        await db.query('ROLLBACK');
        console.log("ERROR:", error); 
        res.status(500).json({ error: 'Error en el inicio de sesión.' });
    }
};