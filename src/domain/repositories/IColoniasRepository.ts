import { Colonia } from '../entities/Colonia';

export interface IColoniasRepository {
  create(colonia: Omit<Colonia, 'createdAt' | 'updatedAt'>): Promise<Colonia>;
  findById(id: string): Promise<Colonia | null>;
  findAll(soloActivas?: boolean): Promise<Colonia[]>;
  update(id: string, data: Partial<Omit<Colonia, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Colonia | null>;
  softDelete(id: string): Promise<boolean>;
  existsByCodigo(codigoAcceso: string): Promise<boolean>;
  findByAdminId(adminId: string): Promise<Colonia[]>;
  assignAdmin(userId: string, coloniaId: string): Promise<void>;
}
