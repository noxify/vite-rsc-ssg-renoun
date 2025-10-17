export function getStaticPath() {
  return [["level1"], ["level1", "level2"], ["level1", "level2", "level3"]]
}

export default function CatchAllPage({
  params,
}: {
  params: { slug: string[] }
}) {
  return (
    <div>
      <h2>Catch-All Route</h2>
      <p>Slug-Array: {JSON.stringify(params.slug)}</p>
      <p>Example to show a catchall route.</p>
      <ul>
        <li>
          <a href="/catchall/level1">Catch all - one level</a>
        </li>
        <li>
          <a href="/catchall/level1/level2">Catch all - two level</a>
        </li>
        <li>
          <a href="/catchall/level1/level2/level3">Catch all - three level</a>
        </li>
      </ul>
    </div>
  )
}
