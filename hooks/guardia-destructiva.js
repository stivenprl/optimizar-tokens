#!/usr/bin/env node
// Guardia global (PreToolUse) contra acciones destructivas o irreversibles.
//   deny -> se bloquea; si hace falta de verdad, que lo ejecute el usuario con `!`.
//   ask  -> Claude Code pide confirmación antes de ejecutar.
// Ante una entrada ilegible deja pasar: una guardia rota no puede paralizar la sesión.
'use strict';

const path = require('path');

const ENV_PROTEGIDO = /^\.env(\.[\w-]+)*$/i;
// Plantillas y copias: no son el .env que lee la aplicación.
const ENV_NO_VIVO = /\.(example|sample|dist|template|tpl|bak|backup|old|orig)$/i;
const CLIENTE_SQL = /\b(mysql|mariadb|psql|sqlite3?)(\.exe)?\s|\bphp(\.exe)?\s+-r\b/i;
// Bases desechables de ensayo (p. ej. un gate de migraciones que hace DROP DATABASE IF EXISTS ensayo_gate).
const BASE_DESECHABLE = /^[`"]?ensayo_\w+[`"]?$/i;

const BLOQUEAR = [
  [/\bdocker(\.exe)?\s+(system|volume)\s+prune\b/i,
    'borra recursos de Docker en bloque, volúmenes incluidos: con ellos se van las bases de datos locales'],
  [/\bdocker(\.exe)?\s+volume\s+(rm|remove)\b/i,
    'borra un volumen de Docker; si es el de MySQL, la base desaparece'],
  [/\bdocker(\.exe)?[\s-]+compose\b[^|;&\n]*\bdown\b[^|;&\n]*\s(-v|--volumes)\b/i,
    '`down -v` borra los volúmenes del proyecto, es decir, la base de datos'],
];

const BORRADO = /\b(rm|remove-item|ri|del|rmdir|rd)\b/i;

const CONFIRMAR = [
  [/\brm\s+([^|;&\n]*\s)?-(?!-)(?!force\b|recurse\b)(?=[a-z]*r)(?=[a-z]*f)[a-z]+\b/i,
    'borrado recursivo forzado'],
  [new RegExp(BORRADO.source + /(?=[^|;&\n]*\s(-r|-recurse|--recursive)\b)(?=[^|;&\n]*\s(-f|-fo|-force|--force)\b)/.source, 'i'),
    'borrado recursivo forzado'],
  [/\b(rd|rmdir|del)\b[^|;&\n]*\s\/s\b/i, 'borrado recursivo'],
  [/\bgit\s+reset\b[^|;&\n]*\s--hard\b/i,
    'descarta los cambios sin commit, también los de otras sesiones en el mismo árbol'],
  [/\bgit\s+push\b[^|;&\n]*\s(--force(-with-lease)?|-f)\b/i, 'reescribe la historia remota'],
  [/\bgit\s+clean\b[^|;&\n]*\s-\w*f/i, 'borra los archivos sin seguimiento'],
  [/\bgit\s+(checkout\s+(--\s+)?|restore\s+)\.(?=\s|$|[;&|])/i, 'descarta todos los cambios del árbol'],
];

function esEnvProtegido(ruta) {
  const base = path.basename(String(ruta).replace(/["'`]/g, ''));
  return ENV_PROTEGIDO.test(base) && !ENV_NO_VIVO.test(base);
}

function revisarSql(cmd) {
  if (!CLIENTE_SQL.test(cmd)) return null;
  for (const m of cmd.matchAll(/\bdrop\s+(database|schema|table)\s+(?:if\s+exists\s+)?([`"\w.$-]+)/gi)) {
    if (/^(database|schema)$/i.test(m[1]) && BASE_DESECHABLE.test(m[2])) continue;
    return `\`DROP ${m[1].toUpperCase()} ${m[2]}\` borra datos sin vuelta atrás`;
  }
  if (/\btruncate\s+(table\s+)?[`"\w]/i.test(cmd)) return '`TRUNCATE` vacía la tabla sin vuelta atrás';
  return null;
}

function escribeEnv(cmd) {
  const destinos = [];
  for (const m of cmd.matchAll(/(?:\d?>>?|\|\s*tee(?:\s+-a)?)\s*([^\s|;&<>]+)/g)) destinos.push(m[1]);
  for (const m of cmd.matchAll(/\b(?:set-content|add-content|out-file|clear-content)\b[^|;&\n]*?\s(?:-(?:path|literalpath|filepath)\s+)?([^\s|;&-][^\s|;&]*)/gi)) {
    destinos.push(m[1]);
  }
  for (const tramo of cmd.split(/[|;&\n]/)) {
    const palabras = tramo.trim().split(/\s+/);
    if (/^(cp|mv|copy|move|copy-item|move-item)$/i.test(palabras[0]) && palabras.length > 2) {
      destinos.push(palabras[palabras.length - 1]);
    }
    if (/^sed$/i.test(palabras[0]) && palabras.some(p => /^-i/.test(p))) destinos.push(...palabras.slice(1));
  }
  return destinos.some(esEnvProtegido);
}

function decidir(evento) {
  const herramienta = evento.tool_name || '';
  const entrada = evento.tool_input || {};

  if (/^(Edit|Write|MultiEdit|NotebookEdit)$/.test(herramienta)) {
    const ruta = entrada.file_path || entrada.notebook_path || '';
    if (esEnvProtegido(ruta)) {
      return ['deny', `\`${path.basename(ruta)}\` guarda secretos y configuración del entorno; no se edita desde Claude`];
    }
    return null;
  }

  if (!/^(Bash|PowerShell)$/.test(herramienta)) return null;
  const cmd = String(entrada.command || '');

  for (const [patron, motivo] of BLOQUEAR) if (patron.test(cmd)) return ['deny', motivo];
  const sql = revisarSql(cmd);
  if (sql) return ['deny', sql];
  if (escribeEnv(cmd)) return ['deny', 'el comando escribe en un `.env`, que guarda secretos y configuración del entorno'];
  for (const [patron, motivo] of CONFIRMAR) if (patron.test(cmd)) return ['ask', motivo];
  return null;
}

let crudo = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', trozo => { crudo += trozo; });
process.stdin.on('end', () => {
  let decision;
  try {
    decision = decidir(JSON.parse(crudo));
  } catch {
    process.exit(0);
  }
  if (!decision) process.exit(0);

  const [permiso, motivo] = decision;
  const razon = permiso === 'deny'
    ? `Guardia global: ${motivo}. Si de verdad hace falta, pide al usuario que lo ejecute él con \`!\`.`
    : `Guardia global: ${motivo}. Confirma solo si es lo que quieres.`;
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: permiso,
      permissionDecisionReason: razon,
    },
  }));
  process.exit(0);
});
