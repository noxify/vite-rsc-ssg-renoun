import { BlogPostDirectory } from "@/collections"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { createSlug } from "renoun"

export async function getStaticPath() {
  const posts = await BlogPostDirectory.getEntries()
  const staticPaths = posts
    .map((post) => post.getPathnameSegments({ includeBasePathname: false }))
    .flat()
  return staticPaths.map((slug) => ({ slug }))
}

const getData = async (slug: string) => {
  const entry = await BlogPostDirectory.getFile(slug, "mdx")

  const frontmatter = await entry.getExportValue("frontmatter")

  const formatter = new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
    timeZone: "UTC",
  })
  const tags = (frontmatter.tags ?? []).map((tag) => ({
    label: tag,
    slug: createSlug(tag),
  }))
  const Content = await entry.getExportValue("default")

  return { frontmatter, formatter, tags, Content }
}

export default async function BlogPost({
  params,
}: {
  params: { slug: string }
}) {
  const { frontmatter, formatter, tags, Content } = await getData(params.slug)
  return (
    <div className="container mx-auto px-4 py-16">
      <Button asChild variant="ghost" className="mb-8">
        <a href="/blog/" className="flex items-center gap-2">
          <ArrowLeft size={16} />
          Back to articles
        </a>
      </Button>

      <article className="mx-auto max-w-3xl">
        <header className="mb-8">
          <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
            <span className="rounded-md bg-secondary px-2 py-1">
              {frontmatter.category}
            </span>
            <span>•</span>
            <time dateTime={frontmatter.date.toISOString().slice(0, 10)}>
              {formatter.format(frontmatter.date)}
            </time>
          </div>
          <h1 className="mb-4 text-4xl font-bold text-balance md:text-5xl">
            {frontmatter.title}
          </h1>
          {frontmatter.summary ? (
            <p className="text-xl italic">{frontmatter.summary}</p>
          ) : null}
        </header>

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <Content />
        </div>

        {tags.length ? (
          <div className="mt-4 border-t pt-4">
            <ul className="flex gap-2">
              {tags.map(({ label, slug }) => (
                <li key={label} className="post__tag">
                  <a href={`/tags/${slug}/`}>
                    <span className="rounded-md bg-secondary px-2 py-1 hover:bg-primary hover:text-primary-foreground">
                      {label}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </article>
    </div>
  )
}
