
import type { Plugin } from 'vite';
import fg from 'fast-glob';
import path from 'node:path';
import { PAGES_DIR } from './shared';

/**
 * Vite Plugin: File-based Routing with Nested Layouts and SSG Path Collector
 *
 * Features:
 * - File-based Routing (Next.js-style: page.tsx, layout.tsx, [slug], [...slug])
 * - SSG Path Collector (getStaticParams)
 *
 * Usage:
 *   import fileRouter from './plugins/vite-file-router';
 *   plugins: [fileRouter({ pagesDir: 'src/pages' })]
 *
 * @param options.pagesDir - The directory containing the pages (default: 'src/pages')
 * @returns Vite plugin instance
 */
export default function fileRouter({ pagesDir = 'src/pages' }: { pagesDir: string }): Plugin {
  return {
    name: 'vite-file-router',
    async buildStart() {
      // Example: Collect all static paths for SSG
      const staticPaths = await collectStaticPaths(pagesDir);
      this.info(`[vite-file-router] SSG Paths: ${staticPaths.join(', ')}`);
    },
    // Additional hooks (e.g. for dev server, SSR, etc.) can be added here
  };
}

/**
 * Collects all static paths for SSG by scanning the pages directory for page.tsx files.
 * Handles both static and dynamic routes (including catch-all routes).
 *
 * For dynamic routes, it tries to import and call getStaticParams.ts to enumerate all possible params.
 *
 * @param pagesDir - The directory containing the pages (default: PAGES_DIR)
 * @returns Promise<string[]> - Array of all static paths (e.g. ['/blog/hello', '/about'])
 */

export async function collectStaticPaths(pagesDir: string = PAGES_DIR): Promise<string[]> {
  const pageFiles = await fg(`${pagesDir}/**/page.tsx`);
  const staticPaths: string[] = [];

  for (const file of pageFiles) {
    const dir = path.dirname(file);
    // Dynamic route?
    const match = dir.match(/\[(\.\.\.)?(\w+)\]$/);
    if (match) {
      // Try to import getStaticParams as named export from page.tsx
      let paramsList: any[] = [];
      let found = false;
      try {
        const pageMod = await import(path.resolve(file));
        if (typeof pageMod.getStaticParams === 'function') {
          paramsList = await pageMod.getStaticParams();
          found = true;
        }
      } catch {}
      // Fallback: Try to import getStaticParams.ts (legacy)
      if (!found) {
        try {
          const getStaticParamsPath = path.join(dir, 'getStaticParams.ts');
          const mod = await import(path.resolve(getStaticParamsPath));
          if (typeof mod.default === 'function') {
            paramsList = await mod.default();
            found = true;
          }
        } catch {}
      }
      if (!found) continue;
      for (const params of paramsList) {
        let url = dir
          .replace(pagesDir, '')
          .replace(/\[(\.\.\.)?(\w+)\]$/, (_m, dots, param) => {
            if (dots) {
              // Catch-all
              return '/' + (params[param] as string[]).join('/');
            } else {
              return '/' + params[param];
            }
          });
        if (!url.startsWith('/')) url = '/' + url;
        staticPaths.push(url);
      }
    } else {
      // Static route
      let url = dir.replace(pagesDir, '');
      if (!url) url = '/';
      staticPaths.push(url);
    }
  }
  return Array.from(new Set(staticPaths));
}
