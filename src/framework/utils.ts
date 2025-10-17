// import {glob} from "tinyglobby";
// import path from "node:path";
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
  // Remove leading './', '/', or '.' after basePath removal
  path = path.replace(/^\.?\//, "");

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
