import { v4 as uuidv4 } from 'uuid';
import { IColoniasRepository } from '../../../domain/repositories/IColoniasRepository';
import { Colonia } from '../../../domain/entities/Colonia';
import { CreateColoniaDto, UpdateColoniaDto } from '../../dtos/colonia.dto';

export class CreateColoniaUseCase {
  constructor(private readonly coloniasRepo: IColoniasRepository) {}

  async execute(dto: CreateColoniaDto, adminId: string): Promise<Colonia> {
    const codigoAcceso = uuidv4().split('-')[0].toUpperCase();
    const colonia = await this.coloniasRepo.create({
      id: uuidv4(), nombre: dto.nombre,
      descripcion: dto.descripcion ?? null, direccion: dto.direccion ?? null,
      municipio: dto.municipio ?? null, estadoRep: dto.estadoRep ?? null,
      codigoAcceso, imagenUrl: dto.imagenUrl ?? null, activa: true,
    });
    await this.coloniasRepo.assignAdmin(adminId, colonia.id);
    return colonia;
  }
}

export class GetColoniaByIdUseCase {
  constructor(private readonly coloniasRepo: IColoniasRepository) {}

  async execute(id: string): Promise<Colonia> {
    const colonia = await this.coloniasRepo.findById(id);
    if (!colonia) throw new Error('Colonia no encontrada');
    if (!colonia.activa) throw new Error('Colonia inactiva');
    return colonia;
  }
}

export class GetColoniasByAdminUseCase {
  constructor(private readonly coloniasRepo: IColoniasRepository) {}

  async execute(adminId: string): Promise<Colonia[]> {
    return this.coloniasRepo.findByAdminId(adminId);
  }
}

export class UpdateColoniaUseCase {
  constructor(private readonly coloniasRepo: IColoniasRepository) {}

  async execute(id: string, dto: UpdateColoniaDto): Promise<Colonia> {
    const colonia = await this.coloniasRepo.findById(id);
    if (!colonia) throw new Error('Colonia no encontrada');
    const updated = await this.coloniasRepo.update(id, {
      nombre: dto.nombre, descripcion: dto.descripcion,
      direccion: dto.direccion, municipio: dto.municipio,
      estadoRep: dto.estadoRep, imagenUrl: dto.imagenUrl,
    });
    if (!updated) throw new Error('No se pudo actualizar la colonia');
    return updated;
  }
}

export class DeleteColoniaUseCase {
  constructor(private readonly coloniasRepo: IColoniasRepository) {}

  async execute(id: string): Promise<void> {
    const colonia = await this.coloniasRepo.findById(id);
    if (!colonia) throw new Error('Colonia no encontrada');
    const ok = await this.coloniasRepo.softDelete(id);
    if (!ok) throw new Error('No se pudo eliminar la colonia');
  }
}
