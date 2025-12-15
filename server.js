const express = require('express');
const { Pool } = require('pg');
const app = express();

// Conexión a PostgreSQL (configuración simple)
const pool = new Pool({
  user: process.env.DB_USER || 'admin',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'mydb',
  password: process.env.DB_PASSWORD || 'password123',
  port: process.env.DB_PORT || 5432,
});

// Función para probar conexión
async function probarConexion() {
  try {
    // Solo prueba con SELECT 1 (no crea tablas)
    await pool.query('SELECT 1');
    return { conectado: true, mensaje: '✅ Conectado a PostgreSQL' };
  } catch (error) {
    return { conectado: false, mensaje: '❌ No hay conexión a PostgreSQL' };
  }
}

// Ruta principal - MUY SIMPLE
app.get('/', async (req, res) => {
  const conexion = await probarConexion();
  
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>App Node.js + PostgreSQL</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          text-align: center;
          padding: 50px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          min-height: 100vh;
          margin: 0;
        }
        .container {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          padding: 40px;
          border-radius: 20px;
          display: inline-block;
          box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        }
        h1 { 
          font-size: 2em; 
          margin-bottom: 30px;
        }
        .status {
          font-size: 1.5em;
          margin: 20px 0;
          padding: 15px;
          border-radius: 10px;
          background: ${conexion.conectado ? 'rgba(0, 255, 136, 0.2)' : 'rgba(255, 99, 99, 0.2)'};
          border: 2px solid ${conexion.conectado ? '#00ff88' : '#ff6363'};
        }
        .info {
          margin: 15px 0;
          opacity: 0.9;
        }
        a {
          color: #00ff88;
          text-decoration: none;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🚀 App Node.js con PostgreSQL</h1>
        
        <div class="status">
          ${conexion.mensaje}
        </div>
        
        <div class="info">
          <strong>Host:</strong> ${process.env.DB_HOST || 'localhost'}
        </div>
        
        <div class="info">
          <strong>Base de datos:</strong> ${process.env.DB_NAME || 'mydb'}
        </div>
        
        <div class="info">
          <strong>Panel admin:</strong> 
          <a href="http://localhost:8080" target="_blank">pgAdmin aquí</a>
        </div>
        
        <div class="info">
          <strong>Credenciales pgAdmin:</strong><br>
          Email: admin@admin.com<br>
          Password: admin123
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.2);">
          <div>Puerto: ${process.env.PORT || 3000}</div>
          <div><a href="/health">Ver estado técnico</a></div>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Ruta de salud mejorada
app.get('/health', async (req, res) => {
  const conexion = await probarConexion();
  
  res.json({
    app: 'simple-node-app',
    status: conexion.conectado ? 'healthy' : 'degraded',
    database: conexion.conectado ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
    port: process.env.PORT || 3000
  });
});

// Ruta para probar conexión directa
app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT version()');
    res.json({
      status: 'success',
      database: 'PostgreSQL',
      version: result.rows[0].version,
      connected: true
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'No se pudo conectar a la base de datos',
      error: error.message
    });
  }
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor listo en http://localhost:${PORT}`);
});