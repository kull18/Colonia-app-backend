import { v4 as uuidv4 } from 'uuid';
import { IAuthRepository } from '../../../domain/repositories/IAuthRepository';
import { hashPassword, signToken } from '../../../domain/services/authService';
import { RegisterDto, AuthResponseDto } from '../../dtos/auth.dto';
import { UserRole } from '../../../domain/entities/User';

export class RegisterUseCase {
  constructor(private readonly authRepo: IAuthRepository) {}

  async execute(dto: RegisterDto): Promise<AuthResponseDto> {
    const exists = await this.authRepo.existsByEmail(dto.email);
    if (exists) throw new Error('El correo ya está registrado');

    const passwordHash = await hashPassword(dto.password);
    const user = await this.authRepo.create({
      id: uuidv4(), nombre: dto.nombre, apellido: dto.apellido,
      email: dto.email.toLowerCase().trim(),
      passwordHash, role: dto.role as UserRole, activo: true,
    });

    const token = signToken({ id: user.id, nombre: user.nombre, apellido: user.apellido, email: user.email, role: user.role, activo: user.activo, createdAt: user.createdAt });
    return { token, user: { id: user.id, nombre: user.nombre, apellido: user.apellido, email: user.email, role: user.role } };
  }
}
