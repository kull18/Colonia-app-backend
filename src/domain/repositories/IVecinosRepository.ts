import { VecinoColonia, VecinoColoniaDetalle, VecinoEstado } from '../entities/VecinoColonia';

export interface IVecinosRepository {
  solicitar(userId: string, coloniaId: string, numeroCasa?: string): Promise<VecinoColonia>;
  findByColonia(coloniaId: string, estado?: VecinoEstado): Promise<VecinoColoniaDetalle[]>;
  findByUserAndColonia(userId: string, coloniaId: string): Promise<VecinoColonia | null>;
  updateEstado(userId: string, coloniaId: string, estado: VecinoEstado): Promise<VecinoColonia | null>;
}
