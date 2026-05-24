import { IAuthRepository } from '../../../domain/repositories/IAuthRepository';
import { comparePassword, signToken } from '../../../domain/services/authService';
import { LoginDto, AuthResponseDto } from '../../dtos/auth.dto';

export class LoginUseCase {
  constructor(private readonly authRepo: IAuthRepository) {}

  async execute(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.authRepo.findByEmail(dto.email.toLowerCase().trim());
    if (!user) throw new Error('Credenciales inválidas');
    if (!user.activo) throw new Error('Usuario inactivo');

    const valid = await comparePassword(dto.password, user.passwordHash);
    if (!valid) throw new Error('Credenciales inválidas');

    const token = signToken({ id: user.id, nombre: user.nombre, apellido: user.apellido, email: user.email, role: user.role, activo: user.activo, createdAt: user.createdAt });
    return { token, user: { id: user.id, nombre: user.nombre, apellido: user.apellido, email: user.email, role: user.role } };
  }
}
