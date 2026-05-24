export type UserRole = 'admin' | 'vecino';

export interface User {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPublic {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  role: UserRole;
  activo: boolean;
  createdAt: Date;
}
