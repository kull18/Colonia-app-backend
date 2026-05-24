export interface RegisterDto {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  role: 'admin' | 'vecino';
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponseDto {
  token: string;
  user: {
    id: string;
    nombre: string;
    apellido: string;
    email: string;
    role: string;
  };
}
