import { renderToReadableStream } from "@vitejs/plugin-rsc/rsc"

import type { RscPayload } from "./shared"
import { AppRouter } from "./router"
import { RSC_POSTFIX } from "./shared"
import { filePathToRoutePattern, fillDynamicRoute } from "./utils"

type MaybeAsync<T> = T | Promise<T>

/**
 * Generates static routes by processing dynamic route patterns and their corresponding static paths.
 *
 * This function scans for page.tsx files that export a `getStaticPath` function, extracts their
 * route patterns, and generates concrete static routes by filling dynamic segments with actual values.
 *
 * @returns A promise that resolves to an object containing:
 *   - `generated`: Array of all generated static route paths with trailing slashes
 *   - `tree`: Object mapping route patterns to their generated paths (only for dynamic routes)
 *
 * @example
 * ```typescript
 * const result = await getStaticRoutes();
 * // result.generated: ["/", "/blog/", "/blog/post-1/", "/blog/post-2/"]
 * // result.tree: { "/blog/[slug]": ["/blog/post-1/", "/blog/post-2/"] }
 * ```
 *
 * @remarks
 * - Supports both regular dynamic segments `[param]` and catch-all segments `[...param]`
 * - Automatically adds trailing slashes to all routes except the root route "/"
 * - Handles both synchronous and asynchronous `getStaticPath` functions
 * - Falls back to using 'slug' as parameter name for legacy string-based static paths
 */
export async function getStaticRoutes() {
  const staticPathModules = import.meta.glob("/**/page.tsx", {
    eager: true,
    base: "/src/pages/",
    import: "getStaticPath",
  }) as Record<string, MaybeAsync<() => Array<Record<string, any>>>>

  const transformed = await Promise.all(
    Object.entries(staticPathModules).map(async ([pagePath, staticPaths]) => {
      const route = filePathToRoutePattern(pagePath, "./")
      let staticPathsFn: (() => Array<Record<string, any>>) | undefined
      if (typeof staticPaths === "function") {
        staticPathsFn = staticPaths
      } else if (staticPaths && typeof staticPaths.then === "function") {
        // staticPaths is a Promise
        const resolved = await staticPaths
        if (typeof resolved === "function") {
          staticPathsFn = resolved
        }
      }
      const paths = staticPathsFn ? await staticPathsFn() : []
      return {
        pagePath,
        route,
        staticPaths: paths,
      }
    }),
  )

  const routes = new Set<string>()
  const treeView: Record<string, string[]> = {}

  for (const entry of transformed) {
    const { route, staticPaths } = entry
    const generated: string[] = []
    for (const p of staticPaths) {
      let finalPath = ""
      if (typeof p === "object" && p !== null) {
        finalPath = fillDynamicRoute(route, p)
      } else if (p === "/" || p === "") {
        finalPath = route === "/" ? "/" : route.replace(/\/$/, "")
      } else {
        // fallback for legacy string param
        finalPath = fillDynamicRoute(route, { slug: p })
      }

      if (finalPath !== "/" && !finalPath.endsWith("/")) {
        finalPath += "/"
      }
      routes.add(finalPath)
      if (route.includes("[") && route.includes("]")) {
        generated.push(finalPath)
      }
    }
    treeView[route] = route.includes("[") ? generated : []
  }

  return {
    generated: Array.from(routes),
    tree: treeView,
  }
}

/**
 * Main RSC/SSR entrypoint for Vite RSC server.
 * Handles both RSC and HTML requests, dispatching to the correct renderer.
 *
 * @param request - The incoming HTTP request
 * @returns A Response containing either the RSC stream or the HTML stream
 */
export default async function handler(request: Request): Promise<Response> {
  let url = new URL(request.url)
  let isRscRequest = false
  if (url.pathname.endsWith(RSC_POSTFIX)) {
    isRscRequest = true
    url.pathname = url.pathname.slice(0, -RSC_POSTFIX.length)
  }

  const rscPayload: RscPayload = { root: <AppRouter url={url} /> }
  const rscStream = renderToReadableStream<RscPayload>(rscPayload)

  if (isRscRequest) {
    return new Response(rscStream, {
      headers: {
        "content-type": "text/x-component;charset=utf-8",
        vary: "accept",
      },
    })
  }

  // SSR HTML rendering
  const ssr = await import.meta.viteRsc.loadModule<
    typeof import("./entry.ssr")
  >("ssr", "index")
  const htmlStream = await ssr.renderHtml(rscStream)

  return new Response(htmlStream, {
    headers: {
      "content-type": "text/html;charset=utf-8",
      vary: "accept",
    },
  })
}

/**
 * Handles SSG (static site generation) requests for both HTML and RSC payloads.
 *
 * @param request - The incoming HTTP request
 * @returns An object containing both the HTML and RSC readable streams
 */
export async function handleSsg(request: Request): Promise<{
  html: ReadableStream<Uint8Array>
  rsc: ReadableStream<Uint8Array>
}> {
  const url = new URL(request.url)
  const rscPayload: RscPayload = { root: <AppRouter url={url} /> }
  const rscStream = renderToReadableStream<RscPayload>(rscPayload)
  const [rscStream1, rscStream2] = rscStream.tee()

  const ssr = await import.meta.viteRsc.loadModule<
    typeof import("./entry.ssr")
  >("ssr", "index")
  const htmlStream = await ssr.renderHtml(rscStream1, {
    ssg: true,
  })

  return { html: htmlStream, rsc: rscStream2 }
}

// Enable hot module replacement for development
if (import.meta.hot) {
  import.meta.hot.accept()
}
