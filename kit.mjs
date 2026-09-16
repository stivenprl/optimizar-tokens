#!/usr/bin/env node
// kit-claude — instalación y memoria local por repositorio para Claude Code.
// Multiplataforma (Windows, macOS, Linux). Solo módulos de Node ≥ 18; sin dependencias.
//
//   node kit.mjs comprobar            [--json]
//   node kit.mjs coste                (tokens fijos que carga cada sesión)
//   node kit.mjs instalar             [--sin-externos]
//   node kit.mjs iniciar-repo  [ruta] [--sin-obsidian] [--sin-hook]
//   node kit.mjs modulos       [ruta]
//   node kit.mjs lanzar        [ruta] --modulo <nombre> [--dry-run] [--forzar]
//   node kit.mjs registrar-obsidian [ruta]
//   node kit.mjs omitir        [ruta]
//   node kit.mjs empaquetar           (genera KIT-CLAUDE-CODE.md autocontenido)
//
// Variables: KIT_CLAUDE_HOME sustituye a ~/.claude (pruebas en seco sin tocar la instalación real).

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const KIT = path.dirname(fileURLToPath(import.meta.url));
const VERSION = JSON.parse(fs.readFileSync(path.join(KIT, 'version.json'), 'utf8')).version;
const SO = process.platform === 'win32' ? 'windows' : process.platform === 'darwin' ? 'macos' : 'linux';
const HOME = os.homedir();
const CLAUDE_HOME = process.env.KIT_CLAUDE_HOME || path.join(HOME, '.claude');
const HOY = new Date().toISOString().slice(0, 10);
const CLAUDE_MINIMO = '2.1.273'; // versión con la que se probó --bg, `claude agents` y hooks con `args`

const CARPETAS_VAULT = [
  '00 - Proyecto', '01 - Arquitectura', '02 - Base de Datos', '03 - Backend', '04 - Frontend',
  '05 - APIs', '06 - Docker', '07 - UI-UX', '08 - Decisiones', '09 - Bugs y soluciones',
  '10 - Tareas', '11 - Cambios', '12 - Testing',
];
const EXCLUSIONES = ['/vault/', '/graphify-out/', '/.graphifyignore'];
const MARCA_INI = '# >>> kit-claude (local, no versionado)';
const MARCA_FIN = '# <<< kit-claude';
const MARCA_DIR = '.kit-claude'; // presente en carpetas que el kit instala y puede reemplazar

// ───────────────────────── utilidades ─────────────────────────

function sh(cmd, { cwd, timeout = 60_000 } = {}) {
  const r = spawnSync(cmd, { cwd, shell: true, encoding: 'utf8', windowsHide: true, timeout });
  const salida = `${r.stdout || ''}${r.stderr || ''}`.trim();
  if (r.error && r.error.code === 'ETIMEDOUT') return { ok: false, codigo: 'timeout', salida: `superó ${timeout / 1000} s` };
  return { ok: r.status === 0, codigo: r.status, salida };
}

function existeComando(nombre) {
  return sh(SO === 'windows' ? `where ${nombre}` : `command -v ${nombre}`, { timeout: 15_000 }).ok;
}

function version(cmd) {
  const r = sh(cmd, { timeout: 30_000 });
  return r.ok ? (r.salida.split(/\r?\n/)[0] || 'ok') : null;
}

function compararVersion(a, b) {
  const pa = String(a).match(/\d+(\.\d+)*/)?.[0].split('.').map(Number) || [];
  const pb = String(b).split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] || 0) - (pb[i] || 0);
    if (d) return d;
  }
  return 0;
}

function leerJson(ruta, porDefecto) {
  try { return JSON.parse(fs.readFileSync(ruta, 'utf8')); } catch { return porDefecto; }
}

function escribirJson(ruta, datos) {
  fs.mkdirSync(path.dirname(ruta), { recursive: true });
  fs.writeFileSync(ruta, `${JSON.stringify(datos, null, 2)}\n`);
}

function sello() { return new Date().toISOString().replace(/[-:.TZ]/g, ''); }

function respaldar(ruta) {
  if (!fs.existsSync(ruta)) return null;
  const destino = `${ruta}.bak-${sello()}`;
  fs.copyFileSync(ruta, destino);
  return destino;
}

function copiarDir(origen, destino) {
  fs.mkdirSync(destino, { recursive: true });
  for (const e of fs.readdirSync(origen, { withFileTypes: true })) {
    const o = path.join(origen, e.name);
    const d = path.join(destino, e.name);
    if (e.isDirectory()) copiarDir(o, d); else fs.copyFileSync(o, d);
  }
}

// Reemplaza por completo una carpeta del kit. Si ya existía y NO la puso el kit (sin marca),
// se mueve a ~/.claude/kit-respaldos/ en lugar de pisarla.
function instalarDirKit(origen, destino) {
  let respaldo = null;
  if (fs.existsSync(destino)) {
    if (!fs.existsSync(path.join(destino, MARCA_DIR))) {
      respaldo = path.join(CLAUDE_HOME, 'kit-respaldos', `${path.basename(destino)}-${sello()}`);
      fs.mkdirSync(path.dirname(respaldo), { recursive: true });
      fs.renameSync(destino, respaldo);
    } else {
      fs.rmSync(destino, { recursive: true, force: true });
    }
  }
  copiarDir(origen, destino);
  fs.writeFileSync(path.join(destino, MARCA_DIR), `kit-claude ${VERSION}\n`);
  return respaldo;
}

function iguales(a, b) {
  try { return fs.readFileSync(a).equals(fs.readFileSync(b)); } catch { return false; }
}

function barra(ruta) { return ruta.split(path.sep).join('/'); }

function args(lista) {
  const pos = [];
  const op = {};
  for (let i = 0; i < lista.length; i++) {
    const a = lista[i];
    if (a.startsWith('--')) {
      const [k, v] = a.slice(2).split('=');
      if (v !== undefined) op[k] = v;
      else if (lista[i + 1] !== undefined && !lista[i + 1].startsWith('--') && ['modulo'].includes(k)) op[k] = lista[++i];
      else op[k] = true;
    } else pos.push(a);
  }
  return { pos, op };
}

// Los ejecutables de `uv tool install` van a un directorio que en una máquina limpia no está en el PATH.
// Se añade al PATH de este proceso (y de sus hijos) para no depender de reiniciar la terminal.
function anadirBinUv() {
  const candidatos = [path.join(HOME, '.local', 'bin')];
  const r = sh('uv tool dir --bin', { timeout: 15_000 });
  if (r.ok && r.salida) candidatos.unshift(r.salida.split(/\r?\n/).pop().trim());
  const clave = Object.keys(process.env).find(k => k.toUpperCase() === 'PATH') || 'PATH';
  const actual = (process.env[clave] || '').split(path.delimiter);
  for (const c of candidatos.reverse()) if (c && !actual.includes(c)) actual.unshift(c);
  process.env[clave] = actual.join(path.delimiter);
}

// ───────────────────────── componentes ─────────────────────────

function obsidianInstalado() {
  if (SO === 'windows') {
    return [process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA, 'Programs', 'Obsidian', 'Obsidian.exe'),
      process.env.ProgramFiles && path.join(process.env.ProgramFiles, 'Obsidian', 'Obsidian.exe')]
      .some(p => p && fs.existsSync(p));
  }
  if (SO === 'macos') return fs.existsSync('/Applications/Obsidian.app') || fs.existsSync(path.join(HOME, 'Applications', 'Obsidian.app'));
  return existeComando('obsidian') || flatpakObsidian() || sh('snap list obsidian').ok;
}

function flatpakObsidian() {
  return existeComando('flatpak') && sh('flatpak info md.obsidian.Obsidian').ok;
}

function dirConfigObsidian() {
  if (SO === 'windows') return path.join(process.env.APPDATA || path.join(HOME, 'AppData', 'Roaming'), 'obsidian');
  if (SO === 'macos') return path.join(HOME, 'Library', 'Application Support', 'obsidian');
  // Con flatpak la configuración vive en su sandbox aunque aún no exista (Obsidian nunca abierto).
  if (flatpakObsidian()) return path.join(HOME, '.var', 'app', 'md.obsidian.Obsidian', 'config', 'obsidian');
  const snap = path.join(HOME, 'snap', 'obsidian', 'current', '.config', 'obsidian');
  if (fs.existsSync(snap)) return snap;
  return path.join(process.env.XDG_CONFIG_HOME || path.join(HOME, '.config'), 'obsidian');
}

function obsidianAbierto() {
  // -x: nombre exacto del proceso. Con -f el propio `node kit.mjs registrar-obsidian` daría positivo.
  if (SO === 'windows') return /obsidian\.exe/i.test(sh('tasklist /FI "IMAGENAME eq Obsidian.exe" /NH').salida);
  return sh('pgrep -ix obsidian').ok;
}

function ejecutarOFallar(cmd, opciones = {}) {
  const r = sh(cmd, { timeout: 20 * 60_000, ...opciones });
  if (!r.ok) throw new Error(`\`${cmd}\` terminó con código ${r.codigo}: ${r.salida.split(/\r?\n/).slice(-3).join(' | ')}`);
  return cmd;
}

const COMPONENTES = [
  // Requisitos: los instala el script de arranque (instalar.ps1 / instalar.sh); aquí solo se comprueban.
  { id: 'git', grupo: 'requisito', comprobar: () => version('git --version') },
  {
    id: 'node', grupo: 'requisito',
    comprobar: () => (compararVersion(process.versions.node, '18') >= 0 ? `v${process.versions.node}` : { aviso: `v${process.versions.node}: se necesita 18 o superior` }),
  },
  { id: 'uv', grupo: 'requisito', comprobar: () => version('uv --version') },
  {
    id: 'claude', grupo: 'requisito',
    comprobar: () => {
      const v = version('claude --version');
      if (!v) return null;
      return compararVersion(v, CLAUDE_MINIMO) >= 0 ? v : { aviso: `${v}: actualiza con \`claude update\` (probado desde ${CLAUDE_MINIMO})` };
    },
  },
  { id: 'gh', grupo: 'aviso', nota: 'Solo para actualizar el kit desde github.com/stivenprl/optimizar-tokens.', comprobar: () => version('gh --version') },
  {
    id: 'graphify', grupo: 'obligatorio',
    comprobar: () => {
      const v = version('graphify --version');
      if (!v) return null;
      if (!fs.existsSync(path.join(CLAUDE_HOME, 'skills', 'graphify', 'SKILL.md'))) return { aviso: `${v}, pero falta la skill (\`graphify install\`)` };
      return v;
    },
    instalar: () => {
      // tree-sitter-sql: sin él los .sql no aportan nodos y el aviso pasa desapercibido.
      const hechos = [ejecutarOFallar('uv tool install --upgrade --with tree-sitter-sql graphifyy')];
      sh('uv tool update-shell', { timeout: 30_000 }); // deja ~/.local/bin en el PATH de las próximas terminales
      anadirBinUv();
      hechos.push(ejecutarOFallar('graphify install'));
      return hechos.join(' && ');
    },
  },
  {
    id: 'obsidian', grupo: 'obligatorio',
    comprobar: () => (obsidianInstalado() ? 'instalado' : null),
    instalar: () => {
      if (SO === 'windows') return ejecutarOFallar('winget install -e --id Obsidian.Obsidian --silent --accept-source-agreements --accept-package-agreements');
      if (SO === 'macos') return ejecutarOFallar('brew install --cask obsidian');
      if (existeComando('flatpak')) {
        // --user: sin sudo ni polkit.
        ejecutarOFallar('flatpak remote-add --user --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo');
        return ejecutarOFallar('flatpak install --user -y flathub md.obsidian.Obsidian');
      }
      throw new Error('sin flatpak: el usuario debe instalarlo con `sudo snap install obsidian --classic` o el AppImage de https://obsidian.md/download');
    },
  },
];

// ───────────────────────── archivos del kit en ~/.claude ─────────────────────────

// La regla va a ~/.claude/rules/: Claude Code la carga en todas las sesiones, así el CLAUDE.md que ya
// tenga el usuario se respeta intacto y las reglas de ahorro del kit se suman a él.
const REGLAS_KIT = ['kit-claude.md'];
const SKILLS_KIT = ['memoria-repo', 'actualizar-vault', 'strategic-compact'];

function copiarArchivosKit() {
  const hechos = [];
  for (const nombre of REGLAS_KIT) {
    const destino = path.join(CLAUDE_HOME, 'rules', nombre);
    if (iguales(path.join(KIT, 'global', nombre), destino)) continue;
    const copia = fs.existsSync(destino) ? respaldar(destino) : null;
    fs.mkdirSync(path.dirname(destino), { recursive: true });
    fs.copyFileSync(path.join(KIT, 'global', nombre), destino);
    hechos.push(`regla rules/${nombre}${copia ? ` (anterior en ${path.basename(copia)})` : ''}`);
  }
  if (hechos.length) hechos.push('tu CLAUDE.md no se toca');

  for (const skill of SKILLS_KIT) {
    const r = instalarDirKit(path.join(KIT, 'skills', skill), path.join(CLAUDE_HOME, 'skills', skill));
    if (r) hechos.push(`skill "${skill}" que ya tenías movida a ${barra(path.relative(CLAUDE_HOME, r))}`);
  }
  hechos.push(`skills ${SKILLS_KIT.join(', ')} instaladas`);

  const hooks = path.join(CLAUDE_HOME, 'hooks');
  fs.mkdirSync(hooks, { recursive: true });
  for (const f of ['guardia-destructiva.js', 'inicio-repo.js']) fs.copyFileSync(path.join(KIT, 'hooks', f), path.join(hooks, f));
  const r = instalarDirKit(path.join(KIT, 'hooks', 'strategic-compact'), path.join(hooks, 'strategic-compact'));
  hechos.push(`hooks copiados${r ? ` (strategic-compact previo movido a ${barra(path.relative(CLAUDE_HOME, r))})` : ''}`);

  hechos.push(fusionarSettings());
  return hechos;
}

function fusionarSettings() {
  const ruta = path.join(CLAUDE_HOME, 'settings.json');
  const antes = fs.existsSync(ruta) ? fs.readFileSync(ruta, 'utf8') : null;
  let s = {};
  if (antes !== null) {
    try { s = JSON.parse(antes); } catch { throw new Error(`${ruta} no es JSON válido: corrígelo (hay respaldos .bak-*) y repite`); }
  }
  const hook = script => ({ type: 'command', command: 'node', args: [barra(path.join(CLAUDE_HOME, 'hooks', script))], timeout: 10 });
  const deseados = [
    ['PreToolUse', 'Bash|PowerShell|Edit|Write|MultiEdit|NotebookEdit', { ...hook('guardia-destructiva.js'), statusMessage: 'Guardia de comandos destructivos' }],
    ['PreToolUse', 'Edit|Write', hook('strategic-compact/hooks/suggest-compact.js')],
    ['SessionStart', 'startup|resume|clear|compact', hook('inicio-repo.js')],
  ];
  const nombres = ['guardia-destructiva.js', 'suggest-compact.js', 'inicio-repo.js'];
  const esDelKit = h => nombres.some(n => JSON.stringify(h).includes(n));

  // Nunca se reescribe el matcher de un grupo ajeno: se quitan los hooks del kit de donde estén
  // (y los grupos que queden vacíos) y se añaden en grupos propios.
  s.hooks = s.hooks || {};
  for (const evento of Object.keys(s.hooks)) {
    s.hooks[evento] = (s.hooks[evento] || [])
      .map(g => ({ ...g, hooks: (g.hooks || []).filter(h => !esDelKit(h)) }))
      .filter(g => g.hooks.length);
    if (!s.hooks[evento].length) delete s.hooks[evento];
  }
  for (const [evento, matcher, h] of deseados) (s.hooks[evento] = s.hooks[evento] || []).push({ matcher, hooks: [h] });

  const despues = `${JSON.stringify(s, null, 2)}\n`;
  if (despues === antes) return 'settings.json ya estaba al día';
  const copia = respaldar(ruta);
  fs.mkdirSync(path.dirname(ruta), { recursive: true });
  fs.writeFileSync(ruta, despues);
  return `settings.json fusionado (hooks)${copia ? `; respaldo ${path.basename(copia)}` : ''}`;
}

// ───────────────────────── comandos globales ─────────────────────────

function estadoComponentes() {
  return COMPONENTES.map(c => {
    let r;
    try { r = c.comprobar(); } catch { r = null; }
    const aviso = r && typeof r === 'object' ? r.aviso : null;
    return { id: c.id, grupo: c.grupo, ok: Boolean(r) && !aviso, detalle: aviso || (typeof r === 'string' ? r : 'no encontrado'), nota: c.nota };
  });
}

function estadoArchivosKit() {
  const f = rel => fs.existsSync(path.join(CLAUDE_HOME, rel));
  const texto = JSON.stringify(leerJson(path.join(CLAUDE_HOME, 'settings.json'), {}).hooks || {});
  return [
    ...REGLAS_KIT.map(n => ({ id: `regla rules/${n}`, ok: iguales(path.join(KIT, 'global', n), path.join(CLAUDE_HOME, 'rules', n)) })),
    ...SKILLS_KIT.map(s => ({ id: `skill ${s}`, ok: iguales(path.join(KIT, 'skills', s, 'SKILL.md'), path.join(CLAUDE_HOME, 'skills', s, 'SKILL.md')) })),
    { id: 'hook guardia-destructiva', ok: iguales(path.join(KIT, 'hooks', 'guardia-destructiva.js'), path.join(CLAUDE_HOME, 'hooks', 'guardia-destructiva.js')) && texto.includes('guardia-destructiva.js') },
    { id: 'hook strategic-compact', ok: f('hooks/strategic-compact/hooks/suggest-compact.js') && texto.includes('suggest-compact.js') },
    { id: 'hook inicio-repo', ok: iguales(path.join(KIT, 'hooks', 'inicio-repo.js'), path.join(CLAUDE_HOME, 'hooks', 'inicio-repo.js')) && texto.includes('inicio-repo.js') },
  ].map(x => ({ ...x, grupo: 'kit', detalle: x.ok ? 'ok' : 'falta o desactualizado' }));
}

function imprimirEstado(filas) {
  for (const f of filas) {
    const marca = f.ok ? 'OK   ' : ['opcional', 'aviso'].includes(f.grupo) ? 'AVISO' : 'FALTA';
    console.log(`${marca}  ${f.id.padEnd(28)} ${f.detalle}${f.nota && !f.ok ? `  — ${f.nota}` : ''}`);
  }
}

function cmdComprobar({ op }) {
  const filas = [...estadoComponentes(), ...estadoArchivosKit()];
  const fallos = filas.filter(f => !f.ok && ['requisito', 'obligatorio', 'kit'].includes(f.grupo));
  if (op.json) console.log(JSON.stringify({ so: SO, kit: VERSION, claudeHome: CLAUDE_HOME, filas, ok: fallos.length === 0 }, null, 2));
  else {
    console.log(`kit-claude ${VERSION} · sistema: ${SO} · configuración: ${CLAUDE_HOME}\n`);
    imprimirEstado(filas);
    console.log(fallos.length ? `\n${fallos.length} elemento(s) obligatorio(s) sin resolver.` : '\nTodo lo obligatorio está en orden.');
  }
  process.exitCode = fallos.length ? 1 : 0;
}

// Estimación de lo que se carga en CADA sesión (reglas + listado de skills). Aproximada:
// 2,2 caracteres por token, medido con la API sobre estas mismas reglas en español.
function cmdCoste() {
  const tok = chars => Math.round(chars / 2.2);
  const filas = [];
  const condicionales = [];
  const dirReglas = path.join(CLAUDE_HOME, 'rules');
  if (fs.existsSync(dirReglas)) {
    for (const f of fs.readdirSync(dirReglas).filter(n => n.endsWith('.md'))) {
      const texto = fs.readFileSync(path.join(dirReglas, f), 'utf8');
      // Con `paths:` solo entra al tocar archivos que coinciden: no es carga fija.
      if (/^---\r?\n[\s\S]*?^paths:/m.test(texto)) condicionales.push([`rules/${f}`, tok(texto.length)]);
      else filas.push([`rules/${f}`, tok(texto.length)]);
    }
  }
  const personal = path.join(CLAUDE_HOME, 'CLAUDE.md');
  if (fs.existsSync(personal)) filas.push(['CLAUDE.md personal', tok(fs.readFileSync(personal, 'utf8').length)]);

  const overrides = leerJson(path.join(CLAUDE_HOME, 'settings.json'), {}).skillOverrides || {};
  let listado = 0;
  const dirSkills = path.join(CLAUDE_HOME, 'skills');
  for (const n of fs.existsSync(dirSkills) ? fs.readdirSync(dirSkills) : []) {
    const archivo = path.join(dirSkills, n, 'SKILL.md');
    if (!fs.existsSync(archivo)) continue;
    const modo = overrides[n] || 'on';
    if (modo === 'off' || modo === 'user-invocable-only') continue;
    const fm = (fs.readFileSync(archivo, 'utf8').match(/^---\r?\n([\s\S]*?)\r?\n---/) || [])[1] || '';
    const campo = k => ((fm.match(new RegExp(`^${k}:\\s*(.*)$`, 'm')) || [])[1] || '').replace(/^["']|["']$/g, '');
    const texto = modo === 'name-only' ? n : `${n}: ${`${campo('description')} ${campo('when_to_use')}`.trim().slice(0, 1536)}`;
    listado += texto.length;
  }
  filas.push(['listado de skills (con skillOverrides)', tok(listado)]);
  const total = filas.reduce((a, [, t]) => a + t, 0);
  console.log(`Carga fija por sesión en ${CLAUDE_HOME} (aproximada):\n`);
  for (const [q, t] of filas) console.log(`  ${String(t).padStart(6)} tok  ${q}`);
  console.log(`  ${String(total).padStart(6)} tok  TOTAL (sin prompt de sistema ni plugins; plugins: \`claude plugin details <id>\`)`);
  if (condicionales.length) {
    console.log('\nSolo al tocar archivos que coinciden (reglas con paths):');
    for (const [q, t] of condicionales) console.log(`  ${String(t).padStart(6)} tok  ${q}`);
  }
}

function cmdInstalar({ op }) {
  console.log(`kit-claude ${VERSION} · instalando en ${SO} · configuración: ${CLAUDE_HOME}\n`);
  const faltanReq = estadoComponentes().filter(f => f.grupo === 'requisito' && !f.ok);
  if (faltanReq.length && !op['sin-externos']) {
    console.log(`Requisitos sin resolver: ${faltanReq.map(f => `${f.id} (${f.detalle})`).join(', ')}. Resuélvelos (instalar.ps1 / instalar.sh) y repite.`);
    process.exitCode = 1;
    return;
  }

  const informe = [];
  if (!op['sin-externos']) {
    for (const c of COMPONENTES) {
      if (!c.instalar) continue;
      if (c.grupo === 'opcional' && op['sin-opcionales']) { informe.push(`- ${c.id}: omitido (--sin-opcionales)`); continue; }
      const previo = estadoComponentes().find(f => f.id === c.id);
      if (previo.ok) { informe.push(`= ${c.id}: ya estaba (${previo.detalle})`); continue; }
      try {
        informe.push(`+ ${c.id}: ${c.instalar()}`);
      } catch (e) {
        // Algunos instaladores devuelven error cuando el paquete ya existía: manda la re-comprobación.
        const ahora = estadoComponentes().find(f => f.id === c.id);
        informe.push(ahora.ok ? `= ${c.id}: presente tras reintento (${ahora.detalle})` : `! ${c.id}: ${e.message}`);
      }
    }
  }
  try {
    for (const h of copiarArchivosKit()) informe.push(`+ ${h}`);
  } catch (e) {
    informe.push(`! archivos del kit: ${e.message}`);
  }
  console.log(informe.join('\n'));
  console.log('\n── Comprobación final ──');
  cmdComprobar({ op: {} });
}

// ───────────────────────── repositorio ─────────────────────────

function git(repo, argsGit) {
  const r = spawnSync('git', argsGit, { cwd: repo, encoding: 'utf8', windowsHide: true, timeout: 60_000 });
  return { ok: r.status === 0, salida: (r.stdout || '').trim(), error: (r.stderr || '').trim() };
}

function resolverRepo(ruta) {
  const r = git(path.resolve(ruta || '.'), ['rev-parse', '--show-toplevel']);
  if (!r.ok) throw new Error(`"${path.resolve(ruta || '.')}" no es un repositorio git`);
  const repo = path.resolve(r.salida);
  if (path.resolve(repo) === path.resolve(HOME)) throw new Error('la carpeta personal es un repositorio git (dotfiles): el kit no se aplica ahí');
  return repo;
}

function rutaGit(repo, rel) {
  return path.resolve(repo, git(repo, ['rev-parse', '--git-path', rel]).salida);
}

function aplicarExclusiones(repo) {
  const ruta = rutaGit(repo, 'info/exclude');
  const actual = fs.existsSync(ruta) ? fs.readFileSync(ruta, 'utf8') : '';
  const bloque = [MARCA_INI, ...EXCLUSIONES, MARCA_FIN].join('\n');
  const patron = new RegExp(`${MARCA_INI.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s\\S]*?${MARCA_FIN}`);
  const nuevo = patron.test(actual) ? actual.replace(patron, bloque) : `${actual.replace(/\s*$/, '')}${actual.trim() ? '\n\n' : ''}${bloque}\n`;
  if (nuevo === actual) return 'exclusiones git ya presentes';
  fs.mkdirSync(path.dirname(ruta), { recursive: true });
  fs.writeFileSync(ruta, nuevo);
  return `exclusiones añadidas a ${barra(path.relative(repo, ruta))}`;
}

function versionadosProblematicos(repo) {
  const r = git(repo, ['ls-files', '--', 'vault', 'graphify-out', '.graphifyignore']);
  return r.ok && r.salida ? r.salida.split(/\r?\n/).slice(0, 5) : [];
}

// Devuelve 'nuevo' | 'kit' | 'obsidian'; lanza error si `vault/` es otra cosa (p. ej. HashiCorp Vault).
function tipoVault(vault) {
  if (!fs.existsSync(vault)) return 'nuevo';
  if (fs.existsSync(path.join(vault, '_kit.json'))) return 'kit';
  try { if (/kit-claude/.test(fs.readFileSync(path.join(vault, '_INDICE.md'), 'utf8'))) return 'kit'; } catch { /* sin índice */ }
  if (fs.existsSync(path.join(vault, '.obsidian'))) return 'obsidian';
  throw new Error('ya existe una carpeta vault/ que no es un vault de Obsidian ni del kit (¿configuración de otra herramienta?). No se toca: renómbrala o decide con el usuario');
}

function prepararVault(repo, salida) {
  const vault = path.join(repo, 'vault');
  const tipo = tipoVault(vault);
  if (tipo !== 'obsidian') for (const c of CARPETAS_VAULT) fs.mkdirSync(path.join(vault, c), { recursive: true });
  const indice = path.join(vault, '_INDICE.md');
  if (!fs.existsSync(indice)) {
    fs.writeFileSync(indice, fs.readFileSync(path.join(KIT, 'plantillas', 'vault', '_INDICE.md'), 'utf8')
      .replaceAll('{{REPO}}', path.basename(repo)).replaceAll('{{FECHA}}', HOY));
  }
  const pendiente = path.join(vault, '10 - Tareas', 'Pendiente.md');
  if (!fs.existsSync(pendiente)) {
    fs.mkdirSync(path.dirname(pendiente), { recursive: true });
    fs.copyFileSync(path.join(KIT, 'plantillas', 'vault', '10 - Tareas', 'Pendiente.md'), pendiente);
  }
  for (const dir of [vault, path.join(repo, 'graphify-out')]) {
    fs.mkdirSync(dir, { recursive: true });
    const ht = path.join(dir, '.htaccess');
    if (!fs.existsSync(ht)) fs.copyFileSync(path.join(KIT, 'plantillas', 'htaccess'), ht);
  }
  salida.hechos.push({
    nuevo: 'vault creado (00–12 + _INDICE.md + .htaccess)',
    kit: 'vault del kit ya existente: respetado',
    obsidian: 'vault de Obsidian existente adoptado (solo se añadieron _INDICE.md y 10 - Tareas/Pendiente.md si faltaban)',
  }[tipo]);
}

// Estar fuera de git no protege si se despliega copiando la carpeta o con `COPY . .` en Docker.
function avisosDespliegue(repo) {
  const avisos = [];
  const dockerfiles = fs.readdirSync(repo).filter(n => /^Dockerfile/i.test(n));
  if (dockerfiles.length) {
    const di = path.join(repo, '.dockerignore');
    const txt = fs.existsSync(di) ? fs.readFileSync(di, 'utf8') : '';
    if (!/^\/?vault\/?\s*$/m.test(txt) || !/^\/?graphify-out\/?\s*$/m.test(txt)) {
      avisos.push(`hay ${dockerfiles.join(', ')} y .dockerignore no excluye vault/ y graphify-out/: si la imagen copia el repo, se incluirían. Proponer al usuario añadirlos a .dockerignore (es un archivo versionado: requiere su aprobación)`);
    }
  }
  return avisos;
}

function contarCodigo(dir, limite = { n: 0 }) {
  const EXT = /\.(php|js|mjs|cjs|ts|tsx|jsx|vue|svelte|py|go|java|cs|rb|kt|swift|sql)$/i;
  let total = 0;
  let entradas;
  try { entradas = fs.readdirSync(dir, { withFileTypes: true }); } catch { return 0; }
  for (const e of entradas) {
    if (limite.n++ > 60000) break;
    if (e.isDirectory()) {
      if (IGNORAR_DIR.has(e.name.toLowerCase()) || e.name.startsWith('.')) continue;
      total += contarCodigo(path.join(dir, e.name), limite);
    } else if (EXT.test(e.name) && !/\.min\./i.test(e.name)) total++;
  }
  return total;
}

const IGNORAR_DIR = new Set([
  'vendor', 'node_modules', 'bower_components', 'libraries', 'library', 'lib', 'libs', 'assets', 'css', 'scss',
  'img', 'images', 'fonts', 'icons', 'uploads', 'vault', 'graphify-out', 'storage', 'cache', 'dist', 'build',
  'coverage', 'test-results', 'playwright-report', 'tmp', 'temp', 'logs', 'phpmailer', 'dompdf', 'tcpdf', 'fpdf',
]);
const NO_MODULO = new Set([...IGNORAR_DIR, 'tests', 'test', 'docs', 'database', 'migrations', 'config', 'includes',
  'include', 'public', 'resources', 'scripts', 'bin', 'general', 'shared', 'common', 'layouts', 'partials', 'pwa', 'legal',
  'modules', 'modulos', 'pages', 'src', 'app']);

function detectarModulos(repo) {
  const raices = ['pages', 'modules', 'modulos', 'app/Modules', 'src/modules', 'src/pages', 'app/Http/Controllers', 'src/app', 'src', 'app', 'api'];
  for (const r of raices) {
    const abs = path.join(repo, r);
    if (!fs.existsSync(abs) || !fs.statSync(abs).isDirectory()) continue;
    const candidatos = [];
    for (const e of fs.readdirSync(abs, { withFileTypes: true })) {
      if (!e.isDirectory() || e.name.startsWith('.') || NO_MODULO.has(e.name.toLowerCase())) continue;
      const n = contarCodigo(path.join(abs, e.name));
      if (n > 0) candidatos.push({ modulo: e.name, ruta: `${r}/${e.name}`, archivos: n });
    }
    if (candidatos.length) return candidatos.sort((a, b) => b.archivos - a.archivos).slice(0, 12);
  }
  const candidatos = [];
  for (const e of fs.readdirSync(repo, { withFileTypes: true })) {
    if (!e.isDirectory() || e.name.startsWith('.') || NO_MODULO.has(e.name.toLowerCase())) continue;
    const n = contarCodigo(path.join(repo, e.name));
    if (n > 0) candidatos.push({ modulo: e.name, ruta: e.name, archivos: n });
  }
  return candidatos.sort((a, b) => b.archivos - a.archivos).slice(0, 12);
}

const LINEA_MERGE = /^graphify-out\/graph\.json[ \t]+merge=graphify[ \t]*$/m;
const LINEA_MERGE_BORRAR = /^graphify-out\/graph\.json[ \t]+merge=graphify[ \t]*\r?\n?/m;

function instalarHookGraphify(repo) {
  if (!existeComando('graphify')) return { aviso: 'graphify no está instalado: hook post-commit sin instalar' };
  // Con core.hooksPath (husky, .githooks…) el hook iría a una carpeta que suele estar versionada.
  const hooksPath = git(repo, ['config', '--get', 'core.hooksPath']);
  if (hooksPath.ok && hooksPath.salida) {
    return { aviso: `el repo usa core.hooksPath=${hooksPath.salida}: no se instala el hook de Graphify (iría a una carpeta compartida). Tras cada commit, \`graphify update .\`` };
  }
  const estado = sh('graphify hook status', { cwd: repo });
  if (estado.ok && /post-commit:\s*installed/i.test(estado.salida)) return `hook post-commit de Graphify ya instalado${devolverGitattributes(repo, undefined)}`;
  // `graphify hook install` añade `graphify-out/graph.json merge=graphify` al .gitattributes VERSIONADO.
  // graph.json nunca se sube: se restaura el archivo y la línea pasa a .git/info/attributes (local).
  const attrs = path.join(repo, '.gitattributes');
  const previo = fs.existsSync(attrs) ? fs.readFileSync(attrs) : null;
  const r = sh('graphify hook install', { cwd: repo });
  const limpieza = devolverGitattributes(repo, previo);
  return r.ok
    ? `hook post-commit de Graphify instalado (rehace el grafo en cada commit)${limpieza}`
    : { aviso: `graphify hook install falló: ${r.salida.split(/\r?\n/).pop()}` };
}

// previo: Buffer (existía) · null (no existía) · undefined (se desconoce: solo quitar la línea)
function devolverGitattributes(repo, previo) {
  const attrs = path.join(repo, '.gitattributes');
  if (!fs.existsSync(attrs)) return '';
  const actual = fs.readFileSync(attrs);
  if (!LINEA_MERGE.test(actual.toString('utf8'))) return '';
  if (Buffer.isBuffer(previo) && !LINEA_MERGE.test(previo.toString('utf8'))) {
    fs.writeFileSync(attrs, previo); // restauración byte a byte
  } else {
    const resto = actual.toString('utf8').replace(LINEA_MERGE_BORRAR, '');
    const versionado = git(repo, ['ls-files', '--error-unmatch', '.gitattributes']).ok;
    if (!resto.trim() && !versionado) fs.rmSync(attrs); else fs.writeFileSync(attrs, resto);
  }
  const local = rutaGit(repo, 'info/attributes');
  const contenido = fs.existsSync(local) ? fs.readFileSync(local, 'utf8') : '';
  if (!LINEA_MERGE.test(contenido)) {
    fs.mkdirSync(path.dirname(local), { recursive: true });
    fs.writeFileSync(local, `${contenido.replace(/\s*$/, '')}${contenido.trim() ? '\n' : ''}graphify-out/graph.json merge=graphify\n`);
  }
  return '; línea de merge movida de .gitattributes a .git/info/attributes';
}

function registrarObsidian(repo) {
  const vault = path.join(repo, 'vault');
  if (!obsidianInstalado()) return { aviso: 'Obsidian no está instalado: vault sin registrar' };
  const cfg = path.join(dirConfigObsidian(), 'obsidian.json');
  let datos = { vaults: {} };
  if (fs.existsSync(cfg)) {
    // Si el registro existe pero no se entiende, NO se reescribe: se perderían los vaults del usuario.
    try { datos = JSON.parse(fs.readFileSync(cfg, 'utf8')); } catch {
      return { aviso: `${cfg} no es JSON válido; no se toca. En Obsidian: "Abrir carpeta como vault" → ${vault}` };
    }
  }
  datos.vaults = datos.vaults || {};
  const norm = p => (SO === 'windows' ? path.resolve(p).toLowerCase() : path.resolve(p));
  if (Object.values(datos.vaults).some(v => v && v.path && norm(v.path) === norm(vault))) return 'vault ya registrado en Obsidian';
  // Obsidian reescribe obsidian.json al cerrarse: editarlo con la app abierta se perdería.
  if (obsidianAbierto()) {
    return { aviso: `Obsidian está abierto: ciérralo y ejecuta \`node "$HOME/.claude-kit/kit.mjs" registrar-obsidian .\`, o en Obsidian "Abrir carpeta como vault" → ${vault}` };
  }
  datos.vaults[crypto.randomBytes(8).toString('hex')] = { path: vault, ts: Date.now() };
  const dia = `${cfg}.bak-kit-${HOY}`;
  if (fs.existsSync(cfg) && !fs.existsSync(dia)) fs.copyFileSync(cfg, dia); // un respaldo por día, no uno por repo
  escribirJson(cfg, datos);
  return 'vault registrado en Obsidian (aparecerá en su lista de vaults)';
}

function cmdIniciarRepo({ pos, op }) {
  const salida = { ok: true, so: SO, repo: null, hechos: [], avisos: [], errores: [], modulos: [] };
  try {
    const repo = resolverRepo(pos[0]);
    salida.repo = repo;
    const statusAntes = git(repo, ['status', '--porcelain']).salida.split(/\r?\n/).filter(Boolean);
    const omitir = rutaGit(repo, 'kit-claude-omitir');
    if (fs.existsSync(omitir)) fs.rmSync(omitir);

    tipoVault(path.join(repo, 'vault')); // valida antes de tocar nada
    salida.hechos.push(aplicarExclusiones(repo));
    const versionados = versionadosProblematicos(repo);
    if (versionados.length) {
      salida.avisos.push(`ya están en git y la exclusión no los oculta: ${versionados.join(', ')}. Decidir con el usuario: sacarlos del índice los borraría también de la copia de cada compañero al hacer pull`);
    }

    const gi = path.join(repo, '.graphifyignore');
    if (!fs.existsSync(gi)) { fs.copyFileSync(path.join(KIT, 'plantillas', 'graphifyignore'), gi); salida.hechos.push('.graphifyignore creado'); }

    prepararVault(repo, salida);
    salida.avisos.push(...avisosDespliegue(repo));

    for (const paso of [op['sin-hook'] ? null : () => instalarHookGraphify(repo), op['sin-obsidian'] ? null : () => registrarObsidian(repo)]) {
      if (!paso) continue;
      const r = paso();
      if (typeof r === 'string') salida.hechos.push(r); else salida.avisos.push(r.aviso);
    }

    // iniciar-repo no puede dejar NADA nuevo para git (ni lo local ni efectos de herramientas de terceros).
    const nuevos = git(repo, ['status', '--porcelain']).salida.split(/\r?\n/).filter(l => l && !statusAntes.includes(l));
    if (nuevos.length) salida.errores.push(`git ve cambios que no existían antes de iniciar-repo (revisar con \`git diff\` y deshacer solo esos):\n${nuevos.join('\n')}`);

    salida.modulos = detectarModulos(repo);
    salida.primer_inicio = leerJson(path.join(repo, 'vault', '_kit.json'), {}).primer_inicio || 'sin_lanzar';
  } catch (e) {
    salida.errores.push(e.message);
  }
  salida.ok = salida.errores.length === 0;
  console.log(JSON.stringify(salida, null, 2));
  process.exitCode = salida.ok ? 0 : 1;
}

function cmdModulos({ pos }) {
  console.log(JSON.stringify(detectarModulos(resolverRepo(pos[0])), null, 2));
}

// En Windows `claude` puede ser claude.exe (instalador nativo) o claude.cmd (npm): el .cmd necesita cmd.exe.
function lanzarClaude(argumentos, cwd) {
  if (SO !== 'windows') return spawnSync('claude', argumentos, { cwd, encoding: 'utf8', timeout: 120_000 });
  const donde = sh('where claude').salida.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  const exe = donde.find(p => /\.exe$/i.test(p));
  if (exe) return spawnSync(exe, argumentos, { cwd, encoding: 'utf8', windowsHide: true, timeout: 120_000 });
  const cmd = donde.find(p => /\.(cmd|bat)$/i.test(p));
  if (!cmd) return { status: 1, stderr: 'no se encontró claude en el PATH' };
  const citado = [cmd, ...argumentos].map(a => `"${String(a).replace(/"/g, '""')}"`).join(' ');
  return spawnSync('cmd.exe', ['/d', '/s', '/c', `"${citado}"`], { cwd, encoding: 'utf8', windowsHide: true, windowsVerbatimArguments: true, timeout: 120_000 });
}

function cmdLanzar({ pos, op }) {
  const repo = resolverRepo(pos[0]);
  const modulo = typeof op.modulo === 'string' ? op.modulo.trim() : '';
  if (!modulo) throw new Error('falta --modulo "<nombre>"');
  if (!fs.existsSync(path.join(repo, 'vault', '_INDICE.md'))) throw new Error('el repo no está preparado: ejecuta antes `iniciar-repo`');

  const kitJson = path.join(repo, 'vault', '_kit.json');
  const previo = leerJson(kitJson, null);
  if (previo && previo.primer_inicio === 'completado' && !op.forzar) {
    console.log(JSON.stringify({ ok: true, lanzado: false, motivo: 'el primer inicio ya está completado (usa --forzar para repetirlo)' }, null, 2));
    return;
  }

  const nombre = path.basename(repo);
  const dirKit = path.join(repo, 'vault', '.kit');
  const prompt = fs.readFileSync(path.join(KIT, 'plantillas', 'primer-inicio.md'), 'utf8')
    .replaceAll('{{REPO}}', nombre).replaceAll('{{MODULO}}', modulo).replaceAll('{{FECHA}}', HOY);

  // Permisos exactos. Nada de `graphify *` (incluye `graphify claude install`, `add <url>`, `uninstall`),
  // ni `git log` (--output escribe archivos), ni lectura fuera del repo o de .env.
  const graphify = ['graphify --version', 'graphify extract . --code-only', 'graphify god-nodes *', 'graphify query *',
    'graphify affected *', 'graphify path *', 'graphify explain *'];
  const gitLectura = ['git branch --show-current', 'git ls-files *'];
  const permitidas = [
    'Read(./**)', 'Grep', 'Glob', 'Edit(vault/**)',
    ...[...graphify, ...gitLectura].map(c => `Bash(${c})`),
    ...[...graphify, ...gitLectura].map(c => `PowerShell(${c})`),
  ].join(',');
  const prohibidas = ['Read(.env*)', 'Read(**/.env*)', 'Edit(.env*)', 'Edit(**/.env*)'].join(',');

  // Las sesiones --bg se mueven a un git worktree antes de editar; vault/ no está versionado y no existe
  // allí, así que se desactiva el aislamiento SOLO para esta sesión (sus permisos ya limitan la escritura a vault/).
  const ajustes = path.join(dirKit, 'ajustes-sesion.json');
  // Orden importante: --allowedTools/--disallowedTools admiten varios valores y se tragarían el prompt si
  // fueran justo delante. Tras ellos, opciones de un solo valor; el prompt al final.
  const argumentos = [
    '--bg', '--allowedTools', permitidas, '--disallowedTools', prohibidas,
    '--settings', ajustes, '--model', 'sonnet', '--permission-mode', 'default', '--name', `primer-inicio ${nombre}`,
    'Lee vault/.kit/primer-inicio.md y ejecútalo de principio a fin.',
  ];

  if (op['dry-run']) {
    console.log(JSON.stringify({ ok: true, lanzado: false, dryRun: true, cwd: repo, comando: ['claude', ...argumentos] }, null, 2));
    return;
  }

  fs.mkdirSync(dirKit, { recursive: true });
  fs.writeFileSync(path.join(dirKit, 'primer-inicio.md'), prompt);
  escribirJson(ajustes, { worktree: { bgIsolation: 'none' } });
  escribirJson(kitJson, {
    kit: VERSION, creado: previo?.creado || HOY, modulo_inicial: modulo, primer_inicio: 'en_curso',
    lanzado: new Date().toISOString(), modulos_documentados: previo?.modulos_documentados || [],
  });

  const r = lanzarClaude(argumentos, repo);
  const ok = r.status === 0;
  if (!ok) escribirJson(kitJson, { ...leerJson(kitJson, {}), primer_inicio: 'fallo_al_lanzar' });
  const texto = `${r.stdout || ''}${r.stderr || ''}`.trim() || (r.error && r.error.message) || '';
  console.log(JSON.stringify({
    ok, lanzado: ok, id: (texto.match(/backgrounded · ([0-9a-f]+)/) || [])[1] || null, salida: texto,
    seguimiento: ['claude agents', 'claude logs <id>', 'claude attach <id>'],
  }, null, 2));
  process.exitCode = ok ? 0 : 1;
}

function cmdRegistrarObsidian({ pos }) {
  const r = registrarObsidian(resolverRepo(pos[0]));
  console.log(typeof r === 'string' ? r : `AVISO: ${r.aviso}`);
}

function cmdOmitir({ pos }) {
  const repo = resolverRepo(pos[0]);
  fs.writeFileSync(rutaGit(repo, 'kit-claude-omitir'), `${HOY}\n`);
  console.log(`kit-claude no volverá a proponer el primer inicio en ${path.basename(repo)} (se revierte con iniciar-repo).`);
}

// ───────────────────────── empaquetado autocontenido ─────────────────────────
// KIT-CLAUDE-CODE.md = docs/KIT-CLAUDE-CODE.fuente.md + anexo con cada archivo del kit y su sha256.
// Se entrega ese único archivo; el extractor de la sección 2.3 lo desempaqueta y verifica.

const VALLA = '~'.repeat(8);

function archivosDelKit() {
  // El texto del documento ya va en la parte legible: incluirlo en el anexo lo duplicaría.
  const fuera = new Set(['KIT-CLAUDE-CODE.md', 'docs/KIT-CLAUDE-CODE.fuente.md']);
  const lista = git(KIT, ['ls-files', '--cached', '--others', '--exclude-standard']);
  const rutas = lista.ok && lista.salida
    ? lista.salida.split(/\r?\n/)
    : (function recorrer(dir, base = '') {
      return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
        if (e.name === '.git') return [];
        const rel = base ? `${base}/${e.name}` : e.name;
        return e.isDirectory() ? recorrer(path.join(dir, e.name), rel) : [rel];
      });
    })(KIT);
  return rutas.filter(r => r && !fuera.has(r) && !/\.bak-/.test(r) && fs.existsSync(path.join(KIT, r))).sort();
}

function cmdEmpaquetar() {
  // En un kit extraído no hay fuente: se recupera cortando el anexo del propio documento.
  const rutaFuente = path.join(KIT, 'docs', 'KIT-CLAUDE-CODE.fuente.md');
  const fuente = fs.existsSync(rutaFuente)
    ? fs.readFileSync(rutaFuente, 'utf8').replace(/\r\n/g, '\n')
    : fs.readFileSync(path.join(KIT, 'KIT-CLAUDE-CODE.md'), 'utf8').replace(/\r\n/g, '\n').split('\n---\n\n## Anexo — Archivos del kit')[0];
  const bloques = [];
  for (const rel of archivosDelKit()) {
    const bruto = fs.readFileSync(path.join(KIT, rel));
    let texto = bruto.toString('utf8');
    if (texto.includes('\u0000') || Buffer.from(texto, 'utf8').compare(bruto) !== 0) throw new Error(`${rel} no es texto UTF-8: no se puede empaquetar`);
    const bom = texto.charCodeAt(0) === 0xfeff;
    if (bom) texto = texto.slice(1);
    const crlf = texto.includes('\r\n');
    texto = texto.replace(/\r\n/g, '\n');
    if (texto.split('\n').some(l => l.startsWith(VALLA))) throw new Error(`${rel} contiene una línea que empieza por ${VALLA}`);
    if (!texto.endsWith('\n')) texto += '\n';
    const sha = crypto.createHash('sha256').update(texto, 'utf8').digest('hex');
    const attrs = `${bom ? ' bom' : ''}${crlf ? ' crlf' : ''}`;
    bloques.push([`<!-- kit-archivo ruta="${rel}" sha256="${sha}"${attrs} -->`, `${VALLA}text`, texto.slice(0, -1), VALLA, '<!-- /kit-archivo -->', ''].join('\n'));
  }
  const salida = [
    fuente.replace(/\s*$/, ''),
    '',
    '---',
    '',
    `## Anexo — Archivos del kit (versión ${VERSION})`,
    '',
    '> **Claude: no leas este anexo.** Lo desempaqueta y verifica el extractor del paso 2.3.',
    `> ${bloques.length} archivos. Cada bloque lleva su ruta y su sha256.`,
    '',
    // El extractor exige encontrar exactamente este número: un documento recortado no pasa.
    `<!-- kit-anexo version="${VERSION}" archivos="${bloques.length}" -->`,
    '',
    ...bloques,
  ].join('\n');
  fs.writeFileSync(path.join(KIT, 'KIT-CLAUDE-CODE.md'), salida);
  console.log(`KIT-CLAUDE-CODE.md generado: ${bloques.length} archivos, ${Math.round(Buffer.byteLength(salida) / 1024)} KB`);
}

// ───────────────────────── entrada ─────────────────────────

const COMANDOS = {
  comprobar: cmdComprobar, coste: cmdCoste, instalar: cmdInstalar, 'iniciar-repo': cmdIniciarRepo, modulos: cmdModulos,
  lanzar: cmdLanzar, 'registrar-obsidian': cmdRegistrarObsidian, omitir: cmdOmitir, empaquetar: cmdEmpaquetar,
};

const [, , nombreCmd, ...resto] = process.argv;
const cmd = COMANDOS[nombreCmd];
if (!cmd) {
  console.log(fs.readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').slice(1, 15).map(l => l.replace(/^\/\/ ?/, '')).join('\n'));
  process.exitCode = nombreCmd ? 1 : 0;
} else {
  if (['comprobar', 'instalar', 'iniciar-repo', 'lanzar'].includes(nombreCmd)) anadirBinUv();
  try { cmd(args(resto)); } catch (e) { console.error(`kit-claude: ${e.message}`); process.exitCode = 1; }
}
