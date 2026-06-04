import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config({
  path: path.resolve(process.cwd(), '.env')
});

const pool = mysql.createPool({
  host:               process.env.DB_HOST     ?? 'localhost',
  port:               Number(process.env.DB_PORT ?? 3306),
  user:               process.env.DB_USER     ?? 'root',
  password:           process.env.DB_PASSWORD ?? '',
  database:           process.env.DB_NAME     ?? 'coloniaapp',
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
  timezone:           '+00:00',
});

export default pool;
