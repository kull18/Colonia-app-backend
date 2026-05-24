import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { v4 as uuidv4 } from 'uuid';
import pool from '../../database/mysql';
import { IVecinosRepository } from '../../../domain/repositories/IVecinosRepository';
import { VecinoColonia, VecinoColoniaDetalle, VecinoEstado } from '../../../domain/entities/VecinoColonia';

interface VecinoRow extends RowDataPacket {
  id: string;
  user_id: string;
  colonia_id: string;
  numero_casa: string | null;
  estado: VecinoEstado;
  joined_at: Date;
  updated_at: Date;
}

interface VecinoDetalleRow extends VecinoRow {
  nombre: string;
  apellido: string;
  email: string;
}

const toVecino = (row: VecinoRow): VecinoColonia => ({
  id:         row.id,
  userId:     row.user_id,
  coloniaId:  row.colonia_id,
  numeroCasa: row.numero_casa,
  estado:     row.estado,
  joinedAt:   row.joined_at,
  updatedAt:  row.updated_at,
});

const toVecinoDetalle = (row: VecinoDetalleRow): VecinoColoniaDetalle => ({
  ...toVecino(row),
  nombre:   row.nombre,
  apellido: row.apellido,
  email:    row.email,
});

export class MySQLVecinosRepository implements IVecinosRepository {
  async solicitar(userId: string, coloniaId: string, numeroCasa?: string): Promise<VecinoColonia> {
    const id = uuidv4();
    await pool.query<ResultSetHeader>(
      `INSERT INTO vecino_colonia (id, user_id, colonia_id, numero_casa, estado)
       VALUES (?, ?, ?, ?, 'pendiente')`,
      [id, userId, coloniaId, numeroCasa ?? null],
    );
    const result = await this.findByUserAndColonia(userId, coloniaId);
    if (!result) throw new Error('Error al crear la solicitud');
    return result;
  }

  async findByColonia(coloniaId: string, estado?: VecinoEstado): Promise<VecinoColoniaDetalle[]> {
    const sql = `
      SELECT vc.*, u.nombre, u.apellido, u.email
      FROM vecino_colonia vc
      INNER JOIN users u ON u.id = vc.user_id
      WHERE vc.colonia_id = ?
      ${estado ? 'AND vc.estado = ?' : ''}
      ORDER BY vc.joined_at DESC
    `;
    const params = estado ? [coloniaId, estado] : [coloniaId];
    const [rows] = await pool.query<VecinoDetalleRow[]>(sql, params);
    return rows.map(toVecinoDetalle);
  }

  async findByUserAndColonia(userId: string, coloniaId: string): Promise<VecinoColonia | null> {
    const [rows] = await pool.query<VecinoRow[]>(
      'SELECT * FROM vecino_colonia WHERE user_id = ? AND colonia_id = ? LIMIT 1',
      [userId, coloniaId],
    );
    return rows[0] ? toVecino(rows[0]) : null;
  }

  async updateEstado(userId: string, coloniaId: string, estado: VecinoEstado): Promise<VecinoColonia | null> {
    await pool.query<ResultSetHeader>(
      'UPDATE vecino_colonia SET estado = ? WHERE user_id = ? AND colonia_id = ?',
      [estado, userId, coloniaId],
    );
    return this.findByUserAndColonia(userId, coloniaId);
  }
}
