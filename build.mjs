// Builds three files from app.fragment.html:
//   podcast-notes.html          the app with the house fonts embedded (the file the phone runs)
//   podcast-notes-artifact.html the same, carrying a copy of itself so the viewer can hand the file over
//   podcast-notes-email.html    the app with fonts from Google instead of embedded (small enough to email)
import { readFile, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';

const bake = 'C:/Users/matt/.claude/skills/reader-first-pages/bake.mjs';
execFileSync('node', [bake, 'app.fragment.html', 'podcast-notes.html'], { stdio: 'inherit' });

const plain = await readFile('podcast-notes.html', 'utf8');
const b64 = Buffer.from(plain, 'utf8').toString('base64');
await writeFile('podcast-notes-artifact.html', plain.replace('__APPSRC__', b64), 'utf8');

let f = await readFile('C:/Users/matt/.claude/skills/reader-first-pages/foundation.css', 'utf8');
f = f.replace(/@font-face\s*\{[^}]*\}/g, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\n\s*\n/g, '\n').trim();
let p = await readFile('app.fragment.html', 'utf8');
const link = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700;800&family=Source+Serif+4:ital,wght@0,400;0,600;1,400&display=swap">\n';
p = p.replace(/<style([^>]*)>/, (m, a) => link + '<style' + a + '>\n' + f + '\n');
p = '<!doctype html>\n<html lang="en">\n<meta charset="utf-8">\n' + p + '\n</html>\n';
await writeFile('podcast-notes-email.html', p, 'utf8');

console.log('plain', plain.length, 'artifact', plain.length + b64.length, 'email', p.length);
