import { BlogPostDirectory } from "@/collections"

export function getStaticPath() {
  return ["/"]
}

export default async function BlogIndex() {
  const posts = await BlogPostDirectory.getEntries()

  return (
    <div>
      <h3>Renoun blog overview</h3>
    </div>
  )
}
