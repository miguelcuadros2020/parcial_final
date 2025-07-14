// Servidor básico para servir archivos estáticos y json-server
const express = require('express');
const path = require('path');
const { exec } = require('child_process');

const app = express();
const PORT = 8080;

// Servir archivos estáticos
app.use(express.static(__dirname));

// Iniciar json-server como proceso hijo
exec('npx json-server --watch db.json --port 3000', (err, stdout, stderr) => {
  if (err) {
    console.error('Error iniciando json-server:', err);
    return;
  }
  console.log(stdout);
  console.error(stderr);
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor SPA corriendo en http://localhost:${PORT}`);
  console.log('json-server corriendo en http://localhost:3000');
});
