import React from "react"
import { createFromReadableStream } from "@vitejs/plugin-rsc/ssr"
import { renderToReadableStream } from "react-dom/server.edge"
import { prerender } from "react-dom/static.edge"
import { injectRSCPayload } from "rsc-html-stream/server"

import type { RscPayload } from "./shared"

/**
 * Server-side rendering (SSR) entrypoint for Vite RSC/SSR pipeline.
 * Handles rendering of HTML streams from RSC payloads for both SSG and SSR.
 *
 * @param rscStream - The readable stream containing the RSC payload
 * @param options - Optional options (e.g. ssg: true for static generation)
 * @returns A readable stream of HTML (with injected RSC payload)
 */
export async function renderHtml(
  rscStream: ReadableStream<Uint8Array>,
  options?: {
    ssg?: boolean
  },
): Promise<ReadableStream<Uint8Array>> {
  const [rscStream1, rscStream2] = rscStream.tee()

  let payload: Promise<RscPayload>
  function SsrRoot() {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    payload ??= createFromReadableStream<RscPayload>(rscStream1)
    const root = React.use(payload).root
    return root
  }
  const bootstrapScriptContent =
    await import.meta.viteRsc.loadBootstrapScriptContent("index")

  let htmlStream: ReadableStream<Uint8Array>
  if (options?.ssg) {
    const prerenderResult = await prerender(<SsrRoot />, {
      bootstrapScriptContent,
    })
    htmlStream = prerenderResult.prelude
  } else {
    htmlStream = await renderToReadableStream(<SsrRoot />, {
      bootstrapScriptContent,
    })
  }

  let responseStream: ReadableStream<Uint8Array> = htmlStream
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  responseStream = responseStream.pipeThrough(injectRSCPayload(rscStream2))
  return responseStream
}
