export function getStaticPath() {
  return ["first-post", "second-post"]
}

export default function BlogPost({ params }: { params: { slug: string } }) {
  return (
    <article>
      <h1>Blog Post: {params.slug}</h1>
      <p>example page with simple slug support</p>
    </article>
  );
}