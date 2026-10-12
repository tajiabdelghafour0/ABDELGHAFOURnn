import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const targetPort = Number(process.env.PORT) || 3000;

// Health check endpoint for Cloud Run container probes
app.get('/healthz', (req, res) => {
  res.status(200).send('OK');
});

// Serve production static assets from dist
app.use(express.static(path.join(__dirname, 'dist')));

// Fallback to index.html for SPA client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

function startServer(portToTry: number) {
  const server = app.listen(portToTry, '0.0.0.0', () => {
    console.log(`[PixelFlow Server] Listening on 0.0.0.0:${portToTry}`);
  });

  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE' && portToTry !== 3000) {
      console.warn(`[PixelFlow Server] Port ${portToTry} in use, falling back to 3000...`);
      startServer(3000);
    } else {
      console.error('[PixelFlow Server] Failed to bind server:', err);
    }
  });
}

startServer(targetPort);
