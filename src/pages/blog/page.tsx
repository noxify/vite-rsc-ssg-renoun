export function getStaticPath() {
  return ["blog"]
}

export default async function BlogIndex() {
  return (
    <div>
      <h3>Blog overview</h3>
      <ul>
        <li>
          <a href="/blog/first">first blog entry</a>
        </li>
        <li>
          <a href="/blog/second">second blog entry</a>
        </li>
      </ul>
    </div>
  );
}
