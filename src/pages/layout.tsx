import * as React from "react"
import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import { RootProvider } from "renoun/components"

import "@/styles.css"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RootProvider>
      <html lang="en">
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>Vite + RSC + next like routing + SSG</title>
        </head>
        <body>
          <>
            <Header />
            <main className="min-h-screen">{children}</main>
            <Footer />
          </>
        </body>
      </html>
    </RootProvider>
  )
}
