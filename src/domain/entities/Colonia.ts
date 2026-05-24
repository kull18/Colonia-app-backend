export interface Colonia {
  id: string;
  nombre: string;
  descripcion: string | null;
  direccion: string | null;
  municipio: string | null;
  estadoRep: string | null;
  codigoAcceso: string;
  imagenUrl: string | null;
  activa: boolean;
  createdAt: Date;
  updatedAt: Date;
}
