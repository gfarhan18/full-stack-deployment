import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import {
  getAllowedOrigins,
  getCorsOptions,
  isOriginAllowed,
} from './config/cors.js';
import tasksRouter from './routes/tasks.js';

const app = express();
const PORT = process.env.PORT || 5000;
const corsOptions = getCorsOptions();

// Handle preflight before other middleware
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));

app.use(express.json());

app.get('/api/health', (req, res) => {
  const origin = req.headers.origin || null;
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    cors: {
      requestOrigin: origin,
      originAllowed: origin ? isOriginAllowed(origin) : null,
      allowedOrigins: getAllowedOrigins(),
      vercelPreviewsEnabled:
        process.env.ALLOW_VERCEL_PREVIEWS === 'true' ||
        process.env.ALLOW_VERCEL_PREVIEWS === '1',
    },
  });
});

app.use('/api/tasks', tasksRouter);

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`API listening on port ${PORT}`);
  console.log(`CORS allowed for: ${getAllowedOrigins().join(', ')}`);
});
