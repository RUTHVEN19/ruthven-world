// Summarise artistWorks.json by contract so we can curate: real 1/1s vs
// collections vs spam airdrops. Prints count, collection name, year range,
// and a few sample titles per contract.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const works = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../frontend/src/config/artistWorks.json'), 'utf8'));

const byContract = {};
for (const w of works) {
  const k = w.contract;
  (byContract[k] ||= { count: 0, collection: w.collection, years: new Set(), titles: [] });
  const g = byContract[k];
  g.count++;
  if (w.year) g.years.add(w.year);
  if (g.titles.length < 4 && w.title) g.titles.push(w.title);
  if (!g.collection && w.collection) g.collection = w.collection;
}

const rows = Object.entries(byContract).sort((a, b) => b[1].count - a[1].count);
for (const [addr, g] of rows) {
  const yrs = [...g.years].sort();
  const range = yrs.length ? `${yrs[0]}–${yrs[yrs.length - 1]}` : '----';
  console.log(`${String(g.count).padStart(5)}  ${range}  ${(g.collection || '(no collection name)').slice(0, 40).padEnd(40)}  ${addr}`);
  console.log(`        e.g. ${g.titles.join('  |  ')}`);
}
console.log(`\n${works.length} works across ${rows.length} contracts`);
