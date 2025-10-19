# Vite RSC SSG Example with Renoun Integration

## Features

- **renoun**: Create engaging, interactive, and valid content with the renoun toolkit
- **Next.js-like routing** with dynamic parameters (`[slug]`, `[...slug]`)
- **Static Site Generation (SSG)** and **Server Side Rendering (SSR)**
- **Automatic route types**: Type-safe `PageProps<T>` for all routes
- **Param support for pages and layouts** (`params`, `searchParams`)
- **MDX with client & server components**

## Installation

```bash
git clone git@github.com:noxify/vite-rsc-ssg-renoun.git
cd vite-rsc-ssg-renoun
pnpm i
```

## Quick start

```bash
pnpm dev        # Development
pnpm build      # SSG/SSR build
pnpm preview    # Preview
```

## Additional Notes

- This repository is mainly an experiment to implement `renoun` in a Vite app. I highly recommend [Waku](https://waku.gg/), which is also built on top of Vite and works with `renoun`, too
- You should definitely check out [`vite-plugin-rsc-pages`](https://github.com/mrozio13pl/vite-plugin-rsc-pages) if you're looking for a Next.js app router-like page integration
- The router code is inspired by the Next.js implementation and was generated with GitHub Copilot
- This repository is based on the [SSG example from Vite](https://github.com/vitejs/vite-plugin-react/tree/main/packages/plugin-rsc/examples/ssg)
