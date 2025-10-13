import * as React from "react";

/**
 * Splits a URL pathname into its segments.
 *
 * @param path - The URL pathname (e.g. '/blog/hello')
 * @returns Array of path segments (e.g. ['blog', 'hello'])
 */
/**
 * Splits a URL pathname into its segments, ignoring group folders (e.g. (home), (foo)).
 *
 * @param path - The URL pathname (e.g. '/(home)/blog/hello')
 * @returns Array of path segments (e.g. ['blog', 'hello'])
 */
function splitPath(path: string): string[] {
  if (!path || path === "/") return [];
  return path
    .replace(/^\/+|\/+$/g, "")
    .split("/")
    .filter(Boolean)
    .filter((seg) => !/^\(.+\)$/.test(seg)); // ignore group folders
}

/**
 * Eagerly imports all page and layout modules from the pages directory for routing.
 * The keys are relative paths (e.g. '../pages/blog/page.tsx').
 */
const pageModules = import.meta.glob("../pages/**/*.tsx", { eager: true });

/**
 * Collects all layouts for a given pathname, from root to leaf.
 * This enables nested layouts similar to Next.js.
 *
 * @param pathname - The URL pathname (e.g. '/blog/hello')
 * @returns Array of imported layout modules (from root to leaf)
 */
function collectLayouts(pathname: string) {
  const layouts: any[] = [];
  let current = "../pages";
  // Root layout
  if (pageModules[`${current}/layout.tsx`]) {
    layouts.push(pageModules[`${current}/layout.tsx`]);
  }
  // Nested layouts (skip group folders)
  let rawSegments = pathname.replace(/^\/+|\/+$/g, "").split("/").filter(Boolean);
  for (let i = 0; i < rawSegments.length; i++) {
    if (/^\(.+\)$/.test(rawSegments[i])) continue; // skip group
    current += `/${rawSegments[i]}`;
    if (pageModules[`${current}/layout.tsx`]) {
      layouts.push(pageModules[`${current}/layout.tsx`]);
    }
  }
  return layouts;
}

/**
 * Main router component: resolves the correct page and applies all nested layouts.
 * Supports static, dynamic ([slug]), and catch-all ([...slug]) routes.
 *
 * @param url - The current URL object
 * @returns The React element tree for the matched route (with layouts)
 */
export function AppRouter({ url }: { url: URL }) {
  const pathname = url.pathname;
  const segments = splitPath(pathname);
  let matchedModule: any = null;
  let matchedType: "static" | "dynamic" | "catchall" | null = null;
  let matchedParam: string | null = null;
  let matchedCatchAll: string[] | null = null;

  // 1. Exact static match
  let current = "../pages";
  if (segments.length === 0 && pageModules["../pages/page.tsx"]) {
    matchedModule = pageModules["../pages/page.tsx"];
    matchedType = "static";
  }
  for (let i = 0; i < segments.length; i++) {
    current += `/${segments[i]}`;
  }
  if (!matchedModule && pageModules[`${current}/page.tsx`]) {
    matchedModule = pageModules[`${current}/page.tsx`];
    matchedType = "static";
  }

  // 2. Dynamic route ([slug]) match
  if (!matchedModule && segments.length > 0) {
    const dynSegments = [...segments];
    dynSegments[dynSegments.length - 1] = "[slug]";
    const dynPath =
      "../pages" + dynSegments.map((s) => `/${s}`).join("") + "/page.tsx";
    
    if (pageModules[dynPath]) {
      matchedModule = pageModules[dynPath];
      matchedType = "dynamic";
      matchedParam = segments[segments.length - 1];
    }
  }

  // 3. Catch-all ([...slug]) match
  if (!matchedModule && segments.length > 0) {
    for (let i = segments.length; i > 0; i--) {
      const catchAllPath =
        "../pages" +
        segments
          .slice(0, i - 1)
          .map((s) => `/${s}`)
          .join("") +
        "/[...slug]/page.tsx";
      
      if (pageModules[catchAllPath]) {
        matchedModule = pageModules[catchAllPath];
        matchedType = "catchall";
        matchedCatchAll = segments.slice(i - 1);
        break;
      }
    }
  }

  // 4. Fallback: parent static page (for index fallback)
  if (!matchedModule && segments.length > 0) {
    let parent = "../pages";
    for (let i = 0; i < segments.length - 1; i++) {
      parent += `/${segments[i]}`;
    }
    
    if (pageModules[`${parent}/page.tsx`]) {
      matchedModule = pageModules[`${parent}/page.tsx`];
      matchedType = "static";
    }
  }

  // 5. 404 catch-all
  if (!matchedModule && pageModules["../pages/[...404].tsx"]) {
    
    matchedModule = pageModules["../pages/[...404].tsx"];
    matchedType = null;
  }

  // Compose layouts and page
  const layouts = collectLayouts(pathname);
  let element = null;
  if (
    matchedModule &&
    typeof matchedModule === "object" &&
    matchedModule !== null &&
    "default" in matchedModule &&
    typeof (matchedModule as any).default === "function"
  ) {
    const Page = (matchedModule as { default: React.ComponentType<any> })
      .default;
    if (matchedType === "dynamic") {
      element = <Page params={{ slug: matchedParam }} />;
    } else if (matchedType === "catchall") {
      element = <Page params={{ slug: matchedCatchAll }} />;
    } else {
      element = <Page />;
    }
  } else {
    element = <p>Not found</p>;
  }
  for (let i = layouts.length - 1; i >= 0; i--) {
    const Layout = layouts[i].default;
    element = <Layout>{element}</Layout>;
  }
  return element;
}
