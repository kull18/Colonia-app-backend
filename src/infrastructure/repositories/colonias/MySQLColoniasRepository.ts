import { RowDataPacket, ResultSetHeader } from 'mysql2';
import pool from '../../database/mysql';
import { IColoniasRepository } from '../../../domain/repositories/IColoniasRepository';
import { Colonia } from '../../../domain/entities/Colonia';

interface ColoniaRow extends RowDataPacket {
  id: string;
  nombre: string;
  descripcion: string | null;
  direccion: string | null;
  municipio: string | null;
  estado_rep: string | null;
  codigo_acceso: string;
  imagen_url: string | null;
  activa: number;
  created_at: Date;
  updated_at: Date;
}

const toColonia = (row: ColoniaRow): Colonia => ({
  id:           row.id,
  nombre:       row.nombre,
  descripcion:  row.descripcion,
  direccion:    row.direccion,
  municipio:    row.municipio,
  estadoRep:    row.estado_rep,
  codigoAcceso: row.codigo_acceso,
  imagenUrl:    row.imagen_url,
  activa:       row.activa === 1,
  createdAt:    row.created_at,
  updatedAt:    row.updated_at,
});

export class MySQLColoniasRepository implements IColoniasRepository {
  async create(colonia: Omit<Colonia, 'createdAt' | 'updatedAt'>): Promise<Colonia> {
    await pool.query<ResultSetHeader>(
      `INSERT INTO colonias (id, nombre, descripcion, direccion, municipio, estado_rep, codigo_acceso, imagen_url, activa)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [colonia.id, colonia.nombre, colonia.descripcion, colonia.direccion, colonia.municipio,
       colonia.estadoRep, colonia.codigoAcceso, colonia.imagenUrl, colonia.activa ? 1 : 0],
    );
    const created = await this.findById(colonia.id);
    if (!created) throw new Error('Error al crear la colonia');
    return created;
  }

  async findById(id: string): Promise<Colonia | null> {
    const [rows] = await pool.query<ColoniaRow[]>(
      'SELECT * FROM colonias WHERE id = ? LIMIT 1',
      [id],
    );
    return rows[0] ? toColonia(rows[0]) : null;
  }

  async findAll(soloActivas = false): Promise<Colonia[]> {
    const sql = soloActivas
      ? 'SELECT * FROM colonias WHERE activa = 1 ORDER BY nombre'
      : 'SELECT * FROM colonias ORDER BY nombre';
    const [rows] = await pool.query<ColoniaRow[]>(sql);
    return rows.map(toColonia);
  }

  async findByAdminId(adminId: string): Promise<Colonia[]> {
    const [rows] = await pool.query<ColoniaRow[]>(
      `SELECT c.* FROM colonias c
       INNER JOIN admin_colonia ac ON ac.colonia_id = c.id
       WHERE ac.user_id = ? AND c.activa = 1
       ORDER BY c.nombre`,
      [adminId],
    );
    return rows.map(toColonia);
  }

  async update(id: string, data: Partial<Omit<Colonia, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Colonia | null> {
    const fields: string[] = [];
    const values: unknown[] = [];

    if (data.nombre      !== undefined) { fields.push('nombre = ?');      values.push(data.nombre); }
    if (data.descripcion !== undefined) { fields.push('descripcion = ?'); values.push(data.descripcion); }
    if (data.direccion   !== undefined) { fields.push('direccion = ?');   values.push(data.direccion); }
    if (data.municipio   !== undefined) { fields.push('municipio = ?');   values.push(data.municipio); }
    if (data.estadoRep   !== undefined) { fields.push('estado_rep = ?');  values.push(data.estadoRep); }
    if (data.imagenUrl   !== undefined) { fields.push('imagen_url = ?');  values.push(data.imagenUrl); }

    if (fields.length === 0) return this.findById(id);

    values.push(id);
    await pool.query<ResultSetHeader>(
      `UPDATE colonias SET ${fields.join(', ')} WHERE id = ?`,
      values,
    );
    return this.findById(id);
  }

  async softDelete(id: string): Promise<boolean> {
    const [result] = await pool.query<ResultSetHeader>(
      'UPDATE colonias SET activa = 0 WHERE id = ?',
      [id],
    );
    return result.affectedRows > 0;
  }

  async existsByCodigo(codigoAcceso: string): Promise<boolean> {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT 1 FROM colonias WHERE codigo_acceso = ? LIMIT 1',
      [codigoAcceso],
    );
    return rows.length > 0;
  }

  async assignAdmin(userId: string, coloniaId: string): Promise<void> {
    const { v4: uuidv4 } = await import('uuid');
    await pool.query<ResultSetHeader>(
      'INSERT INTO admin_colonia (id, user_id, colonia_id) VALUES (?, ?, ?)',
      [uuidv4(), userId, coloniaId],
    );
  }
}
