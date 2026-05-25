import fs from 'fs';
import path from 'path';

export const publicDir = path.join(process.cwd(), 'public');
export const coloniasImagesDir = path.join(publicDir, 'colonias');

export const ensureColoniaImagesDir = (): void => {
  fs.mkdirSync(coloniasImagesDir, { recursive: true });
};

export const coloniaImageUrlFromFile = (fileName: string): string => `/static/colonias/${fileName}`;