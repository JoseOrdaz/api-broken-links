const app = require('express')();
const blc = require('broken-link-checker');


// Ruta para verificar enlaces rotos
app.get('/api/check-links', async (req, res) => {
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

module.exports = app;