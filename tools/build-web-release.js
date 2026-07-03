const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const outDir = path.join(rootDir, 'dist', 'web');

const runtimeFiles = [
  'index.html',
  'style.css',
  'locales.js',
  'audio.js',
  'levels.js',
  'game.js',
  'render.js',
  'dialogue.js',
  'story.js',
  'main.js',
];

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

for (const file of runtimeFiles) {
  fs.copyFileSync(path.join(rootDir, file), path.join(outDir, file));
}

const stamp = new Date().toISOString();
fs.writeFileSync(
  path.join(outDir, 'release.json'),
  `${JSON.stringify({ name: 'dawn-cube-escape', builtAt: stamp, files: runtimeFiles }, null, 2)}\n`,
  'utf8',
);

console.log(`Built Dawn Cube web release at ${path.relative(rootDir, outDir)}`);
