// Sustituto reducido de scripts/lib/utils.js de everything-claude-code (affaan-m).
// suggest-compact.js solo usa estas cinco funciones; el original arrastra
// agent-data-home, path-safety y utilidades con execSync que este hook no necesita.
// Lógica copiada tal cual del original (15 sep 2026).
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

function getTempDir() {
  return os.tmpdir();
}

function writeFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
}

function readStdinJson(options = {}) {
  const { timeoutMs = 5000, maxSize = 1024 * 1024 } = options;

  return new Promise(resolve => {
    let data = '';
    let settled = false;
    let overflowed = false;

    const terminar = () => {
      if (overflowed) return {};
      try {
        return data.trim() ? JSON.parse(data) : {};
      } catch {
        return {};
      }
    };

    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      process.stdin.removeAllListeners('data');
      process.stdin.removeAllListeners('end');
      process.stdin.removeAllListeners('error');
      if (process.stdin.unref) process.stdin.unref();
      resolve(terminar());
    }, timeoutMs);

    process.stdin.setEncoding('utf8');
    process.stdin.on('data', chunk => {
      if (settled || overflowed) return;
      if (data.length + chunk.length > maxSize) {
        overflowed = true;
        data = '';
        return;
      }
      data += chunk;
    });
    process.stdin.on('end', () => {
      clearTimeout(timer);
      if (settled) return;
      settled = true;
      resolve(terminar());
    });
    process.stdin.on('error', () => {
      clearTimeout(timer);
      if (settled) return;
      settled = true;
      resolve({});
    });
  });
}

function log(message) {
  console.error(message);
}

function output(data) {
  console.log(typeof data === 'object' ? JSON.stringify(data) : data);
}

module.exports = { getTempDir, writeFile, readStdinJson, log, output };
