import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { UserPublic } from '../entities/User';

const SALT_ROUNDS = 12;

export const hashPassword = async (plain: string): Promise<string> =>
  bcrypt.hash(plain, SALT_ROUNDS);

export const comparePassword = async (plain: string, hash: string): Promise<boolean> =>
  bcrypt.compare(plain, hash);

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

export const signToken = (user: UserPublic): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET no configurado');
  const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };
  const options: SignOptions = { expiresIn: (process.env.JWT_EXPIRES_IN ?? '7d') as SignOptions['expiresIn'] };
  return jwt.sign(payload, secret, options);
};

export const verifyToken = (token: string): JwtPayload => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET no configurado');
  return jwt.verify(token, secret) as JwtPayload;
};
