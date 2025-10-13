// import { BlogPostDirectory } from "#src/collections.ts";

export default async function getStaticParams() {

  // const posts = await BlogPostDirectory.getEntries()

  // const slugs = posts.map(post => ({ slug: post.getPathname() }));

  // console.dir({ slugs }, { depth: null });
  // return slugs

  return [
    { slug: 'erste' },
    { slug: 'zweite' },
  ];
}
