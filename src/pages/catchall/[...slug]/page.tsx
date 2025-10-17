export function getStaticPath() {
  return [
    ["level1"],
    ["level1", "level2"],
    ["level1", "level2", "level3"],
  ]
}

export default function CatchAllPage({ params }: { params: { slug: string[] } }) {
  return (
    <div>
      <h2>Catch-All Route</h2>
      <p>Slug-Array: {JSON.stringify(params.slug)}</p>
      <p>Diese Seite matched beliebige verschachtelte Routen unter /catchall/…</p>
    </div>
  );
}
