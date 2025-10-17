import * as React from "react";
import { RootProvider } from "renoun/components";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
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
          <header
            style={{ display: "flex", alignItems: "center", gap: "1rem" }}
          >
            <h1>
              <a href="/">Vite + RSC + next like routing + SSG</a>
            </h1>
          </header>
          <main style={{border: 2, padding: 4, margin: 4, borderColor: "#000", borderStyle: "solid" }}>
            <div>Root Layout</div>
            {children}
            </main>
        </body>
      </html>
    </RootProvider>
  );
}
