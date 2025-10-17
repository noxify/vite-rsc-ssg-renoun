import * as React from "react"

import { filePathToRoutePattern } from "./utils"

/**
 * RouteEntry describes a single route, its pattern, page module, and layouts.
 */
type RouteEntry = {
  /** Path to the page file (e.g. './blog/page.tsx') */
  pagePath: string
  /** Route pattern (e.g. '/blog', '/blog/[slug]') */
  route: string
  /** Imported page module (React component) */
  module: unknown
  /** Array of imported layout modules (React components) from root to leaf */
  layouts: unknown[]
}

/**
 * Eagerly imports all page and layout modules from the pages directory for routing.
 * The keys are relative paths (e.g. './blog/page.tsx').
 *
 * pageModules: All page components (default export)
 * layoutModules: All layout components (default export)
 */
const pageModules = import.meta.glob("/**/page.tsx", {
  eager: true,
  base: "/src/pages/",
  import: "default",
})

const layoutModules = import.meta.glob("/**/layout.tsx", {
  eager: true,
  base: "/src/pages/",
  import: "default",
})

/**
 * Extracts route parameters from a route pattern and a pathname.
 * Supports dynamic ([slug]) and catch-all ([...slug]) segments.
 *
 * @param route - The route pattern (e.g. '/blog/[slug]', '/catchall/[...slug]')
 * @param pathname - The actual URL pathname (e.g. '/blog/foo', '/catchall/a/b/c')
 * @returns An object mapping param names to values (string for [slug], array for [...slug])
 */
function extractParams(
  route: string,
  pathname: string,
): Record<string, string | string[]> {
  const routeParts = route.split("/").filter(Boolean)
  const pathParts = pathname.split("/").filter(Boolean)
  const params: Record<string, string | string[]> = {}
  routeParts.forEach((part: string, i: number) => {
    if (part.startsWith("[...") && part.endsWith("]")) {
      const key = part.slice(4, -1)
      const arr = pathParts.slice(i)
      params[key] = arr.length === 1 ? [arr[0]] : arr
    } else if (part.startsWith("[") && part.endsWith("]")) {
      const key = part.slice(1, -1)
      params[key] = pathParts[i]
    }
  })
  return params
}

/**
 * Collects all layouts for a given route pattern, from root to leaf.
 * Enables nested layouts similar to Next.js.
 *
 * @param pathname - The route pattern (e.g. '/blog/hello')
 * @returns Array of imported layout modules (from root to leaf)
 */
function collectLayouts(pathname: string) {
  const layouts: any[] = []
  let currentLayoutDir = "./"
  // Root layout
  if (layoutModules[`${currentLayoutDir}layout.tsx`]) {
    layouts.push(layoutModules[`${currentLayoutDir}layout.tsx`])
  }
  // Nested layouts (skip group folders)
  let rawSegments = pathname
    .replace(/^\/+|\/+$/g, "")
    .split("/")
    .filter(Boolean)
  for (let i = 0; i < rawSegments.length; i++) {
    if (/^\(.+\)$/.test(rawSegments[i])) continue // skip group
    currentLayoutDir =
      currentLayoutDir === "./"
        ? `./${rawSegments[i]}/`
        : `${currentLayoutDir}${rawSegments[i]}/`
    const key = currentLayoutDir + "layout.tsx"
    if (layoutModules[key]) {
      layouts.push(layoutModules[key])
    }
  }
  return layouts
}

/**
 * Main router component: resolves the correct page and applies all nested layouts.
 * Supports static, dynamic ([slug]), and catch-all ([...slug]) routes.
 *
 * @param url - The current URL object
 * @returns The React element tree for the matched route (with layouts)
 */
export function AppRouter({ url }: { url: URL }) {
  // Normalize pathname: remove trailing slash except for root
  let pathname = url.pathname
  if (pathname.length > 1 && pathname.endsWith("/")) {
    pathname = pathname.slice(0, -1)
  }

  /**
   * PageComponent expects optional params prop for dynamic/catch-all routes.
   */
  type PageComponent = React.ComponentType<{
    params?: Record<string, string | string[]>
  }>
  /**
   * LayoutComponent expects children prop for nested rendering.
   */
  type LayoutComponent = React.ComponentType<{ children: React.ReactNode }>

  /**
   * transformed: Array of all routes with their page and layouts.
   */
  const transformed: RouteEntry[] = Object.entries(pageModules).map(
    ([pagePath, pageContent]) => {
      const route = filePathToRoutePattern(pagePath, "./")
      return {
        pagePath,
        route,
        module: pageContent,
        layouts: collectLayouts(route),
      }
    },
  )

  /**
   * Finds the matching route entry for the current pathname.
   * First tries exact match, then dynamic/catch-all pattern match.
   */
  let match = transformed.find((t) => {
    let route = t.route
    if (route.length > 1 && route.endsWith("/")) {
      route = route.slice(0, -1)
    }
    return route === pathname
  })
  if (!match) {
    // Try dynamic and catch-all route patterns
    match = transformed.find((t) => {
      let route = t.route
      if (route.length > 1 && route.endsWith("/")) {
        route = route.slice(0, -1)
      }
      const pattern =
        "^" +
        route
          .replace(/\[\.\.\.(\w+)\]/g, "(.+)")
          .replace(/\[(\w+)\]/g, "([^/]+)") +
        "$"
      return new RegExp(pattern).test(pathname)
    })
  }
  /**
   * If a match is found, extract params, render the page and wrap with layouts.
   * Otherwise, render a simple Not Found message.
   */
  if (match) {
    const params = extractParams(match.route, pathname)
    const Page = match.module as PageComponent
    let element = Object.keys(params).length ? (
      <Page params={params} />
    ) : (
      <Page />
    )
    for (let i = match.layouts.length - 1; i >= 0; i--) {
      const Layout = match.layouts[i] as LayoutComponent
      element = <Layout>{element}</Layout>
    }
    return element
  }
  return <p>Not found</p>
}
