import esbuild from 'esbuild';
import { polyfillNode } from 'esbuild-plugin-polyfill-node';

await esbuild.build({
  entryPoints: ['src/app.js'],
  bundle: true,
  format: 'iife',
  outfile: 'bundle.js',
  platform: 'browser',
  target: 'es2020',
  define: {
    global: 'globalThis',
    'process.env.NODE_ENV': '"production"',
  },
  plugins: [
    polyfillNode({
      globals: { buffer: true, process: true },
    }),
  ],
  legalComments: 'none',
  logLevel: 'info',
});

await esbuild.build({
  entryPoints: ['src/airdrop.js'],
  bundle: true,
  format: 'iife',
  outfile: 'airdrop-bundle.js',
  platform: 'browser',
  target: 'es2020',
  define: { global: 'globalThis', 'process.env.NODE_ENV': '"production"' },
  plugins: [polyfillNode({ globals: { buffer: true, process: true } })],
  legalComments: 'none',
  logLevel: 'info',
});

console.log('Built bundle.js + airdrop-bundle.js');
