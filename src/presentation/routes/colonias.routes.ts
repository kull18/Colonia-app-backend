import { Router } from 'express';
import {
  createColonia,
  getMisColonias,
  getColoniaById,
  updateColonia,
  deleteColonia,
  solicitarUnirse,
  getVecinos,
  updateVecinoEstado,
} from '../controllers/colonias.controller';
import { authenticate, requireRole } from '../../infrastructure/middleware/auth.middleware';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// POST   /api/colonias              — admin crea una colonia
router.post('/', requireRole('admin'), createColonia);

// GET    /api/colonias/mis-colonias — admin ve sus colonias
router.get('/mis-colonias', requireRole('admin'), getMisColonias);

// POST   /api/colonias/unirse       — vecino se une con código
router.post('/unirse', requireRole('vecino'), solicitarUnirse);

// GET    /api/colonias/:id          — ver detalle de la colonia
router.get('/:id', getColoniaById);

// PUT    /api/colonias/:id          — admin edita la colonia
router.put('/:id', requireRole('admin'), updateColonia);

// DELETE /api/colonias/:id          — admin desactiva la colonia
router.delete('/:id', requireRole('admin'), deleteColonia);

// GET    /api/colonias/:id/vecinos  — admin lista vecinos (filtra por ?estado=pendiente)
router.get('/:id/vecinos', requireRole('admin'), getVecinos);

// PUT    /api/colonias/:id/vecinos/:userId — admin aprueba/rechaza/bloquea
router.put('/:id/vecinos/:userId', requireRole('admin'), updateVecinoEstado);

export default router;
