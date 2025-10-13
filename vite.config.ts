import fs from 'node:fs'
import path from 'node:path'
import { Readable } from 'node:stream'
import { pathToFileURL } from 'node:url'
import rsc from '@vitejs/plugin-rsc'
import mdx from '@mdx-js/rollup'
import react from '@vitejs/plugin-react'
import { type Plugin, type ResolvedConfig, defineConfig } from 'vite'

import { RSC_POSTFIX, PAGES_DIR } from './src/framework/shared'
import { collectStaticPaths } from './src/framework/utils'

import rehypeAddCodeBlock from '@renoun/mdx/rehype/add-code-block'
import remarkFrontmatter from 'remark-frontmatter'
import remarkMdxFrontmatter from 'remark-mdx-frontmatter'
export default defineConfig({
  resolve: {
    alias: {
      "app-mdx-components": path.resolve(__dirname, "./src/mdx-components.tsx"),
      "#src": path.resolve(__dirname, "./src"),

    },
  },
  plugins: [
    // inspect(),
    mdx({
      providerImportSource: 'app-mdx-components',
      rehypePlugins: [rehypeAddCodeBlock],
      remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter],
    }),
    // mdx(),
    react(),
    rsc({
      entries: {
        client: './src/framework/entry.browser.tsx',
        rsc: './src/framework/entry.rsc.tsx',
        ssr: './src/framework/entry.ssr.tsx',
      },
    }),
    rscSsgPlugin(),
  ],
  
})

function rscSsgPlugin(): Plugin[] {
  return [
    {
      name: 'rsc-ssg',
      config: {
        order: 'pre',
        handler(_config, env) {
          return {
            appType: env.isPreview ? 'mpa' : undefined,
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
  const entryPath = path.join(config.environments.rsc.build.outDir, 'index.js')
  const entry: typeof import('./src/framework/entry.rsc') = await import(
    pathToFileURL(entryPath).href
  )

  // neue SSG-Path-Logik: sammle alle statischen Pfade
  const staticPaths = await collectStaticPaths(PAGES_DIR)

  // render rsc and html
  const baseDir = config.environments.client.build.outDir
  for (const staticPatch of staticPaths) {
    const { html, rsc } = await entry.handleSsg(
      new Request(new URL(staticPatch, 'http://ssg.local')),
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
  if (p.endsWith('/')) {
    return p + 'index.html'
  }
  return p + '.html'
}
