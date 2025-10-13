// Liefert alle Blog-Slugs für SSG
export default async function getStaticParams() {
  // In der Praxis würdest du hier z.B. aus einer Datenbank oder API lesen
  return [
    { slug: 'one' },
    { slug: 'two' },
    { slug: 'three' },
    { slug: 'four' },
    { slug: 'five' },
    { slug: 'six' },
    { slug: 'seven' },
    { slug: 'eight' },
    { slug: 'nine' },
    { slug: 'ten' },
  ];
}
