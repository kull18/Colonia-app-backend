export type VecinoEstado = 'pendiente' | 'aprobado' | 'rechazado' | 'bloqueado';

export interface VecinoColonia {
  id: string;
  userId: string;
  coloniaId: string;
  numeroCasa: string | null;
  estado: VecinoEstado;
  joinedAt: Date;
  updatedAt: Date;
}

export interface VecinoColoniaDetalle extends VecinoColonia {
  nombre: string;
  apellido: string;
  email: string;
}
