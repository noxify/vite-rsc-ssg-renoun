import { BlogPostDirectory } from "@/collections"
import { BlogCard } from "@/components/blog-card"

export async function getStaticPath() {
  const staticPaths = await getTags()

  return staticPaths
}

const getTags = async () => {
  const postEntries = await BlogPostDirectory.getEntries()
  const tags = (
    await Promise.all(
      postEntries.map(async (entry) => {
        const frontmatter = await entry.getExportValue("frontmatter")
        return frontmatter.tags
      }),
    )
  )
    .filter(Boolean)
    .flat()

  return [...new Set(tags)]
}

const getData = async (slug: string) => {
  const postEntries = await BlogPostDirectory.getEntries()

  const formatter = new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
    timeZone: "UTC",
  })

  const posts = await Promise.all(
    postEntries.map(async (entry) => {
      const frontmatter = await entry.getExportValue("frontmatter")
      return {
        slug: entry.getPathnameSegments().slice(1).join("/"),
        title: frontmatter.title,
        excerpt: frontmatter.summary || "",
        date: formatter.format(frontmatter.date),
        category: frontmatter.category,
        raw: frontmatter,
      }
    }),
  )

  return posts.filter((post) => post.raw.tags?.includes(slug))
}

export default async function BlogPost({
  params,
}: {
  params: { slug: string }
}) {
  const posts = await getData(params.slug)
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mb-12 max-w-3xl">
        <h1 className="mb-4 text-4xl font-bold md:text-5xl">
          Articles with Tag: {params.slug}
        </h1>
        <p className="text-lg leading-relaxed text-muted-foreground">
          Articles that mention "{params.slug.toLowerCase()}".{" "}
          <a
            href={"/blog"}
            className="font-bold hover:text-secondary-foreground"
          >
            Browse all articles
          </a>{" "}
          to see everything the collection has to offer.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <BlogCard key={post.slug} {...post} />
        ))}
      </div>
    </div>
  )
}
