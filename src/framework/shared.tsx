/**
 * The directory containing all page and layout files for file-based routing.
 */
export const PAGES_DIR = "src/pages"

/**
 * The file extension/postfix for React Server Component (RSC) payloads.
 */
export const RSC_POSTFIX = "_.rsc"

/**
 * The payload type for React Server Components (RSC) streaming.
 * Contains the root React node to be rendered.
 */
export interface RscPayload {
  root: React.ReactNode
}
