import fs from "node:fs"
import path from "node:path"
import { Readable } from "node:stream"
import type { Plugin, ResolvedConfig } from "vite"
import { defineConfig } from "vite"
import mdx from "@mdx-js/rollup"
import rehypeAddCodeBlock from "@renoun/mdx/rehype/add-code-block"
import react from "@vitejs/plugin-react"
import rsc from "@vitejs/plugin-rsc"
import remarkFrontmatter from "remark-frontmatter"
import remarkMdxFrontmatter from "remark-mdx-frontmatter"
import tsconfigPaths from "vite-tsconfig-paths"

import { RSC_POSTFIX } from "./src/framework/shared"

export default defineConfig({
  resolve: {
    alias: {
      "mdx-components": path.resolve(
        import.meta.dirname,
        "./src/mdx-components.tsx",
      ),
    },
  },
  plugins: [
    tsconfigPaths(),
    // inspect(),
    mdx({
      providerImportSource: "mdx-components",
      rehypePlugins: [rehypeAddCodeBlock],
      remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter],
    }),
    // mdx(),
    react(),
    rsc({
      entries: {
        client: "./src/framework/entry.browser.tsx",
        rsc: "./src/framework/entry.rsc.tsx",
        ssr: "./src/framework/entry.ssr.tsx",
      },
    }),
    rscSsgPlugin(),
  ],
})

function rscSsgPlugin(): Plugin[] {
  return [
    {
      name: "rsc-ssg",
      config: {
        order: "pre",
        handler(_config, env) {
          return {
            appType: env.isPreview ? "mpa" : undefined,
            rsc: {
              serverHandler: env.isPreview ? false : undefined,
            },
          }
        },
      },
      buildApp: {
        async handler(builder) {
          await renderStatic(builder.config)
        },
      },
    },
  ]
}

async function renderStatic(config: ResolvedConfig) {
  // import server entry
  const entryPath = path.join(config.environments.rsc.build.outDir, "index.js")
  const entry: typeof import("./src/framework/entry.rsc") = await import(
    entryPath
  )

  // // neue SSG-Path-Logik: sammle alle statischen Pfade
  const staticPaths = await entry.getStaticRoutes()

  // render rsc and html
  const baseDir = config.environments.client.build.outDir
  for (const staticPatch of staticPaths) {
    const { html, rsc } = await entry.handleSsg(
      new Request(new URL(staticPatch, "http://ssg.local")),
    )
    await writeFileStream(
      path.join(baseDir, normalizeHtmlFilePath(staticPatch)),
      html,
    )
    await writeFileStream(path.join(baseDir, staticPatch + RSC_POSTFIX), rsc)
  }
}

async function writeFileStream(filePath: string, stream: ReadableStream) {
  await fs.promises.mkdir(path.dirname(filePath), { recursive: true })
  await fs.promises.writeFile(filePath, Readable.fromWeb(stream as any))
}

function normalizeHtmlFilePath(p: string) {
  if (p.endsWith("/")) {
    return p + "index.html"
  }
  return p + ".html"
}
