import { renderToReadableStream } from "@vitejs/plugin-rsc/rsc"

import type { RscPayload } from "./shared"
import { AppRouter } from "./router"
import { RSC_POSTFIX } from "./shared"
import { filePathToRoutePattern } from "./utils"

type MaybeAsync<T> = T | Promise<T>

export async function getStaticRoutes() {
  const staticPathModules = import.meta.glob("/**/page.tsx", {
    eager: true,
    base: "/src/pages/",
    import: "getStaticPath",
  }) as Record<string, MaybeAsync<() => string[]>>

  const transformed = await Promise.all(
    Object.entries(staticPathModules).map(async ([pagePath, staticPaths]) => {
      const route = filePathToRoutePattern(pagePath, "./")
      let staticPathsFn: (() => string[]) | undefined
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

  for (const entry of transformed) {
    const { route, staticPaths } = entry
    for (const p of staticPaths) {
      let finalPath = ""
      if (Array.isArray(p)) {
        // Catch-all: Array of segments
        if (p.length === 0) {
          // Empty array means index route
          finalPath = route === "/" ? "/" : route.replace(/\/$/, "")
        } else {
          finalPath = [route.replace(/\[\.\.\..*?\]/, ""), ...p]
            .join("/")
            .replace(/\/+/g, "/")
            .replace(/\/$/, "")
        }
      } else if (p === "/" || p === "") {
        // Root or index
        finalPath = route === "/" ? "/" : route.replace(/\/$/, "")
      } else {
        // Static or dynamic route
        finalPath = [route.replace(/\[.*?\]/g, ""), p]
          .join("/")
          .replace(/\/+/g, "/")
          .replace(/\/$/, "")
      }
      // Ensure trailing slash except for root
      if (finalPath !== "/" && !finalPath.endsWith("/")) {
        finalPath += "/"
      }
      routes.add(finalPath)
    }
  }

  return Array.from(routes)
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
