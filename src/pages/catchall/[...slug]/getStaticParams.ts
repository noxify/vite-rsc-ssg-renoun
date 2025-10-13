// Beispiel für Catch-All-SSG-Parameter
export default async function getStaticParams() {
  return [
    { slug: ['foo', 'bar'] },
    { slug: ['foo', 'baz'] },
  ];
}
