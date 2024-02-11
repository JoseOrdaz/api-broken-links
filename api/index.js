const express = require('express');
const blc = require('broken-link-checker');
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
        res.json(brokenLinks); // Enviar los enlaces rotos como JSON
        app.set('brokenLinks', brokenLinks);
    },
});

siteChecker.enqueue(url);
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor en ejecución en http://localhost:${PORT}`);
});
