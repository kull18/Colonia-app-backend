import { IAuthRepository } from '../../../domain/repositories/IAuthRepository';
import { UserPublic } from '../../../domain/entities/User';

export class GetMeUseCase {
  constructor(private readonly authRepo: IAuthRepository) {}

  async execute(userId: string): Promise<UserPublic> {
    const user = await this.authRepo.findById(userId);
    if (!user) throw new Error('Usuario no encontrado');
    return { id: user.id, nombre: user.nombre, apellido: user.apellido, email: user.email, role: user.role, activo: user.activo, createdAt: user.createdAt };
  }
}
