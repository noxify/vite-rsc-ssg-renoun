import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { ArrowRight } from "lucide-react"

interface BlogCardProps {
  slug: string
  title: string
  excerpt: string
  date: string
  category: string
}

export function BlogCard({
  slug,
  title,
  excerpt,
  date,
  category,
}: BlogCardProps) {
  return (
    <Card className="group transition-shadow hover:shadow-lg">
      <CardHeader>
        <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="rounded-md bg-secondary px-2 py-1">{category}</span>
          <span>•</span>
          <time>{date}</time>
        </div>
        <h3 className="text-xl leading-tight font-semibold transition-colors group-hover:text-accent">
          {title}
        </h3>
      </CardHeader>
      <CardContent>
        <p className="leading-relaxed text-muted-foreground">{excerpt}</p>
      </CardContent>
      <CardFooter>
        <a
          href={`/blog/${slug}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-accent"
        >
          Read more
          <ArrowRight
            size={16}
            className="transition-transform group-hover:translate-x-1"
          />
        </a>
      </CardFooter>
    </Card>
  )
}
