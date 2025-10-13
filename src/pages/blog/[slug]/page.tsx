export default function BlogPost({ params }: { params: { slug: string } }) {
  return (
    <article>
      <h1>Blog Post: {params.slug}</h1>
      <p>Hier könnte dein Blog-Content stehen.</p>
    </article>
  );
}