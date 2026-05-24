import { Request, Response } from 'express';
import { RegisterUseCase } from '../../application/use-cases/auth/RegisterUseCase';
import { LoginUseCase } from '../../application/use-cases/auth/LoginUseCase';
import { GetMeUseCase } from '../../application/use-cases/auth/GetMeUseCase';
import { MySQLAuthRepository } from '../../infrastructure/repositories/auth/MySQLAuthRepository';
import { AuthRequest } from '../../infrastructure/middleware/auth.middleware';

const authRepo  = new MySQLAuthRepository();
const registerUC = new RegisterUseCase(authRepo);
const loginUC    = new LoginUseCase(authRepo);
const getMeUC    = new GetMeUseCase(authRepo);

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await registerUC.execute(req.body);
    res.status(201).json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al registrar';
    res.status(400).json({ error: msg });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await loginUC.execute(req.body);
    res.status(200).json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al iniciar sesión';
    res.status(401).json({ error: msg });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.sub;
    const user = await getMeUC.execute(userId);
    res.status(200).json(user);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al obtener usuario';
    res.status(404).json({ error: msg });
  }
};
