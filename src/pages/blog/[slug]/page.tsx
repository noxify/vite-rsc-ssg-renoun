
/**
 * SSG: Returns all blog slugs for static generation.
 * In practice, you could fetch from a database or API here.
 */
export async function getStaticParams() {
  return [
    { slug: 'erste' },
    { slug: 'zweite' },
  ];
}

export default function BlogPost({ params }: { params: { slug: string } }) {
  return (
    <article>
      <h1>Blog Post: {params.slug}</h1>
      <p>Hier könnte dein Blog-Content stehen.</p>
    </article>
  );
}