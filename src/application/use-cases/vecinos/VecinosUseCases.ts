import { IVecinosRepository } from '../../../domain/repositories/IVecinosRepository';
import { IColoniasRepository } from '../../../domain/repositories/IColoniasRepository';
import { VecinoColonia, VecinoColoniaDetalle, VecinoEstado } from '../../../domain/entities/VecinoColonia';
import { SolicitarUnirseDto, UpdateVecinoEstadoDto } from '../../dtos/colonia.dto';

export class SolicitarUnirseUseCase {
  constructor(
    private readonly vecinosRepo: IVecinosRepository,
    private readonly coloniasRepo: IColoniasRepository,
  ) {}

  async execute(userId: string, dto: SolicitarUnirseDto): Promise<VecinoColonia> {
    const colonias = await this.coloniasRepo.findAll(true);
    const colonia  = colonias.find(c => c.codigoAcceso === dto.codigoAcceso);
    if (!colonia) throw new Error('Código de acceso inválido');

    const yaExiste = await this.vecinosRepo.findByUserAndColonia(userId, colonia.id);
    if (yaExiste) throw new Error('Ya tienes una solicitud para esta colonia');

    return this.vecinosRepo.solicitar(userId, colonia.id, dto.numeroCasa);
  }
}

export class GetVecinosColoniaUseCase {
  constructor(private readonly vecinosRepo: IVecinosRepository) {}

  async execute(coloniaId: string, estado?: VecinoEstado): Promise<VecinoColoniaDetalle[]> {
    return this.vecinosRepo.findByColonia(coloniaId, estado);
  }
}

export class UpdateVecinoEstadoUseCase {
  constructor(private readonly vecinosRepo: IVecinosRepository) {}

  async execute(coloniaId: string, userId: string, dto: UpdateVecinoEstadoDto): Promise<VecinoColonia> {
    const vecino = await this.vecinosRepo.findByUserAndColonia(userId, coloniaId);
    if (!vecino) throw new Error('Vecino no encontrado en esta colonia');

    const updated = await this.vecinosRepo.updateEstado(userId, coloniaId, dto.estado);
    if (!updated) throw new Error('No se pudo actualizar el estado');
    return updated;
  }
}
