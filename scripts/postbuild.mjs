import { copyFileSync, existsSync } from 'node:fs';

const indexHtml = 'dist/vibramusic/browser/index.html';
const spaFallback = 'dist/vibramusic/browser/404.html';

if (!existsSync(indexHtml)) {
  console.error('postbuild: no se encontró ' + indexHtml + '. ¿Se compiló el bundle?');
  process.exitCode = 1;
} else {
  copyFileSync(indexHtml, spaFallback);
  console.log('postbuild: generado ' + spaFallback + ' para el fallback SPA.');
}
