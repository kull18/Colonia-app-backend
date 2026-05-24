export interface CreateColoniaDto {
  nombre: string;
  descripcion?: string;
  direccion?: string;
  municipio?: string;
  estadoRep?: string;
  imagenUrl?: string;
}

export interface UpdateColoniaDto {
  nombre?: string;
  descripcion?: string;
  direccion?: string;
  municipio?: string;
  estadoRep?: string;
  imagenUrl?: string;
}

export interface UpdateVecinoEstadoDto {
  estado: 'aprobado' | 'rechazado' | 'bloqueado';
}

export interface SolicitarUnirseDto {
  codigoAcceso: string;
  numeroCasa?: string;
}
