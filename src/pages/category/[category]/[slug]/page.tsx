export async function getStaticPath() {
  const categories = ["category-1", "category-2", "category-3"]
  const slugs = ["slug-1", "slug-2", "slug-3"]
  // Generate all combinations as objects
  return categories.flatMap((category) =>
    slugs.map((slug) => ({ category, slug })),
  )
}

export default async function BlogPost({
  params,
}: {
  params: { category: string; slug: string }
}) {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mb-12 max-w-3xl">
        <h1 className="mb-4 text-4xl font-bold md:text-5xl">
          Category {params.category} / Slug: {params.slug}
        </h1>
      </div>
    </div>
  )
}
