const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

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

// Cache-busting: replace each asset's ?v=... with a hash of its current contents, so a
// changed file always gets a new URL and browsers never mix stale and fresh scripts.
const contentHashes = {};
for (const file of runtimeFiles) {
  if (file === 'index.html') continue;
  const data = fs.readFileSync(path.join(outDir, file));
  contentHashes[file] = crypto.createHash('sha256').update(data).digest('hex').slice(0, 10);
}
const indexPath = path.join(outDir, 'index.html');
let indexHtml = fs.readFileSync(indexPath, 'utf8');
for (const [file, hash] of Object.entries(contentHashes)) {
  const escaped = file.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`((?:src|href)=")${escaped}(?:\\?v=[^"]*)?(")`, 'g');
  const before = indexHtml;
  indexHtml = indexHtml.replace(pattern, `$1${file}?v=${hash}$2`);
  if (before === indexHtml) {
    throw new Error(`build-web-release: index.html does not reference ${file}`);
  }
}
fs.writeFileSync(indexPath, indexHtml, 'utf8');

const stamp = new Date().toISOString();
fs.writeFileSync(
  path.join(outDir, 'release.json'),
  `${JSON.stringify({ name: 'dawn-cube-escape', builtAt: stamp, files: runtimeFiles, contentHashes }, null, 2)}\n`,
  'utf8',
);

console.log(`Built Dawn Cube web release at ${path.relative(rootDir, outDir)}`);
