const express = require('express');
const blc = require('broken-link-checker');
const fs = require('fs');
const app = express();

// Ruta para verificar enlaces rotos
app.get('/check-links', async (req, res) => {
  const url = req.query.url;

  if (!url) {
    return res.status(400).json({ error: 'La URL es requerida.' });
  }

  const options = {
    filterLevel: 1,
    excludeExternalLinks: true,
    excludeInternalLinks: false,
    userAgent: 'Your User Agent',
    acceptedSchemes: ['http', 'https'],
    excludedKeywords: [],
  };

  let brokenLinks = [];

  const siteChecker = new blc.SiteChecker(options, {
    link: (result) => {
      if (result.broken) {
        brokenLinks.push({
          url: result.url.resolved,
          status: result.brokenReason,
        });
      }
    },
    end: () => {
      console.log('PROCESO FINALIZADO'); // Mostrar "OK" cuando el proceso ha finalizado

      const jsonOutput = JSON.stringify(brokenLinks, null, 2);
      const fileName = `${url.replace(/[^a-z0-9]/gi, '-')}_broken_links.json`; // Crear un nombre de archivo válido basado en la URL

      // Eliminar el archivo existente si existe
      fs.unlink(fileName, (err) => {
        if (err && err.code !== 'ENOENT') { // Si el error no es "archivo no encontrado", lanzar error
          console.error('Error al eliminar el archivo existente:', err);
        }

        // Escribir el nuevo archivo JSON
        fs.writeFile(fileName, jsonOutput, (err) => {
          if (err) {
            console.error('Error al escribir el archivo JSON:', err);
          } else {
            console.log(`Enlaces rotos para ${url} guardados en ${fileName}`);
          }
        });
      });
    },
  });

  siteChecker.enqueue(url);
  res.json({ message: 'La verificación de enlaces ha comenzado.' });
});

// Ruta para ver el JSON filtrado por estado
app.get('/ver-json', (req, res) => {
  const url = req.query.url;
  const status = req.query.status; // Estado para filtrar

  if (!url) {
    return res.status(400).json({ error: 'La URL es requerida.' });
  }

  const fileName = `${url.replace(/[^a-z0-9]/gi, '-')}_broken_links.json`;

  // Leer el archivo JSON
  fs.readFile(fileName, 'utf8', (err, data) => {
    if (err) {
      console.error('Error al leer el archivo JSON:', err);
      return res.status(500).json({ error: 'Error al leer el archivo JSON.' });
    }

    let filteredResults = JSON.parse(data);

    // Filtrar por estado si se proporciona
    if (status) {
      filteredResults = filteredResults.filter(result => result.status === status);
    }

    // Enviar el contenido filtrado del archivo JSON
    res.json(filteredResults);
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor en ejecución en http://localhost:${PORT}`);
});
