// Liefert alle Blog-Slugs für SSG
export default async function getStaticParams() {
  // In der Praxis würdest du hier z.B. aus einer Datenbank oder API lesen
  return [
    { slug: 'erste' },
    { slug: 'zweite' },
  ];
}
