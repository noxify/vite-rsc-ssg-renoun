// import { BlogPostDirectory } from "#src/collections.ts";

export default async function BlogIndex() {

    // const posts = await BlogPostDirectory.getEntries()

    // console.dir({ posts }, { depth: null });
  return (
    <div>
      <h3>Blog Übersicht</h3>
      <ul>
        <li><a href="/blog/erste">Erster Beitrag</a></li>
        <li><a href="/blog/zweite">Zweiter Beitrag</a></li>
      </ul>
    </div>
  );
}