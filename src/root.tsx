import { AppRouter } from "@/framework/router"

export function Root({ url }: { url: URL }) {
  return <AppRouter url={url} />
}
