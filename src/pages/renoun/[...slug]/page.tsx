export function getStaticPath() {
  return [
    ["post-one"],
    ["category", "post-two"],
    ["category", "subcategory", "post-three"],
  ]
}

export default function RenounPost({ params }: { params: { slug: string[] } }) {
  return (
    <article>
      <h1>Renoun Post: {params.slug.join(" / ")}</h1>
      <p>Hier könnte dein Blog-Content stehen.</p>
    </article>
  );
}