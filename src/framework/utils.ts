import { glob } from "tinyglobby";
import path from "node:path";
import { PAGES_DIR } from "./shared";

/**
 * Converts a Next.js-style file path to a route pattern.
 * Supports dynamic (`[slug]`) and catch-all (`[...slug]`) segments and grouping (`(group)`).
 *
 * @param filePath e.g. "src/pages/(home)/page.tsx", "src/pages/blog/[slug]/page.tsx"
 * @param basePath The base folder/directory (default: 'src/pages')
 * @returns e.g. "/", "/blog/[slug]"
 */
export function filePathToRoutePattern(
  filePath: string,
  basePath = PAGES_DIR
): string {
  // Remove basePath from the start
  const basePattern = new RegExp(
    `^${basePath.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}/`
  );
  let path = filePath.replace(basePattern, "");

  // Remove group folders like (home) as path segments
  path = path.replace(/\([^)]+\)\//g, "");
  path = path.replace(/^\([^)]+\)$/, ""); // if the only segment is a group, remove it

  // Remove '/page.{js,ts,jsx,tsx}' at the end
  path = path.replace(/^(page\.(js|ts|jsx|tsx))$/, "");
  path = path.replace(/\/page\.(js|ts|jsx|tsx)$/, "");

  // Empty path becomes "/"
  let pattern = path === "" ? "/" : `/${path}`;
  return pattern;
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
export async function collectStaticPaths(
  pagesDir: string = PAGES_DIR
): Promise<string[]> {
  const pageFiles = await glob(`${pagesDir}/**/page.tsx`);
  const staticPaths: string[] = [];

  for (const file of pageFiles) {
    // Dynamic route?
    const match = file.match(/\[(\.\.\.)?(\w+)\]/);
    if (match) {
      // Try to import getStaticParams as named export from page.tsx
      let paramsList: any[] = [];
      let found = false;

      try {
        const getStaticParamsPath = path.join(
          path.dirname(file),
          "getStaticParams.ts"
        );
        const mod = await import(path.resolve(getStaticParamsPath));
        if (typeof mod.default === "function") {
          paramsList = await mod.default();
          found = true;
        }
      } catch {}

      if (!found) {
        throw new Error(
          `No getStaticParams.ts found or invalid export for dynamic route: ${file}\n` +
          `→ Please provide a valid getStaticParams.ts exporting a default async function.`
        );
      }
      for (const params of paramsList) {
        // Generate the URL by directly replacing [...key] and [key]
        let url = file;
        for (const key of Object.keys(params)) {
          const value = params[key];
          // replace [key] with final value ( e.g. /catchall/[...slug] => /catchall/one/two/three )
          url = url.replace(
            `[...${key}]`,
            Array.isArray(value) ? value.join("/") : value
          );
          // replace [key] with final value ( e.g. /blog/[slug] => /blog/blog-post )
          url = url.replace(`[${key}]`, value);
        }
        // Normalize to route pattern
        const normalized = filePathToRoutePattern(url, pagesDir);
        staticPaths.push(normalized);
      }
    } else {
      // Static route
      let pattern = filePathToRoutePattern(file, pagesDir);
      staticPaths.push(pattern);
    }
  }
  return Array.from(new Set(staticPaths));
}
