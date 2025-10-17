import { BlogPostDirectory } from "@/collections"
import { BlogCard } from "@/components/blog-card"

export function getStaticPath() {
  return ["/"]
}

const getData = async () => {
  const postEntries = await BlogPostDirectory.getEntries()

  const formatter = new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
    timeZone: "UTC",
  })

  return Promise.all(
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
}

export default async function BlogIndex() {
  const posts = await getData()
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mb-12 max-w-3xl">
        <h1 className="mb-4 text-4xl font-bold md:text-5xl">All Articles</h1>
        <p className="text-lg leading-relaxed text-muted-foreground">
          A collection of thoughts, tutorials, and insights on web development,
          design, and technology.
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
