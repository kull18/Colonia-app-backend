import { Response } from 'express';
import { CreateColoniaUseCase, GetColoniaByIdUseCase, GetColoniasByAdminUseCase, UpdateColoniaUseCase, DeleteColoniaUseCase } from '../../application/use-cases/colonias/ColoniasUseCases';
import { SolicitarUnirseUseCase, GetVecinosColoniaUseCase, UpdateVecinoEstadoUseCase } from '../../application/use-cases/vecinos/VecinosUseCases';
import { MySQLColoniasRepository } from '../../infrastructure/repositories/colonias/MySQLColoniasRepository';
import { MySQLVecinosRepository } from '../../infrastructure/repositories/vecinos/MySQLVecinosRepository';
import { AuthRequest } from '../../infrastructure/middleware/auth.middleware';
import { VecinoEstado } from '../../domain/entities/VecinoColonia';

const coloniasRepo    = new MySQLColoniasRepository();
const vecinosRepo     = new MySQLVecinosRepository();
const createUC        = new CreateColoniaUseCase(coloniasRepo);
const getByIdUC       = new GetColoniaByIdUseCase(coloniasRepo);
const getByAdminUC    = new GetColoniasByAdminUseCase(coloniasRepo);
const updateUC        = new UpdateColoniaUseCase(coloniasRepo);
const deleteUC        = new DeleteColoniaUseCase(coloniasRepo);
const solicitarUC     = new SolicitarUnirseUseCase(vecinosRepo, coloniasRepo);
const getVecinosUC    = new GetVecinosColoniaUseCase(vecinosRepo);
const updateVecinoUC  = new UpdateVecinoEstadoUseCase(vecinosRepo);

export const createColonia = async (req: AuthRequest, res: Response): Promise<void> => {
  try { res.status(201).json(await createUC.execute(req.body, req.user!.sub)); }
  catch (err) { res.status(400).json({ error: err instanceof Error ? err.message : 'Error al crear colonia' }); }
};

export const getMisColonias = async (req: AuthRequest, res: Response): Promise<void> => {
  try { res.status(200).json(await getByAdminUC.execute(req.user!.sub)); }
  catch (err) { res.status(500).json({ error: err instanceof Error ? err.message : 'Error' }); }
};

export const getColoniaById = async (req: AuthRequest, res: Response): Promise<void> => {
  try { res.status(200).json(await getByIdUC.execute(req.params['id'] as string)); }
  catch (err) { res.status(404).json({ error: err instanceof Error ? err.message : 'No encontrada' }); }
};

export const updateColonia = async (req: AuthRequest, res: Response): Promise<void> => {
  try { res.status(200).json(await updateUC.execute(req.params['id'] as string, req.body)); }
  catch (err) { res.status(400).json({ error: err instanceof Error ? err.message : 'Error al actualizar' }); }
};

export const deleteColonia = async (req: AuthRequest, res: Response): Promise<void> => {
  try { await deleteUC.execute(req.params['id'] as string); res.status(204).send(); }
  catch (err) { res.status(404).json({ error: err instanceof Error ? err.message : 'No encontrada' }); }
};

export const solicitarUnirse = async (req: AuthRequest, res: Response): Promise<void> => {
  try { res.status(201).json(await solicitarUC.execute(req.user!.sub, req.body)); }
  catch (err) { res.status(400).json({ error: err instanceof Error ? err.message : 'Error al solicitar' }); }
};

export const getVecinos = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const estado = req.query['estado'] as VecinoEstado | undefined;
    res.status(200).json(await getVecinosUC.execute(req.params['id'] as string, estado));
  } catch (err) { res.status(500).json({ error: err instanceof Error ? err.message : 'Error' }); }
};

export const updateVecinoEstado = async (req: AuthRequest, res: Response): Promise<void> => {
  try { res.status(200).json(await updateVecinoUC.execute(req.params['id'] as string, req.params['userId'] as string, req.body)); }
  catch (err) { res.status(400).json({ error: err instanceof Error ? err.message : 'Error al actualizar vecino' }); }
};
