export async function getStaticPath() {
  return ["category-1", "category-2", "category-3"].map((category) => ({
    category,
  }))
}

export default async function BlogPost({
  params,
}: {
  params: { category: string }
}) {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mb-12 max-w-3xl">
        <h1 className="mb-4 text-4xl font-bold md:text-5xl">
          Category {params.category}
        </h1>
      </div>
    </div>
  )
}
