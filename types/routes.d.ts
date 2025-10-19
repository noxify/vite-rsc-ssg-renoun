// AUTO-GENERATED FILE
export type PageProps<T extends string> =
  T extends '/blog/[slug]'
    ? { params: { slug: string }; searchParams?: URLSearchParams }
:  T extends '/catchall/[...slug]'
    ? { params: { slug: string[] }; searchParams?: URLSearchParams }
:  T extends '/tags/[slug]'
    ? { params: { slug: string }; searchParams?: URLSearchParams }
: never;
