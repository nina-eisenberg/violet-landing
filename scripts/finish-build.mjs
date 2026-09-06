import { access, copyFile, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

// Keep the existing static routes and assets alongside Vite's bundled homepage.
const root = process.cwd();
const output = path.join(root, 'dist');
const excluded = new Set(['dist', 'node_modules', 'public', 'scripts']);
async function preserve(directory = root) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || excluded.has(entry.name)) continue;
    const source = path.join(directory, entry.name);
    const relative = path.relative(root, source);
    if (entry.isDirectory()) await preserve(source);
    else if (relative !== 'index.html' && /\.(html|png|jpe?g|gif|svg|webp|ico|txt|xml|pdf|woff2?)$/i.test(entry.name)) {
      const target = path.join(output, relative);
      await mkdir(path.dirname(target), { recursive: true });
      await copyFile(source, target);
    }
  }
}
await preserve();
const home = await readFile(path.join(output, 'index.html'), 'utf8');
const stylesheet = home.match(/href="(\/assets\/[^"\s]+\.css)"/)?.[1];
if (!stylesheet) throw new Error('Built shared stylesheet was not found');
let pages = 0;
async function verify(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) await verify(file);
    else if (entry.name.endsWith('.html')) {
      const html = (await readFile(file, 'utf8')).replaceAll('href="/style.css"', `href="${stylesheet}"`);
      await writeFile(file, html);
      for (const tag of html.matchAll(/<link\b[^>]*>/gi)) {
        if (!/rel=["']stylesheet["']/i.test(tag[0])) continue;
        const href = tag[0].match(/href=["']([^"']+)["']/i)?.[1];
        if (!href || /^(https?:)?\/\//.test(href)) continue;
        const asset = href.split(/[?#]/)[0];
        await access(asset.startsWith('/') ? path.join(output, asset) : path.resolve(path.dirname(file), asset));
      }
      pages++;
    }
  }
}
await verify(output);
console.log(`Verified local stylesheets on all ${pages} production HTML pages; preserved existing static routes and assets.`);
