import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';
import { readFileSync, readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const rootDir = fileURLToPath(new URL('.', import.meta.url));
const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8'));
const buildCommit = (process.env.VERCEL_GIT_COMMIT_SHA || '').slice(0, 7);
const buildTime = new Date().toISOString();

/** Wszystkie pliki z `public/` jako ścieżki URL (bez `sw.js`). */
function publicFileUrls() {
  const urls = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else {
        urls.push(`/${relative(rootDir, full).split(sep).join('/').replace(/^public\//, '')}`);
      }
    }
  };
  walk(join(rootDir, 'public'));
  return urls.filter((url) => url !== '/sw.js');
}

/**
 * Generuje `sw.js` z listą wszystkich plików builda, żeby każdy ekran
 * (także leniwie ładowane chunki) działał offline po pierwszej wizycie.
 */
function pwaServiceWorker() {
  return {
    name: 'quiz-pwa-service-worker',
    apply: 'build',
    generateBundle(_options, bundle) {
      const urls = new Set(['/', '/index.html']);
      for (const fileName of Object.keys(bundle)) {
        if (/\.(js|css|html|png|svg|ico|webp|woff2?)$/i.test(fileName)) {
          urls.add(`/${fileName}`);
        }
      }
      for (const url of publicFileUrls()) urls.add(url);

      const version = buildCommit || buildTime;
      const source = readFileSync(join(rootDir, 'pwa', 'sw.template.js'), 'utf-8')
        .replace('__CACHE_VERSION__', version)
        .replace('__PRECACHE_URLS__', JSON.stringify(Array.from(urls).sort()));

      this.emitFile({ type: 'asset', fileName: 'sw.js', source });
    },
  };
}

export default defineConfig({
  plugins: [vue(), tailwindcss(), pwaServiceWorker()],
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __APP_COMMIT__: JSON.stringify(buildCommit),
    __APP_BUILD_TIME__: JSON.stringify(buildTime),
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 8080,
    strictPort: true,
  },
  preview: {
    port: 4173,
    strictPort: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1200,
  },
});
