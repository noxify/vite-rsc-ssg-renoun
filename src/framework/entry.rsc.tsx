import { renderToReadableStream } from '@vitejs/plugin-rsc/rsc'
import { AppRouter } from './router'
import { RSC_POSTFIX, type RscPayload } from './shared'

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
				'content-type': 'text/x-component;charset=utf-8',
				vary: 'accept',
			},
		})
	}

	// SSR HTML rendering
	const ssr = await import.meta.viteRsc.loadModule<typeof import('./entry.ssr')>('ssr', 'index')
	const htmlStream = await ssr.renderHtml(rscStream)

	return new Response(htmlStream, {
		headers: {
			'content-type': 'text/html;charset=utf-8',
			vary: 'accept',
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

	const ssr = await import.meta.viteRsc.loadModule<typeof import('./entry.ssr')>('ssr', 'index')
	const htmlStream = await ssr.renderHtml(rscStream1, {
		ssg: true,
	})

	return { html: htmlStream, rsc: rscStream2 }
}

// Enable hot module replacement for development
if (import.meta.hot) {
	import.meta.hot.accept()
}
