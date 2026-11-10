import { build } from 'esbuild';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync, writeFileSync } from 'fs';
import { deflateSync } from 'zlib';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
  }
  return (c ^ 0xffffffff) >>> 0;
}

function pngChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const t = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
  return Buffer.concat([len, t, data, crc]);
}

function generateCherryPickIconPng(size) {
  const raw = Buffer.alloc(size * (size * 4 + 1));
  const radius = size * 0.24;
  for (let y = 0; y < size; y++) {
    const rowStart = y * (size * 4 + 1);
    raw[rowStart] = 0; // filter type 0
    for (let x = 0; x < size; x++) {
      const px = rowStart + 1 + x * 4;
      // Rounded rect SDF
      const dx = Math.max(radius - x, 0, x - (size - 1 - radius));
      const dy = Math.max(radius - y, 0, y - (size - 1 - radius));
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > radius + 0.5) {
        raw[px] = 0;
        raw[px + 1] = 0;
        raw[px + 2] = 0;
        raw[px + 3] = 0;
        continue;
      }
      // 225deg gradient from #EB1616 (top-right) to #1E14EA (bottom-left)
      const t = Math.max(0, Math.min(1, ((size - 1 - x) + y) / (2 * (size - 1))));
      raw[px] = Math.round(235 * (1 - t) + 30 * t);
      raw[px + 1] = Math.round(22 * (1 - t) + 20 * t);
      raw[px + 2] = Math.round(22 * (1 - t) + 234 * t);
      raw[px + 3] = 255;
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([
    sig,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', deflateSync(raw)),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
}

async function buildExtensionScripts() {
  for (const dir of [resolve(rootDir, 'public/icons'), resolve(rootDir, 'dist/icons')]) {
    mkdirSync(dir, { recursive: true });
    for (const s of [16, 48, 128]) {
      writeFileSync(resolve(dir, `icon${s}.png`), generateCherryPickIconPng(s));
    }
  }
  // Bundle Content Script (self-contained IIFE for Chrome content_scripts)
  await build({
    entryPoints: [resolve(rootDir, 'src/content/contentScript.tsx')],
    bundle: true,
    minify: true,
    sourcemap: 'inline',
    format: 'iife',
    target: ['chrome110'],
    outfile: resolve(rootDir, 'dist/contentScript.js'),
    define: {
      'process.env.NODE_ENV': '"production"',
    },
  });

  // Bundle Background Service Worker (ESM for Manifest V3)
  await build({
    entryPoints: [resolve(rootDir, 'src/background/background.ts')],
    bundle: true,
    minify: true,
    sourcemap: 'inline',
    format: 'esm',
    target: ['chrome110'],
    outfile: resolve(rootDir, 'dist/background.js'),
    define: {
      'process.env.NODE_ENV': '"production"',
    },
  });

  console.log('✓ Built dist/contentScript.js and dist/background.js');
}

buildExtensionScripts().catch((err) => {
  console.error(err);
  process.exit(1);
});

