import { RowDataPacket, ResultSetHeader } from 'mysql2';
import pool from '../../database/mysql';
import { IAuthRepository } from '../../../domain/repositories/IAuthRepository';
import { User } from '../../../domain/entities/User';

interface UserRow extends RowDataPacket {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  password_hash: string;
  role: 'admin' | 'vecino';
  activo: number;
  created_at: Date;
  updated_at: Date;
}

const toUser = (row: UserRow): User => ({
  id:           row.id,
  nombre:       row.nombre,
  apellido:     row.apellido,
  email:        row.email,
  passwordHash: row.password_hash,
  role:         row.role,
  activo:       row.activo === 1,
  createdAt:    row.created_at,
  updatedAt:    row.updated_at,
});

export class MySQLAuthRepository implements IAuthRepository {
  async findByEmail(email: string): Promise<User | null> {
    const [rows] = await pool.query<UserRow[]>(
      'SELECT * FROM users WHERE email = ? AND activo = 1 LIMIT 1',
      [email],
    );
    return rows[0] ? toUser(rows[0]) : null;
  }

  async findById(id: string): Promise<User | null> {
    const [rows] = await pool.query<UserRow[]>(
      'SELECT * FROM users WHERE id = ? AND activo = 1 LIMIT 1',
      [id],
    );
    return rows[0] ? toUser(rows[0]) : null;
  }

  async create(user: Omit<User, 'createdAt' | 'updatedAt'>): Promise<User> {
    await pool.query<ResultSetHeader>(
      `INSERT INTO users (id, nombre, apellido, email, password_hash, role, activo)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [user.id, user.nombre, user.apellido, user.email, user.passwordHash, user.role, user.activo ? 1 : 0],
    );
    const created = await this.findById(user.id);
    if (!created) throw new Error('Error al crear el usuario');
    return created;
  }

  async existsByEmail(email: string): Promise<boolean> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT 1 FROM users WHERE email = ? LIMIT 1',
      [email],
    );
    return rows.length > 0;
  }
}
