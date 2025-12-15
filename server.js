const express = require('express');
const { Pool } = require('pg');
const app = express();

const pool = new Pool({
  user: process.env.DB_USER || 'admin',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'mydb',
  password: process.env.DB_PASSWORD || 'password123',
  port: process.env.DB_PORT || 5432,
});

async function probarConexion() {
  try {
    await pool.query('SELECT 1');
    return true;
  } catch (error) {
    return false;
  }
}

app.get('/', async (req, res) => {
  const conexion = await probarConexion();
  
  if (conexion) {
    res.send('<h1>Conexion aceptada</h1>');
  } else {
    res.send('<h1>Sin conexion</h1>');
  }
});

app.get('/health', async (req, res) => {
  const conexion = await probarConexion();
  
  res.json({
    status: conexion ? 'healthy' : 'degraded',
    database: conexion ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

app.get('/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT version()');
    res.json({
      database: 'PostgreSQL',
      version: result.rows[0].version,
      connected: true
    });
  } catch (error) {
    res.status(500).json({
      message: 'No se pudo conectar',
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT);