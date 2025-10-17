import { BlogPostDirectory } from "@/collections"
import { BlogCard } from "@/components/blog-card"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export async function getStaticPath() {
  return ["/"]
}

const getData = async () => {
  const postEntries = (await BlogPostDirectory.getEntries()).slice(0, 3)

  const formatter = new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
    timeZone: "UTC",
  })

  return await Promise.all(
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

export default async function HomePage() {
  const posts = await getData()
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-3xl">
          <h1 className="mb-6 text-4xl leading-tight font-bold text-balance md:text-6xl">
            Thoughts on design, development, and everything in between
          </h1>
          <p className="mb-8 text-lg leading-relaxed text-muted-foreground md:text-xl">
            Exploring the intersection of technology, creativity, and user
            experience. Join me as I share insights, tutorials, and reflections
            on building better digital products.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button asChild size="lg">
              <a href="/blog/">
                Explore Articles
                <ArrowRight className="ml-2" size={20} />
              </a>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="/about/">About Me</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Latest Posts Section */}
      <section className="container mx-auto border-t border-border px-4 py-16">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-3xl font-bold">Latest Articles</h2>
          <Button asChild variant="ghost">
            <a href="/blog/" className="flex items-center gap-2">
              View all
              <ArrowRight size={16} />
            </a>
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <BlogCard key={post.slug} {...post} />
          ))}
        </div>
      </section>
    </div>
  )
}
