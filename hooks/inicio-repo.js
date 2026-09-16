#!/usr/bin/env node
// kit-claude · SessionStart: informa del estado del vault y del grafo del repositorio abierto.
// Barato a propósito (sin git ni red): solo lee unos pocos archivos. Ante cualquier error, calla:
// un hook roto no puede estorbar el inicio de la sesión.
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

function raizRepo(desde) {
  let dir = path.resolve(desde);
  for (;;) {
    if (fs.existsSync(path.join(dir, '.git'))) return dir;
    const padre = path.dirname(dir);
    if (padre === dir) return null;
    dir = padre;
  }
}

// En un worktree o submódulo `.git` es un archivo "gitdir: <ruta>".
function dirGit(repo) {
  const punto = path.join(repo, '.git');
  try {
    if (fs.statSync(punto).isDirectory()) return punto;
    const m = /^gitdir:\s*(.+)$/m.exec(fs.readFileSync(punto, 'utf8'));
    return m ? path.resolve(repo, m[1].trim()) : null;
  } catch { return null; }
}

function mtime(ruta) {
  try { return fs.statSync(ruta).mtimeMs; } catch { return 0; }
}

function mensaje(cwd) {
  const repo = raizRepo(cwd);
  // Un repositorio de dotfiles en la carpeta personal no es un proyecto.
  if (!repo || path.resolve(repo) === path.resolve(os.homedir())) return null;
  const git = dirGit(repo);
  if (git && fs.existsSync(path.join(git, 'kit-claude-omitir'))) return null;

  const nombre = path.basename(repo);
  const kitJson = path.join(repo, 'vault', '_kit.json');
  if (!fs.existsSync(kitJson)) {
    return `kit-claude: repo "${nombre}" SIN INICIAR. Antes de nada: skill \`memoria-repo\` (Primer inicio).`;
  }

  let kit = {};
  try { kit = JSON.parse(fs.readFileSync(kitJson, 'utf8')); } catch { /* estado ilegible: se informa igual */ }

  // Mensajes mínimos: el orden de lectura ya está en el núcleo de reglas; aquí solo el estado y lo accionable.
  const partes = [`kit-claude: repo "${nombre}".`];
  const modulo = kit.modulo_inicial || '?';
  if (kit.primer_inicio === 'en_curso') {
    const horas = (Date.now() - Date.parse(kit.lanzado || 0)) / 36e5;
    partes.push(horas > 3
      ? `Primer inicio (${modulo}) >3 h "en curso": ¿se detuvo? \`claude agents\`; si no está, repetir \`kit.mjs lanzar\`.`
      : `Primer inicio EN CURSO en segundo plano (${modulo}); si eres esa sesión, ignora esto.`);
  } else if (kit.primer_inicio === 'fallo_al_lanzar') {
    partes.push('El primer inicio falló al lanzarse: repetir `kit.mjs lanzar` (skill `memoria-repo`).');
  }

  const tGrafo = mtime(path.join(repo, 'graphify-out', 'graph.json'));
  if (!tGrafo) {
    partes.push('Sin grafo todavía: usa Grep.');
  } else {
    // HEAD cambia de fecha en cada commit, checkout o pull: si es más nuevo que el grafo, está desfasado.
    const tHead = git ? Math.max(mtime(path.join(git, 'logs', 'HEAD')), mtime(path.join(git, 'HEAD'))) : 0;
    partes.push((tHead - tGrafo) / 36e5 > 1 ? 'Grafo DESFASADO: `graphify update .` antes de usarlo.' : 'Vault y grafo listos.');
  }
  return partes.join(' ');
}

let crudo = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', t => { crudo += t; });
process.stdin.on('end', () => {
  try {
    const evento = crudo ? JSON.parse(crudo) : {};
    const texto = mensaje(evento.cwd || process.cwd());
    if (texto) {
      process.stdout.write(JSON.stringify({
        hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: texto },
      }));
    }
  } catch { /* silencio */ }
  process.exit(0);
});
