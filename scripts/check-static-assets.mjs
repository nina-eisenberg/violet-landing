import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

// Vercel currently serves the repository root. Validate that layout as well as
// the Vite build: public/ assets are not automatically mounted in static mode.
const root = process.cwd();
let pages = 0;
async function visit(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || ['node_modules', 'dist', 'public', 'scripts'].includes(entry.name)) continue;
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) await visit(file);
    else if (entry.name.endsWith('.html')) {
      const html = (await readFile(file, 'utf8')).replace(/<!--[\s\S]*?-->/g, '');
      for (const [tag] of html.matchAll(/<(?:link|script)\b[^>]*>/gi)) {
        if (/^<link/i.test(tag) && !/rel=["']stylesheet["']/i.test(tag)) continue;
        const url = tag.match(/(?:href|src)=["']([^"']+)["']/i)?.[1];
        if (!url || /^(?:[a-z]+:|\/\/)/i.test(url)) continue;
        const asset = url.split(/[?#]/)[0];
        const target = asset.startsWith('/') ? path.join(root, asset) : path.resolve(directory, asset);
        try { await access(target); }
        catch { throw new Error(`${path.relative(root, file)} references missing static asset ${url}`); }
      }
      pages++;
    }
  }
}
await visit(root);
console.log(`Verified root-hosted stylesheet and script paths on ${pages} pages.`);
