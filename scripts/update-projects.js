#!/usr/bin/env node
/**
 * Copia el archivo projects.json descargado desde proyectos-simple.html
 * a data/projects.json.
 *
 * Uso: node scripts/update-projects.js [ruta-origen]
 * Si no se pasa ruta, usa ./projects.json en el directorio del proyecto.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DEST = path.join(ROOT, 'data', 'projects.json');
const SOURCE = process.argv[2] ? path.resolve(process.argv[2]) : path.join(ROOT, 'projects.json');

if (!fs.existsSync(SOURCE)) {
	console.error('No se encontró el archivo:', SOURCE);
	console.error('Uso: node scripts/update-projects.js [ruta/projects.json]');
	process.exit(1);
}

const content = fs.readFileSync(SOURCE, 'utf8');
try {
	JSON.parse(content);
} catch (e) {
	console.error('El archivo no es JSON válido:', e.message);
	process.exit(1);
}

fs.writeFileSync(DEST, content, 'utf8');
console.log('Actualizado:', DEST);
