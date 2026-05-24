import express from 'express';
import dotenv from 'dotenv';
import authRoutes     from './presentation/routes/auth.routes';
import coloniasRoutes from './presentation/routes/colonias.routes';

dotenv.config();

const app  = express();
const PORT = process.env.PORT ?? 3000;

// ── Middlewares globales ─────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Rutas ────────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/colonias', coloniasRoutes);

// ── Health check ─────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Manejo de rutas no encontradas ───────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.listen(PORT, () => {
  console.log(`ColoniaApp API corriendo en http://localhost:${PORT}`);
});

export default app;
