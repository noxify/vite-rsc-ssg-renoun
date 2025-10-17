import { Directory, withSchema } from 'renoun/file-system'
import { z } from 'zod'


export const BlogPostDirectory = new Directory({
  path: 'posts',
  filter: '*.mdx',
  basePathname: null,
  loader: {
    mdx: withSchema(
      {
        frontmatter: z.object({
          title: z.string(),
          date: z.coerce.date(),
          summary: z.string().optional(),
          tags: z.array(z.string()).optional(),
        }),
      },
      (path) => import(`../posts/${path}.mdx`)
    ),
  },
  sort: 'frontmatter.date',
})